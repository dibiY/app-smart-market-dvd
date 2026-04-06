import { describe, it, expect, vi, afterEach } from 'vitest';
import { CartMapper } from './CartMapper';
import type { CartItem } from '../entities/Cart';
import type { Product } from '../entities/Product';
import type { CartPriceResponse } from '../../infrastructure/api/cart.types';

// ─── Helpers ──────────────────────────────────────────────────────────────
function makeProduct(id: string, overrides: Partial<Product> = {}): Product {
  return {
    id,
    title: `Product ${id}`,
    price: 15,
    category: 'other',
    ...overrides,
  };
}

function makeItem(product: Product, quantity = 1): CartItem {
  return { product, quantity };
}

const bttfProduct = makeProduct('bttf-1', {
  category: 'bttf',
  sagaName: 'BTTF',
  price: 15,
});

// ─── CartMapper.toRequest ──────────────────────────────────────────────────
describe('CartMapper.toRequest', () => {
  it('returns an empty items array for an empty cart', () => {
    expect(CartMapper.toRequest([])).toEqual({ items: [] });
  });

  it('maps a single item to the correct request structure', () => {
    const request = CartMapper.toRequest([makeItem(bttfProduct, 2)]);
    expect(request.items).toHaveLength(1);
    expect(request.items[0]).toEqual({ productId: 'bttf-1', quantity: 2 });
  });

  it('maps multiple different products correctly', () => {
    const p2 = makeProduct('sw-1', { sagaName: 'Star Wars' });
    const request = CartMapper.toRequest([makeItem(bttfProduct, 1), makeItem(p2, 3)]);
    expect(request.items).toHaveLength(2);
    expect(request.items.find((i) => i.productId === 'sw-1')?.quantity).toBe(3);
  });

  it('aggregates duplicate productIds by summing quantities', () => {
    const item1 = makeItem(bttfProduct, 1);
    const item2 = makeItem(bttfProduct, 2); // same product, added twice
    const request = CartMapper.toRequest([item1, item2]);
    expect(request.items).toHaveLength(1);
    expect(request.items[0].quantity).toBe(3);
  });
});

// ─── CartMapper.toDomain ──────────────────────────────────────────────────
describe('CartMapper.toDomain', () => {
  const baseResponse: CartPriceResponse = {
    lines: [
      {
        productId: 'bttf-1',
        productName: 'Back to the Future',
        quantity: 1,
        unitPrice: 15,
        lineTotal: 15,
        discountRate: 0,
        currency: 'EUR',
      },
    ],
    total: 15,
    currency: 'EUR',
  };

  it('returns correct subtotal as sum of unitPrice × quantity', () => {
    const result = CartMapper.toDomain(baseResponse);
    expect(result.subtotal).toBe(15);
  });

  it('returns the total from the API response', () => {
    const result = CartMapper.toDomain(baseResponse);
    expect(result.total).toBe(15);
  });

  it('has no discounts when no line has a discountRate > 0', () => {
    const result = CartMapper.toDomain(baseResponse);
    expect(result.discounts).toHaveLength(0);
  });

  it('computes discount amount as saved difference per discounted line', () => {
    const discountedResponse: CartPriceResponse = {
      lines: [
        {
          productId: 'bttf-1',
          productName: 'Back to the Future',
          quantity: 2,
          unitPrice: 15,
          lineTotal: 24, // 15*2 = 30 → saved 6 → 20% discount
          discountRate: 20,
          currency: 'EUR',
        },
      ],
      total: 24,
      currency: 'EUR',
    };
    const result = CartMapper.toDomain(discountedResponse);
    expect(result.discounts).toHaveLength(1);
    expect(result.discounts[0].amount).toBe(6);
  });

  it('uses saga name from CartItem product when provided', () => {
    const discountedResponse: CartPriceResponse = {
      lines: [
        {
          productId: 'bttf-1',
          productName: 'Back to the Future',
          quantity: 2,
          unitPrice: 15,
          lineTotal: 24,
          discountRate: 20,
          currency: 'EUR',
        },
      ],
      total: 24,
      currency: 'EUR',
    };
    const items: CartItem[] = [makeItem(bttfProduct, 2)];
    const result = CartMapper.toDomain(discountedResponse, items);
    expect(result.discounts[0].label).toContain('BTTF');
  });

  it('groups multiple lines of the same discount rate into one discount entry', () => {
    const multiLineResponse: CartPriceResponse = {
      lines: [
        { productId: 'b1', productName: 'BTTF 1', quantity: 1, unitPrice: 15, lineTotal: 12, discountRate: 20, currency: 'EUR' },
        { productId: 'b2', productName: 'BTTF 2', quantity: 1, unitPrice: 15, lineTotal: 12, discountRate: 20, currency: 'EUR' },
      ],
      total: 24,
      currency: 'EUR',
    };
    const result = CartMapper.toDomain(multiLineResponse);
    expect(result.discounts).toHaveLength(1);
    expect(result.discounts[0].amount).toBe(6); // 3+3
  });

  it('creates separate discount entries for different discount rates', () => {
    const mixedResponse: CartPriceResponse = {
      lines: [
        { productId: 'b1', productName: 'BTTF 1', quantity: 1, unitPrice: 15, lineTotal: 12, discountRate: 20, currency: 'EUR' },
        { productId: 's1', productName: 'Star Wars', quantity: 1, unitPrice: 20, lineTotal: 18, discountRate: 10, currency: 'EUR' },
      ],
      total: 30,
      currency: 'EUR',
    };
    const result = CartMapper.toDomain(mixedResponse);
    expect(result.discounts).toHaveLength(2);
  });

  it('includes line items in the result', () => {
    const result = CartMapper.toDomain(baseResponse);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].productId).toBe('bttf-1');
  });

  it('preserves the currency from the API response', () => {
    const result = CartMapper.toDomain(baseResponse);
    expect(result.currency).toBe('EUR');
  });

  it('handles floating point totals with 2-decimal precision', () => {
    const response: CartPriceResponse = {
      lines: [
        { productId: 'p1', productName: 'Film', quantity: 3, unitPrice: 10, lineTotal: 27, discountRate: 10, currency: 'EUR' },
      ],
      total: 27,
      currency: 'EUR',
    };
    const result = CartMapper.toDomain(response);
    // saved = 30 - 27 = 3
    expect(result.discounts[0].amount).toBe(3);
    expect(result.total).toBe(27);
  });
});

