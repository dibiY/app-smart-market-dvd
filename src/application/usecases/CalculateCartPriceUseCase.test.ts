import { describe, it, expect, vi } from 'vitest';
import { CalculateCartPriceUseCase } from './CalculateCartPriceUseCase';
import type { ICartService } from '../../domain/services/ICartService';
import type { CartItem } from '../../domain/entities/Cart';
import type { PriceBreakdown } from '../../domain/entities/PriceBreakdown';

// ─── Fixtures ─────────────────────────────────────────────────────────────
const mockBreakdown: PriceBreakdown = {
  subtotal: 30,
  discounts: [{ label: 'Saga BTTF Discount -20% (2 volets)', amount: 6 }],
  total: 24,
  lines: [],
};

const cartItems: CartItem[] = [
  {
    product: { id: 'bttf-1', title: 'Back to the Future', price: 15, category: 'bttf', sagaName: 'BTTF' },
    quantity: 2,
  },
];

// ─── CalculateCartPriceUseCase ─────────────────────────────────────────────
describe('CalculateCartPriceUseCase', () => {
  it('delegates to ICartService.calculatePrice', async () => {
    const service: ICartService = {
      calculatePrice: vi.fn().mockResolvedValue(mockBreakdown),
    };
    const useCase = new CalculateCartPriceUseCase(service);

    await useCase.execute(cartItems);

    expect(service.calculatePrice).toHaveBeenCalledOnce();
    expect(service.calculatePrice).toHaveBeenCalledWith(cartItems);
  });

  it('returns the value resolved by the service', async () => {
    const service: ICartService = {
      calculatePrice: vi.fn().mockResolvedValue(mockBreakdown),
    };
    const useCase = new CalculateCartPriceUseCase(service);

    const result = await useCase.execute(cartItems);

    expect(result).toStrictEqual(mockBreakdown);
  });

  it('propagates errors thrown by the service', async () => {
    const service: ICartService = {
      calculatePrice: vi.fn().mockRejectedValue(new Error('API unavailable')),
    };
    const useCase = new CalculateCartPriceUseCase(service);

    await expect(useCase.execute(cartItems)).rejects.toThrow('API unavailable');
  });

  it('passes an empty cart to the service without errors', async () => {
    const service: ICartService = {
      calculatePrice: vi.fn().mockResolvedValue({ subtotal: 0, discounts: [], total: 0 }),
    };
    const useCase = new CalculateCartPriceUseCase(service);

    const result = await useCase.execute([]);

    expect(service.calculatePrice).toHaveBeenCalledWith([]);
    expect(result.total).toBe(0);
  });
});
