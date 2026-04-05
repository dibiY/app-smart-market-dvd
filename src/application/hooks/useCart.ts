import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '../../domain/entities/Product';
import type { CartItem } from '../../domain/entities/Cart';
import { calculateCartPriceUseCase } from '../di';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  // Stable serialized key so TanStack Query re-fetches on any change
  const cartKey = items
    .map((i) => `${i.product.id}:${i.quantity}`)
    .sort()
    .join(',');

  const priceQuery = useQuery({
    queryKey: ['cart-price', cartKey],
    queryFn: () => calculateCartPriceUseCase.execute(items),
    enabled: items.length > 0,
    staleTime: 0,
    placeholderData: undefined,
  });

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

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const priceBreakdown = items.length === 0 ? undefined : priceQuery.data;

  return {
    items,
    totalItems,
    priceBreakdown,
    isPriceLoading: priceQuery.isFetching,
    priceError: priceQuery.error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
