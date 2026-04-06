import { describe, it, expect, vi } from 'vitest';
import { GetProductsUseCase } from './GetProductsUseCase';
import type { IProductService } from '../../domain/services/IProductService';
import type { Product } from '../../domain/entities/Product';

function makeProduct(id: string): Product {
  return { id, title: `Film ${id}`, price: 15, category: 'other' };
}

describe('GetProductsUseCase', () => {
  it('delegates to the service and returns its result', async () => {
    const products = [makeProduct('1'), makeProduct('2')];
    const service: IProductService = { getAll: vi.fn().mockResolvedValue(products) };
    const result = await new GetProductsUseCase(service).execute();
    expect(result).toBe(products);
    expect(service.getAll).toHaveBeenCalledOnce();
  });

  it('returns an empty array when the service returns none', async () => {
    const service: IProductService = { getAll: vi.fn().mockResolvedValue([]) };
    const result = await new GetProductsUseCase(service).execute();
    expect(result).toEqual([]);
  });

  it('propagates errors thrown by the service', async () => {
    const service: IProductService = {
      getAll: vi.fn().mockRejectedValue(new Error('network error')),
    };
    await expect(new GetProductsUseCase(service).execute()).rejects.toThrow('network error');
  });
});
