import type { Product } from '../entities/Product';

export interface IProductService {
  getAll(): Promise<Product[]>;
}
