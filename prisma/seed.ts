// Safe to re-run: only creates missing rows and never overwrites admin edits.
import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, FaqCategory } from "../src/generated/prisma/client";
import { fileExists, putFile, publicUrl } from "../src/lib/storage";
import { seedSuperAdmin } from "./super-admin";

if (existsSync(".env")) process.loadEnvFile(".env");

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const SITE = "https://astroarrox.com/assets";
const PRODUCT_IMG = `${SITE}/uploads/products/`;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Downloads once. Returns null on failure so the UI shows a placeholder. */
async function download(url: string, key: string): Promise<string | null> {
  if (await fileExists(key)) return publicUrl(key);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    const type = res.headers.get("content-type")?.split(";")[0].trim() ?? "";
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!ALLOWED_TYPES.includes(type)) throw new Error(`unexpected type "${type}"`);
    const saved = await putFile(key, new Uint8Array(await res.arrayBuffer()));
    console.log(`  ↓ ${key}`);
    return saved;
  } catch (err) {
    console.warn(`  ! could not download ${url} (${(err as Error).message}); using placeholder`);
    return null;
  }
}

const ext = (file: string) => file.split(".").pop()!.toLowerCase();

const categories = [
  { name: "Drone Accessories", slug: "drone-accessories", image: "category_69aaf01dd49ce_1772810269.jpg" },
  { name: "Radio Controller", slug: "radio-controller", image: "category_6a61aea673288_1784786598.jpg" },
  { name: "RC Planes", slug: "rc-planes", image: "category_6a61ae7e3ed51_1784786558.webp" },
  { name: "3D Printing", slug: "3d-printing", image: "category_6a61b0b9d93c6_1784787129.jpg" },
  { name: "Robotics Accessories", slug: "robotics-accessories", image: "category_6a61b088458a9_1784787080.jpg" },
  { name: "Electronics & Sensors", slug: "electronics-sensors", image: "category_6a6857011b5b5_1785222913.webp" },
];

type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  isNew: boolean;
  isFeatured: boolean;
  image: string | null;
  description: string;
};

