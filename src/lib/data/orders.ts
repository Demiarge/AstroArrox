import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/user-auth";

/** Returns the full order: check isOwnOrder first. */
export async function getOrderByRef(ref: string) {
  return db.order.findUnique({
    where: { ref },
    select: {
      ref: true,
      status: true,
      paymentMethod: true,
      customerName: true,
      phone: true,
      email: true,
      district: true,
      address: true,
      notes: true,
      subtotal: true,
      shippingFee: true,
      total: true,
      createdAt: true,
      items: {
        select: { id: true, productName: true, productSku: true, unitPrice: true, quantity: true, imageUrl: true, product: { select: { slug: true } } },
      },
      history: { select: { id: true, status: true, note: true, createdAt: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

export type CustomerOrder = NonNullable<Awaited<ReturnType<typeof getOrderByRef>>>;

export async function isOwnOrder(ref: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return (await db.order.count({ where: { ref, userId: user.id } })) > 0;
}

export async function getUserOrders(userId: string) {
  return db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { ref: true, status: true, total: true, createdAt: true, _count: { select: { items: true } } },
  });
}
