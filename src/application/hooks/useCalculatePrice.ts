import { useMutation } from '@tanstack/react-query';
import type { CartItem } from '../../domain/entities/Cart';
import { calculateCartPriceUseCase } from '../di';

/**
 * Mutation hook for the /cart/price endpoint.
 *
 * Uses useMutation (not useQuery) because price calculation is a side-effectful
 * POST request triggered by user actions, not a passive data fetch.
 *
 * Usage:
 *   const { mutate, data, isPending, error } = useCalculatePrice();
 *   mutate(cartItems);  // trigger manually or via debounce in useCart
 */
export function useCalculatePrice() {
  return useMutation({
    mutationFn: (items: CartItem[]) => calculateCartPriceUseCase.execute(items),
  });
}
