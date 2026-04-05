/**
 * CartMapper — Anti-Corruption Layer
 *
 * Responsibility:
 *  - toRequest:  CartItem[]       → CartPriceRequest   (domain   → API shape)
 *  - toDomain:   CartPriceResponse → PriceBreakdown    (API shape → domain)
 *
 * This mapper is the ONLY place that knows about the external API contract.
 * Domain entities remain decoupled from infrastructure details.
 */
import type { CartItem } from '../entities/Cart';
import type {
  PriceBreakdown,
  PriceBreakdownLine,
  DiscountLine,
} from '../entities/PriceBreakdown';
import type {
  CartPriceRequest,
  CartPriceResponse,
} from '../../infrastructure/api/cart.types';

export const CartMapper = {
  /**
   * Converts the cart items array into the request body the API expects.
   *
   * Aggregation rule: if the same productId appears multiple times (e.g. the
   * user added it twice via the text input), quantities are summed before
   * sending to avoid duplicate line items on the server side.
   */
  toRequest(items: CartItem[]): CartPriceRequest {
    const aggregated = new Map<string, number>();
    for (const item of items) {
      aggregated.set(
        item.product.id,
        (aggregated.get(item.product.id) ?? 0) + item.quantity,
      );
    }
    return {
      items: Array.from(aggregated.entries()).map(([productId, quantity]) => ({
        productId,
        quantity,
      })),
    };
  },

  /**
   * Transforms the API response into the PriceBreakdown domain entity.
   *
   * Monetary precision: the backend sends prices in euros per the API contract
   * (unitPrice: 15 = 15 €). If the backend is ever changed to send cents,
   * set VITE_PRICES_IN_CENTS=true in .env and prices will be divided by 100.
   */
  toDomain(response: CartPriceResponse): PriceBreakdown {
    const pricesInCents = import.meta.env.VITE_PRICES_IN_CENTS === 'true';
    const norm = (n: number) => (pricesInCents ? round2(n / 100) : n);

    const lines: PriceBreakdownLine[] = response.lines.map((l) => ({
      productId: l.productId,
      productName: l.productName,
      quantity: l.quantity,
      unitPrice: norm(l.unitPrice),
      lineTotal: norm(l.lineTotal),
      discountRate: l.discountRate,
    }));

    // Gross subtotal = sum of (unitPrice × quantity) for every line
    const subtotal = round2(
      lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
    );

    // Group savings by discount rate to produce clean DiscountLine labels
    const discountMap = new Map<number, number>();
    for (const l of lines) {
      if (l.discountRate > 0) {
        const saved = round2(l.unitPrice * l.quantity - l.lineTotal);
        discountMap.set(l.discountRate, round2((discountMap.get(l.discountRate) ?? 0) + saved));
      }
    }
    const discounts: DiscountLine[] = Array.from(discountMap.entries()).map(
      ([rate, amount]) => ({
        label:
          rate >= 20
            ? `Saga BTTF Discount -${rate}% (3 volets)`
            : `Saga BTTF Discount -${rate}% (2 volets)`,
        amount,
      }),
    );

    return {
      subtotal,
      discounts,
      total: round2(norm(response.total)),
      lines,
      currency: response.currency,
    };
  },
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
