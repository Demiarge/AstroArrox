"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { MAX_LINES, MAX_PENDING_ORDERS, MAX_PENDING_UNITS, MAX_PER_LINE } from "@/lib/cart/limits";
import { CATALOG_TAG } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { db } from "@/lib/db";
import { DISTRICTS } from "@/lib/districts";
import { generateOrderRef } from "@/lib/orders";
import { hitRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { shippingFee } from "@/lib/shipping";
import { getCurrentUser } from "@/lib/user-auth";
import { fieldErrorState, optionalEmail, phoneSchema, type FormState } from "@/lib/validation";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: phoneSchema,
  email: optionalEmail,
  district: z.enum(DISTRICTS, "Please choose your district"),
  address: z.string().trim().min(8, "Please enter your full address (house, road, area)").max(500),
  notes: z.string().trim().max(500, "Keep notes under 500 characters"),
  // `price` and `total` are what the customer saw: compared, never trusted.
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(40),
        quantity: z.number().int().min(1).max(MAX_PER_LINE),
        price: z.number().int().min(0),
      }),
    )
    .min(1, "Your cart is empty")
    .max(MAX_LINES, `Your cart can hold up to ${MAX_LINES} different products.`),
  total: z.string().regex(/^\d+$/).transform(Number),
});

/** Rolls back the transaction with a customer-facing message. */
class CheckoutProblem extends Error {}

export type PlaceOrderResult = FormState<{ ref: string }>;

export async function placeOrder(_prev: PlaceOrderResult, formData: FormData): Promise<PlaceOrderResult> {
  // Checked here too, not just on the page, so a hand-made request can't skip login.
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    items = [];
  }

  const parsed = checkoutSchema.safeParse({
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    district: formData.get("district") ?? "",
    address: formData.get("address") ?? "",
    notes: formData.get("notes") ?? "",
    items,
    total: formData.get("total") ?? "",
  });
  if (!parsed.success) {
    // Cart errors have no field to highlight, so show them as the main message.
    const cartError = parsed.error.issues.find((i) => i.path[0] === "items" && i.path.length === 1)?.message;
    return fieldErrorState(parsed.error, cartError);
  }
  const input = parsed.data;

  const ip = await getClientIp();
  if (!(await hitRateLimit(`checkout:${ip}`, 10, 60 * 60 * 1000)).ok) {
    return { status: "error", message: "Too many orders from this connection. Please try again later or message us on WhatsApp." };
  }

  const wanted = new Map<string, number>();
  const seenPrice = new Map<string, number>();
  for (const i of input.items) {
    wanted.set(i.productId, (wanted.get(i.productId) ?? 0) + i.quantity);
    if (!seenPrice.has(i.productId)) seenPrice.set(i.productId, i.price);
  }
  if ([...wanted.values()].some((qty) => qty > MAX_PER_LINE)) {
    return { status: "error", message: `You can order up to ${MAX_PER_LINE} of each product. Please lower the quantity.` };
  }
  const units = [...wanted.values()].reduce((n, qty) => n + qty, 0);

  const settings = await getSettings();

  let placedRef: string;
  try {
    placedRef = await db.$transaction(async (tx) => {
      // Lock the user row so parallel checkouts can't all pass the pending-order cap.
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id} FOR UPDATE`;
      const pending = await tx.order.findMany({
        where: { userId: user.id, status: "PENDING" },
        select: { items: { select: { quantity: true } } },
      });
      if (pending.length >= MAX_PENDING_ORDERS) {
        throw new CheckoutProblem(
          `You already have ${pending.length} orders waiting for confirmation. We’ll call you about them soon; after that you can order again, or message us on WhatsApp.`,
        );
      }
      const pendingUnits = pending.reduce((n, o) => n + o.items.reduce((m, i) => m + i.quantity, 0), 0);
      if (pendingUnits + units > MAX_PENDING_UNITS) {
        throw new CheckoutProblem(
          pendingUnits === 0
            ? `An order can have up to ${MAX_PENDING_UNITS} items until we confirm it. Please lower the quantities, or message us on WhatsApp for a bigger order.`
            : `You have ${pendingUnits} items in orders waiting for confirmation, so this order can have up to ${Math.max(0, MAX_PENDING_UNITS - pendingUnits)}. Please lower the quantities, or message us on WhatsApp.`,
        );
      }

      const products = await tx.product.findMany({
        where: { id: { in: [...wanted.keys()] }, isActive: true, category: { isActive: true } },
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true,
          images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        },
      });
      const byId = new Map(products.map((p) => [p.id, p]));

      const problems: string[] = [];
      for (const [id, qty] of wanted) {
        const p = byId.get(id);
        if (!p) problems.push("One of the items in your cart is no longer available.");
        else if (p.stock <= 0) problems.push(`“${p.name}” just sold out.`);
        else if (p.stock < qty) problems.push(`Only ${p.stock} of “${p.name}” left. Please lower the quantity.`);
        else if (p.price !== seenPrice.get(id)) problems.push(`The price of “${p.name}” has changed.`);
      }
      if (problems.length) throw new CheckoutProblem(`${problems.join(" ")} Please review your order and try again.`);

      const lines = [...wanted].map(([id, quantity]) => ({ product: byId.get(id)!, quantity }));
      const subtotal = lines.reduce((n, l) => n + l.product.price * l.quantity, 0);
      const fee = shippingFee(subtotal, input.district, settings);
      // Never charge a total the customer didn't see (e.g. the fee changed meanwhile).
      if (subtotal + fee !== input.total) {
        throw new CheckoutProblem("Your order total has changed. Please review the updated total and try again.");
      }

      // Guarded so parallel orders can't oversell.
      for (const { product, quantity } of lines) {
        const res = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (res.count === 0) throw new CheckoutProblem(`“${product.name}” just sold out.`);
      }

      let ref = generateOrderRef();
      while (await tx.order.findUnique({ where: { ref }, select: { id: true } })) ref = generateOrderRef();

      await tx.order.create({
        data: {
          ref,
          userId: user.id,
          customerName: input.name,
          phone: input.phone,
          email: input.email || null,
          district: input.district,
          address: input.address,
          notes: input.notes || null,
          subtotal,
          shippingFee: fee,
          total: subtotal + fee,
          items: {
            create: lines.map(({ product, quantity }) => ({
              productId: product.id,
              productName: product.name,
              productSku: product.sku,
              unitPrice: product.price,
              quantity,
              imageUrl: product.images[0]?.url ?? null,
            })),
          },
          history: { create: { status: "PENDING", note: "Order placed" } },
        },
      });
      return ref;
    });
  } catch (err) {
    if (err instanceof CheckoutProblem) return { status: "error", message: err.message };
    if (err instanceof Prisma.PrismaClientKnownRequestError) console.error("Checkout failed", err.code, err.message);
    else console.error("Checkout failed", err);
    return { status: "error", message: "Something went wrong placing your order. Please try again." };
  }

  // The order is saved: don't report a failure past this point, or they'd order twice.
  updateTag(CATALOG_TAG);
  return { status: "success", data: { ref: placedRef } };
}
