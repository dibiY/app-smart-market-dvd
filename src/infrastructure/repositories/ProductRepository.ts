import { ApiClient } from '../api/ApiClient';
import { ProductMapper } from '../mappers/ProductMapper';
import type { ProductDto } from '../api/product.types';
import { MOCK_PRODUCTS } from '../mocks/mockData';
import type { Product } from '../../domain/entities/Product';
import type { IProductService } from '../../domain/services/IProductService';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export class ProductRepository implements IProductService {
  async getAll(): Promise<Product[]> {
    if (USE_MOCK) {
      if (import.meta.env.DEV) {
        console.info('[ProductRepository] VITE_USE_MOCK=true — using local mock data');
      }
      return MOCK_PRODUCTS;
    }

    const dtos = await ApiClient.get<ProductDto[]>('/products');

    if (import.meta.env.DEV) {
      console.groupCollapsed('[ProductRepository] GET /products — raw API response');
      console.table(dtos.slice(0, 5));
      console.groupEnd();
    }

    return dtos.map(ProductMapper.toDomain);
  }
}
