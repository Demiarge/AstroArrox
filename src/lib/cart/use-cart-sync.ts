"use client";

import { useEffect, useState } from "react";
import { getCartSnapshots } from "@/lib/actions/cart";
import { useCart } from "@/lib/cart/store";

/** Refreshes cart prices and stock from the server. Returns true if anything changed. */
export function useCartSync(trigger: unknown = null) {
  const hydrated = useCart((s) => s.hydrated);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const ids = useCart.getState().items.map((i) => i.productId);
    if (ids.length === 0) return;
    let cancelled = false;
    getCartSnapshots(ids)
      .then((snapshots) => {
        if (!cancelled && snapshots && useCart.getState().sync(snapshots)) setChanged(true);
      })
      .catch(() => {
        /* offline: checkout re-validates anyway */
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, trigger]);

  return changed;
}