// ─── CartMapper.toDomain — resolveSagaName fallback paths ─────────────────
describe('CartMapper.toDomain — resolveSagaName fallback (no cart items)', () => {
  function discountedResponse(productName: string) {
    return {
      lines: [
        {
          productId: 'p1',
          productName,
          quantity: 2,
          unitPrice: 15,
          lineTotal: 24,
          discountRate: 20,
          currency: 'EUR',
        },
      ],
      total: 24,
      currency: 'EUR',
    };
  }

  it('detects BTTF from "Back to the Future" product name', () => {
    const result = CartMapper.toDomain(discountedResponse('Back to the Future Part II'));
    expect(result.discounts[0].label).toContain('BTTF');
  });

  it('detects BTTF from French product name "Retour vers le futur"', () => {
    const result = CartMapper.toDomain(discountedResponse('Retour vers le futur III'));
    expect(result.discounts[0].label).toContain('BTTF');
  });

  it('detects Star Wars from product name', () => {
    const result = CartMapper.toDomain(discountedResponse('Star Wars: A New Hope'));
    expect(result.discounts[0].label).toContain('Star Wars');
  });

  it('detects Terminator from product name', () => {
    const result = CartMapper.toDomain(discountedResponse('Terminator 2: Judgment Day'));
    expect(result.discounts[0].label).toContain('Terminator');
  });

  it('returns generic label when franchise is unrecognized', () => {
    const result = CartMapper.toDomain(discountedResponse('Some Random Film'));
    expect(result.discounts[0].label).toMatch(/^Discount -20%/);
    expect(result.discounts[0].label).not.toContain('Saga');
  });

  it('returns generic label when lines belong to mixed unrecognized franchises', () => {
    const response = {
      lines: [
        { productId: 'p1', productName: 'Star Wars: A New Hope', quantity: 1, unitPrice: 15, lineTotal: 12, discountRate: 20, currency: 'EUR' },
        { productId: 'p2', productName: 'Terminator 2', quantity: 1, unitPrice: 15, lineTotal: 12, discountRate: 20, currency: 'EUR' },
      ],
      total: 24,
      currency: 'EUR',
    };
    // Both lines are in the same 20%-group but different franchises → null
    const result = CartMapper.toDomain(response);
    expect(result.discounts[0].label).toMatch(/^Discount -20%/);
  });
});

describe('CartMapper.toDomain — resolveSagaName with multiple saga names', () => {
  it('falls through to name-based detection when CartItems contain two different sagas', () => {
    // Both have sagaName but they differ → sagas.size > 1 → regex fallback
    const response = {
      lines: [
        { productId: 'p1', productName: 'Star Wars Episode IV', quantity: 1, unitPrice: 15, lineTotal: 12, discountRate: 20, currency: 'EUR' },
        { productId: 'p2', productName: 'Star Wars Episode V', quantity: 1, unitPrice: 15, lineTotal: 12, discountRate: 20, currency: 'EUR' },
      ],
      total: 24,
      currency: 'EUR',
    };
    // Provide items where each product has a DIFFERENT sagaName
    const items = [
      { product: { id: 'p1', title: 'SW IV', price: 15, category: 'other', sagaName: 'Star Wars' }, quantity: 1 },
      { product: { id: 'p2', title: 'SW V', price: 15, category: 'other', sagaName: 'Terminator' }, quantity: 1 },
    ];
    const result = CartMapper.toDomain(response, items);
    // sagas.size === 2 → regex fallback → both names match Star Wars pattern
    expect(result.discounts[0].label).toContain('Star Wars');
  });
});

// ─── CartMapper.toDomain — VITE_PRICES_IN_CENTS ───────────────────────────
describe('CartMapper.toDomain — VITE_PRICES_IN_CENTS', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('divides all prices by 100 when VITE_PRICES_IN_CENTS is true', () => {
    vi.stubEnv('VITE_PRICES_IN_CENTS', 'true');
    const response = {
      lines: [
        { productId: 'p1', productName: 'Film', quantity: 1, unitPrice: 1500, lineTotal: 1500, discountRate: 0, currency: 'EUR' },
      ],
      total: 1500,
      currency: 'EUR',
    };
    const result = CartMapper.toDomain(response);
    expect(result.subtotal).toBe(15);
    expect(result.total).toBe(15);
    expect(result.lines[0].unitPrice).toBe(15);
  });

  it('keeps prices as-is when VITE_PRICES_IN_CENTS is absent', () => {
    vi.stubEnv('VITE_PRICES_IN_CENTS', '');
    const response = {
      lines: [
        { productId: 'p1', productName: 'Film', quantity: 1, unitPrice: 15, lineTotal: 15, discountRate: 0, currency: 'EUR' },
      ],
      total: 15,
      currency: 'EUR',
    };
    const result = CartMapper.toDomain(response);
    expect(result.subtotal).toBe(15);
    expect(result.total).toBe(15);
  });
});