// Oldest → newest; createdAt is spaced out below so "Newest" sorting matches.
// CONFIRM: descriptions are placeholders until real copy is added in admin.
const products: SeedProduct[] = [
  {
    name: "FlySky Radio Controller",
    slug: "flysky-radio-controller",
    sku: "FLYSKY-RC",
    category: "radio-controller",
    price: 6500, compareAtPrice: 6600, stock: 1, isNew: false, isFeatured: false,
    image: "product_13_6a60664cd47fe_1784702540.jpg",
    description: "A FlySky radio transmitter for flying RC planes, drones and other radio-controlled models.",
  },
  {
    name: "SpeedyBee F405 WING Fixed Wing Flight Controller",
    slug: "speedybee-f405-wing-flight-controller",
    sku: "SB-F405-WING",
    category: "drone-accessories",
    price: 6500, compareAtPrice: 7000, stock: 2, isNew: false, isFeatured: false,
    image: "product_14_6a606b3dd2e36_1784703805.jpg",
    description: "The SpeedyBee F405 WING flight controller, made for fixed-wing RC aircraft.",
  },
  {
    name: "DIY Mini RC Drone Kit 2.4GHz with 5.8G FPV",
    slug: "diy-mini-rc-drone-kit-fpv",
    sku: "DIY-MINI-DRONE",
    category: "drone-accessories",
    price: 3000, compareAtPrice: 3500, stock: 5, isNew: false, isFeatured: false,
    image: "product_15_6a606ed99ef86_1784704729.webp",
    description:
      "A build-it-yourself mini drone kit with 2.4GHz radio control and 5.8G FPV. A hands-on way to learn how drones are put together.",
  },
  {
    name: "Drone Accessories Combo (4× Motor, 4× ESC, 2× 1045 Propeller, F450 Frame, Strap Belt)",
    slug: "drone-accessories-combo-f450",
    sku: "DRONE-COMBO-F450",
    category: "drone-accessories",
    price: 5300, compareAtPrice: 5500, stock: 5, isNew: false, isFeatured: true,
    image: "product_16_6a6073672fc9f_1784705895.webp",
    description:
      "The main parts for a quadcopter build in one bundle: four motors, four ESCs, two 1045 propellers, an F450 frame and a strap belt.",
  },
  {
    name: "Arduino Nano V3.0 USB-C",
    slug: "arduino-nano-v3-usb-c",
    sku: "ARD-NANO-V3C",
    category: "robotics-accessories",
    price: 500, compareAtPrice: null, stock: 7, isNew: false, isFeatured: false,
    image: null,
    description: "A compact Arduino Nano V3.0 board with a USB-C port, for breadboard projects, prototypes and learning electronics.",
  },
  {
    name: "Custom Built Ready-to-Fly Plane",
    slug: "custom-built-ready-to-fly-plane",
    sku: "RTF-PLANE",
    category: "rc-planes",
    price: 8000, compareAtPrice: 9000, stock: 5, isNew: false, isFeatured: false,
    image: "product_18_6a61ae68890c5_1784786536.webp",
    description: "A custom-built RC plane that comes ready to fly.",
  },
  {
    name: "Arduino UNO Q",
    slug: "arduino-uno-q",
    sku: "arduino",
    category: "electronics-sensors",
    price: 7000, compareAtPrice: 8000, stock: 4, isNew: true, isFeatured: true,
    image: "product_19_6a685a67f3000_1785223783.webp",
    description: "The Arduino UNO Q development board, for makers, students and embedded projects.",
  },
  {
    name: "EDF Motor 3400KV",
    slug: "edf-motor-3400kv",
    sku: "EDF-3400KV",
    category: "rc-planes",
    price: 4500, compareAtPrice: 5000, stock: 5, isNew: true, isFeatured: false,
    image: "product_20_6a6d8e25ac946_1785564709.jpg",
    description: "A 3400KV motor for electric ducted fan (EDF) RC aircraft.",
  },
  {
    name: "Raspberry Pi 5, 8GB",
    slug: "raspberry-pi-5-8gb",
    sku: "RPI5-8GB",
    category: "electronics-sensors",
    price: 29000, compareAtPrice: 31000, stock: 5, isNew: true, isFeatured: true,
    image: "product_21_6a6d909603fd7_1785565334.jpg",
    description: "The Raspberry Pi 5 single-board computer with 8GB of RAM, for projects, learning and prototyping.",
  },
  {
    name: "Raspberry Pi 4 Computer",
    slug: "raspberry-pi-4-computer",
    sku: "RPI4",
    category: "electronics-sensors",
    price: 14000, compareAtPrice: 15000, stock: 5, isNew: true, isFeatured: false,
    image: "product_22_6a6d93da5ea4a_1785566170.jpg",
    description: "The Raspberry Pi 4 single-board computer, for projects, learning and home lab use.",
  },
  {
    name: "Servo Motor Micro MG90S 360° Continuous Rotation",
    slug: "servo-mg90s-360-continuous",
    sku: "MG90S-360",
    category: "robotics-accessories",
    price: 440, compareAtPrice: 500, stock: 4, isNew: false, isFeatured: false,
    image: null,
    description: "A micro MG90S servo set up for 360° continuous rotation, handy for small robots and moving parts.",
  },
];

