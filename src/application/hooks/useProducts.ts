import { useQuery } from '@tanstack/react-query';
import { getProductsUseCase } from '../di';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => getProductsUseCase.execute(),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
