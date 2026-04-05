import { ApiClient } from '../api/ApiClient';
import { ProductMapper, type ProductDto } from '../mappers/ProductMapper';
import { MOCK_PRODUCTS } from '../mocks/mockData';
import type { Product } from '../../domain/entities/Product';
import type { IProductService } from '../../domain/services/IProductService';

export class ProductRepository implements IProductService {
  async getAll(): Promise<Product[]> {
    try {
      const dtos = await ApiClient.get<ProductDto[]>('/products');
      return dtos.map(ProductMapper.toDomain);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[ProductRepository] API unavailable — using mock data', err);
        return MOCK_PRODUCTS;
      }
      throw err;
    }
  }
}