// {{placeholders}} are filled from Settings at render time.
const faqs: { category: FaqCategory; question: string; answer: string }[] = [
  { category: "ORDERS_PAYMENTS", question: "What payment methods do you accept?", answer: "Cash on Delivery only for now. You pay when your order arrives." },
  { category: "ORDERS_PAYMENTS", question: "Can I change or cancel my order?", answer: "Yes, within 1 hour of placing it. Message us on WhatsApp with your order reference as soon as possible." },
  { category: "ORDERS_PAYMENTS", question: "Do I need an account to order?", answer: "Yes. [Create a free account](/signup) (or [log in](/login)), then check out with your name, phone and address. Your orders are saved in your account." },
  { category: "SHIPPING_DELIVERY", question: "How long does delivery take?", answer: "Usually {{deliveryTime}} after your order is confirmed." },
  { category: "SHIPPING_DELIVERY", question: "How much is shipping?", answer: "{{insideDhakaFee}} inside Dhaka and {{outsideDhakaFee}} elsewhere in Bangladesh. Shipping is free on orders of {{freeShippingThreshold}} or more." },
  { category: "SHIPPING_DELIVERY", question: "Do you deliver outside Bangladesh?", answer: "Currently we deliver within Bangladesh only. Contact us for special requests." },
  { category: "SHIPPING_DELIVERY", question: "How do I track my order?", answer: "Use the [Track Order](/track-order) page with your order reference and phone number." },
  { category: "RETURNS_WARRANTY", question: "What is your return policy?", answer: "Returns are accepted within 30 days of delivery for unused items in their original packaging." },
  { category: "RETURNS_WARRANTY", question: "What does the warranty cover?", answer: "A 1-year limited warranty against manufacturing defects. Accidental damage, misuse and normal wear aren't covered." },
  { category: "RETURNS_WARRANTY", question: "How do I make a warranty claim?", answer: "Contact us with your order reference and clear photos or a video of the problem." },
  { category: "PRODUCTS_STOCK", question: "Is everything listed in stock?", answer: "Each product page shows live stock. If something is out of stock, message us on WhatsApp to ask about a restock." },
  { category: "PRODUCTS_STOCK", question: "Do you offer bulk pricing?", answer: "Yes. For 10+ units of any product, contact us for a quote." },
  { category: "PRODUCTS_STOCK", question: "Can I get technical help with a product?", answer: "Yes. Reach us on WhatsApp or through the [Contact](/contact) page." },
];

const pages = [
  {
    slug: "our-story",
    title: "Our Story",
    body: `AstroArrox was started by a small team of engineers and hobbyists who wanted the parts they rely on to be easier to get in Bangladesh.

## Our mission

To make professional electronics and drone technology accessible at fair prices, for makers, students and professionals.

## What we value

**Innovation First.** We stock the tools and components people use to build what comes next.

**Uncompromising Quality.** We only list products we would trust in our own builds.

**Community Driven.** We learn from the builders we serve, and we're always happy to help with a project.

[Explore Our Products](/shop)
`,
  },
  {
    slug: "shipping-returns",
    title: "Shipping & Returns",
    body: `## Shipping

- Orders are processed within 1–2 business days.
- Delivery usually takes {{deliveryTime}} after your order is confirmed.
- Shipping costs {{insideDhakaFee}} inside Dhaka and {{outsideDhakaFee}} elsewhere in Bangladesh.
- Shipping is free on orders of {{freeShippingThreshold}} or more.
- Payment is Cash on Delivery. You pay when your order arrives.

## Returns

**Return window:** 30 days from delivery.

**Condition:** items must be unused and in their original packaging with all accessories, along with proof of purchase (your order reference).

**Not returnable:**

- Custom-configured products
- Software licences
- Items marked Final Sale

**How to return:** contact us with your order reference and the reason for the return, and we'll arrange it.

## Refunds

Refunds are processed within 3–5 business days after we inspect the returned item, via bKash, Nagad or bank transfer.
`,
  },
  {
    slug: "warranty",
    title: "Warranty",
    body: `## Coverage

Every product comes with a 1-year warranty against manufacturing defects. If something fails, we repair or replace it at no cost, usually within 5–7 business days.

## What's covered

- Defects in materials and workmanship
- Component failures under normal use
- Dead on arrival (replaced right away)
- Firmware issues from the original device

## What's not covered

- Crashes, drops and misuse
- Water damage
- Unauthorised modifications
- Wear items such as propellers and batteries
- Accessories not bought from AstroArrox

## How to make a claim

1. [Contact us](/contact).
2. Send clear photos or a video of the problem.
3. We reply within 1 business day.
4. We repair or replace the item and ship it back to you free.
`,
  },
];

