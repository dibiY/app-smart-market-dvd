import type { Product } from '../../domain/entities/Product';
import type { IProductService } from '../../domain/services/IProductService';

export class GetProductsUseCase {
  constructor(private readonly service: IProductService) {}

  execute(): Promise<Product[]> {
    return this.service.getAll();
  }
}
