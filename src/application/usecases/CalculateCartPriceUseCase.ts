import type { CartItem } from '../../domain/entities/Cart';
import type { PriceBreakdown } from '../../domain/entities/PriceBreakdown';
import type { ICartService } from '../../domain/services/ICartService';

export class CalculateCartPriceUseCase {
  constructor(private readonly service: ICartService) {}

  execute(items: CartItem[]): Promise<PriceBreakdown> {
    return this.service.calculatePrice(items);
  }
}
