"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MAX_LINES, MAX_PER_LINE } from "@/lib/cart/limits";

export { MAX_LINES, MAX_PER_LINE };

// Prices here are display-only; checkout re-reads them from the database.
export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  stock: number;
  quantity: number;
};

export type CartProduct = Omit<CartItem, "quantity">;

export type CartSnapshot = CartProduct;

type CartState = {
  items: CartItem[];
  drawerOpen: boolean;
  hydrated: boolean;
  add: (product: CartProduct, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  /** Returns true if anything visible changed. */
  sync: (snapshots: CartSnapshot[]) => boolean;
};

const clampQty = (qty: number, stock: number) => Math.max(0, Math.min(Math.floor(qty), stock, MAX_PER_LINE));

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,
      hydrated: false,

      add: (product, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === product.productId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === product.productId
                  ? { ...i, ...product, quantity: clampQty(i.quantity + quantity, product.stock) || i.quantity }
                  : i,
              ),
            };
          }
          const qty = clampQty(quantity, product.stock);
          // Ignored when full; the drawer shows a message for that.
          return qty > 0 && s.items.length < MAX_LINES ? { items: [...s.items, { ...product, quantity: qty }] } : s;
        }),

      setQuantity: (productId, quantity) =>
        set((s) => ({
          items: s.items.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, clampQty(quantity, i.stock)) } : i)),
        })),

      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),

      sync: (snapshots) => {
        const byId = new Map(snapshots.map((s) => [s.productId, s]));
        let changed = false;
        const items = get().items.flatMap((item) => {
          const fresh = byId.get(item.productId);
          if (!fresh || fresh.stock <= 0) {
            changed = true;
            return [];
          }
          const quantity = Math.max(1, clampQty(item.quantity, fresh.stock));
          if (fresh.price !== item.price || quantity !== item.quantity || fresh.name !== item.name) changed = true;
          const { productId, slug, name, price, compareAtPrice, imageUrl, stock } = fresh;
          return [{ productId, slug, name, price, compareAtPrice, imageUrl, stock, quantity }];
        });
        set({ items });
        return changed;
      },
    }),
    {
      name: "astroarrox-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      // Hydrated by CartHydrator after mount to avoid SSR mismatches.
      skipHydration: true,
      onRehydrateStorage: () => () => useCart.setState({ hydrated: true }),
    },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.price * i.quantity, 0);
