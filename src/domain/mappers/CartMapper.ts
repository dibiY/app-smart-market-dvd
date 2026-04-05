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
import type { Product } from '../entities/Product';
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
   * Pass `items` (the cart contents) so discount labels can be derived from the
   * actual product saga names rather than being hardcoded.
   *
   * Monetary precision: the backend sends prices in euros per the API contract
   * (unitPrice: 15 = 15 €). If the backend is ever changed to send cents,
   * set VITE_PRICES_IN_CENTS=true in .env and prices will be divided by 100.
   */
  toDomain(response: CartPriceResponse, items?: CartItem[]): PriceBreakdown {
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

    // Build a lookup map: productId → Product (from the cart items passed in)
    const itemMap = new Map<string, Product>(
      (items ?? []).map((i) => [i.product.id, i.product]),
    );

    // Group savings by discount rate, tracking which productIds triggered each
    type DiscountGroup = { amount: number; productIds: Set<string> };
    const discountMap = new Map<number, DiscountGroup>();
    for (const l of lines) {
      if (l.discountRate > 0) {
        const saved = round2(l.unitPrice * l.quantity - l.lineTotal);
        const group = discountMap.get(l.discountRate) ?? { amount: 0, productIds: new Set() };
        group.amount = round2(group.amount + saved);
        group.productIds.add(l.productId);
        discountMap.set(l.discountRate, group);
      }
    }

    const discounts: DiscountLine[] = Array.from(discountMap.entries()).map(
      ([rate, { amount, productIds }]) => {
        const sagaName = resolveSagaName(productIds, itemMap, lines);
        const count = productIds.size;
        const volets = `(${count} volet${count > 1 ? 's' : ''})`;
        const label = sagaName
          ? `Saga ${sagaName} Discount -${rate}% ${volets}`
          : `Discount -${rate}% ${volets}`;
        return { label, amount };
      },
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

/**
 * Resolves a human-readable saga name for a discount group.
 *
 * Priority:
 *  1. `sagaName` set on the domain Product (populated by ProductMapper)
 *  2. Common franchise detected from product names returned by the API
 *  3. null → caller uses a generic "Discount" label
 */
function resolveSagaName(
  productIds: Set<string>,
  itemMap: Map<string, Product>,
  lines: PriceBreakdownLine[],
): string | null {
  // 1. Try to find saga from the domain Product objects (via CartItem lookup)
  const sagas = new Set<string>();
  for (const id of productIds) {
    const product = itemMap.get(id);
    if (product?.sagaName) sagas.add(product.sagaName);
  }
  if (sagas.size === 1) return [...sagas][0];

  // 2. Fallback: detect franchise from product names in the API response
  const discountedNames = lines
    .filter((l) => productIds.has(l.productId))
    .map((l) => l.productName.toLowerCase());

  const FRANCHISE_PATTERNS: Array<[RegExp, string]> = [
    [/back to the future|retour vers le futur/i, 'BTTF'],
    [/star wars/i, 'Star Wars'],
    [/indiana jones/i, 'Indiana Jones'],
    [/terminator/i, 'Terminator'],
    [/alien/i, 'Alien'],
    [/matrix/i, 'Matrix'],
    [/batman/i, 'Batman'],
    [/spider.?man/i, 'Spider-Man'],
  ];

  for (const [pattern, name] of FRANCHISE_PATTERNS) {
    if (discountedNames.every((n) => pattern.test(n))) return name;
  }

  // 3. Could not determine a common franchise
  return null;
}
