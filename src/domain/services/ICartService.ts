import type { CartItem } from '../entities/Cart';
import type { PriceBreakdown } from '../entities/PriceBreakdown';

export interface ICartService {
  calculatePrice(items: CartItem[]): Promise<PriceBreakdown>;
}