async function seedSettings() {
  console.log("Settings");
  const brand = {
    logoLightUrl: await download(`${SITE}/images/brand/logo-horizontal.png`, "brand/logo-light.png"),
    logoDarkUrl: await download(`${SITE}/images/brand/logo-dark-horizontal.png`, "brand/logo-dark.png"),
    logoSquareUrl: await download(`${SITE}/uploads/media/logo_1772365323_a04faa87592db372.png`, "brand/logo-square.png"),
    heroImageUrl: await download(`${SITE}/images/banner/hero-banner.jpg`, "brand/hero-banner.jpg"),
  };

  const existing = await db.setting.findUnique({ where: { id: 1 } });
  if (!existing) {
    await db.setting.create({
      data: {
        id: 1,
        storeName: "AstroArrox",
        whatsappNumber: "01952018404",
        email: "masnunfahim@gmail.com",
        address: "Bank Colony Gym Center, Chayabithi, Narsingdi Sadar, Narsingdi",
        facebookUrl: "https://www.facebook.com/share/1Hz1kxpc2m/",
        youtubeUrl: "https://youtube.com/@rcbangladesh3312",
        insideDhakaFee: 100,
        outsideDhakaFee: 100,
        freeShippingThreshold: 1500,
        deliveryTimeText: "5–7 business days",
        promoText: "Free shipping over {{freeShippingThreshold}}",
        heroHeadline: "Technologies of the Future",
        heroSubtext: "Drones, robotics, embedded systems and R&D components.",
        ...brand,
      },
    });
    return;
  }
  // Fill in any brand images that failed to download on an earlier run.
  const missing = Object.fromEntries(
    Object.entries(brand).filter(([field, url]) => url && !existing[field as keyof typeof brand]),
  );
  if (Object.keys(missing).length) await db.setting.update({ where: { id: 1 }, data: missing });
}

async function seedCatalogue() {
  console.log("Categories");
  const categoryIds = new Map<string, string>();
  for (const [i, c] of categories.entries()) {
    let row = await db.category.findUnique({ where: { slug: c.slug } });
    if (!row) {
      const imageUrl = await download(`${SITE}/uploads/categories/${c.image}`, `categories/${c.slug}.${ext(c.image)}`);
      row = await db.category.create({ data: { name: c.name, slug: c.slug, imageUrl, sortOrder: i } });
    }
    categoryIds.set(c.slug, row.id);
  }

  console.log("Products");
  const start = Date.now() - products.length * 24 * 60 * 60 * 1000;
  for (const [i, p] of products.entries()) {
    if (await db.product.findUnique({ where: { slug: p.slug } })) continue;
    const imageUrl = p.image ? await download(PRODUCT_IMG + p.image, `products/${p.slug}.${ext(p.image)}`) : null;
    await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        categoryId: categoryIds.get(p.category)!,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        description: p.description,
        isNew: p.isNew,
        isFeatured: p.isFeatured,
        createdAt: new Date(start + i * 24 * 60 * 60 * 1000),
        images: imageUrl ? { create: { url: imageUrl, alt: p.name, sortOrder: 0 } } : undefined,
      },
    });
  }
}

async function seedContent() {
  console.log("Pages & FAQ");
  for (const page of pages) {
    await db.page.upsert({ where: { slug: page.slug }, create: page, update: {} });
  }
  if ((await db.faqItem.count()) === 0) {
    await db.faqItem.createMany({ data: faqs.map((f, i) => ({ ...f, sortOrder: i })) });
  }
}

async function main() {
  await seedSettings();
  await seedCatalogue();
  await seedContent();
  await seedSuperAdmin(db);
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
