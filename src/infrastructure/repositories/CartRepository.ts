import { ApiClient, ApiError } from '../api/ApiClient';
import { CartMapper } from '../../domain/mappers/CartMapper';
import type { CartPriceResponse } from '../api/cart.types';
import type { CartItem } from '../../domain/entities/Cart';
import type { PriceBreakdown, DiscountLine } from '../../domain/entities/PriceBreakdown';
import type { ICartService } from '../../domain/services/ICartService';

// ─── Local fallback (mirrors server business rules) ───────────────────────
// Used in DEV when the API is unreachable. Keeps the DX loop fast.
function computeLocalPrice(items: CartItem[]): PriceBreakdown {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const bttfItems = items.filter((i) => i.product.category === 'bttf');
  const distinctBttfIds = new Set(bttfItems.map((i) => i.product.id));
  const bttfSubtotal = bttfItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  let pct = 0;
  let bttfCount = 0;
  if (distinctBttfIds.size >= 3) {
    pct = 20;
    bttfCount = 3;
  } else if (distinctBttfIds.size >= 2) {
    pct = 10;
    bttfCount = 2;
  }

  // Resolve the saga name from the first discounted BTTF product
  const sagaName =
    bttfItems.length > 0 ? (bttfItems[0].product.sagaName ?? 'BTTF') : 'BTTF';

  const discounts: DiscountLine[] =
    pct > 0
      ? [{
          label: `Saga ${sagaName} Discount -${pct}% (${bttfCount} volet${bttfCount > 1 ? 's' : ''})`,
          amount: Math.round(bttfSubtotal * pct) / 100,
        }]
      : [];

  const total = subtotal - discounts.reduce((sum, d) => sum + d.amount, 0);
  return { subtotal, discounts, total };
}

// ─── Repository ───────────────────────────────────────────────────────────

export class CartRepository implements ICartService {
  async calculatePrice(items: CartItem[]): Promise<PriceBreakdown> {
    // CartMapper.toRequest aggregates duplicate productIds before sending
    const request = CartMapper.toRequest(items);

    try {
      const response = await ApiClient.post<CartPriceResponse>('/cart/price', request);
      return CartMapper.toDomain(response, items);
    } catch (err) {
      // ── 404: product not recognized by the backend ─────────────────────
      if (err instanceof ApiError && err.isNotFound) {
        const body = err.body as Record<string, string> | undefined;
        const productName =
          body?.productName ?? body?.name ?? body?.message ?? 'inconnu';
        throw new Error(`Le film "${productName}" n'est pas reconnu`);
      }

      // ── DEV mode: graceful fallback when backend is offline ────────────
      if (import.meta.env.DEV) {
        console.warn(
          '[CartRepository] API unavailable — falling back to local price calculation',
          err,
        );
        return computeLocalPrice(items);
      }

      throw err;
    }
  }
}

