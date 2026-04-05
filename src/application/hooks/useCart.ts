import { useState, useCallback, useEffect } from 'react';
import type { Product } from '../../domain/entities/Product';
import type { CartItem } from '../../domain/entities/Cart';
import { useCalculatePrice } from './useCalculatePrice';

/** Debounce delay in ms before triggering a price recalculation after a cart change. */
const DEBOUNCE_MS = 600;

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const {
    mutate,
    data: priceBreakdown,
    isPending,
    error,
    reset,
  } = useCalculatePrice();

  // Stable fingerprint of the cart — only re-triggers the effect when
  // the actual basket content changes (not on every unrelated render).
  const cartKey = items
    .map((i) => `${i.product.id}:${i.quantity}`)
    .sort()
    .join(',');

  /**
   * Debounced auto-recalculation.
   * Any cart mutation cancels the previous pending timer and schedules a fresh
   * API call 600ms later, preventing a flood of requests while the user is
   * rapidly adding / removing items.
   */
  useEffect(() => {
    if (items.length === 0) {
      reset(); // clear stale price when cart is emptied
      return;
    }
    const timer = setTimeout(() => mutate(items), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // cartKey guarantees a stable identity of the cart content.
    // mutate and reset are stable references from TanStack Query v5.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey, mutate, reset]);

  // ── Cart mutations ──────────────────────────────────────────────────────

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    reset();
  }, [reset]);

  /** Manually trigger a price recalculation (e.g. "Recalculer" button). */
  const recalculate = useCallback(() => {
    if (items.length > 0) mutate(items);
  }, [items, mutate]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    items,
    totalItems,
    priceBreakdown: items.length === 0 ? undefined : priceBreakdown,
    isPriceLoading: isPending,
    priceError: error as Error | null,
    recalculate,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
