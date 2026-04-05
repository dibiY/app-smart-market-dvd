import { ApiClient } from '../api/ApiClient';
import { PriceBreakdownMapper, type PriceBreakdownDto } from '../mappers/PriceBreakdownMapper';
import type { CartItem } from '../../domain/entities/Cart';
import type { PriceBreakdown, DiscountLine } from '../../domain/entities/PriceBreakdown';
import type { ICartService } from '../../domain/services/ICartService';

/** Local fallback price calculation (mirrors server business rules). */
function computeLocalPrice(items: CartItem[]): PriceBreakdown {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const bttfItems = items.filter((i) => i.product.category === 'bttf');
  const distinctBttfIds = new Set(bttfItems.map((i) => i.product.id));
  const bttfSubtotal = bttfItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  let pct = 0;
  let label = '';
  if (distinctBttfIds.size >= 3) {
    pct = 20;
    label = 'Saga BTTF Discount -20% (3 volets)';
  } else if (distinctBttfIds.size >= 2) {
    pct = 10;
    label = 'Saga BTTF Discount -10% (2 volets)';
  }

  const discounts: DiscountLine[] =
    pct > 0 ? [{ label, amount: Math.round(bttfSubtotal * pct) / 100 }] : [];

  const total = subtotal - discounts.reduce((sum, d) => sum + d.amount, 0);
  return { subtotal, discounts, total };
}

export class CartRepository implements ICartService {
  async calculatePrice(items: CartItem[]): Promise<PriceBreakdown> {
    const films = items.flatMap(({ product, quantity }) =>
      Array<string>(quantity).fill(product.title),
    );

    try {
      const dto = await ApiClient.post<PriceBreakdownDto>('/cart/price', { films });
      return PriceBreakdownMapper.toDomain(dto);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[CartRepository] API unavailable — using local price calculation', err);
        return computeLocalPrice(items);
      }
      throw err;
    }
  }
}
