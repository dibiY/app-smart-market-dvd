/**
 * Dependency Injection — singleton instances wired here.
 * Swap repositories to switch between real API and mocks.
 */
import { ProductRepository } from '../infrastructure/repositories/ProductRepository';
import { CartRepository } from '../infrastructure/repositories/CartRepository';
import { GetProductsUseCase } from './usecases/GetProductsUseCase';
import { CalculateCartPriceUseCase } from './usecases/CalculateCartPriceUseCase';

export const getProductsUseCase = new GetProductsUseCase(new ProductRepository());
export const calculateCartPriceUseCase = new CalculateCartPriceUseCase(new CartRepository());
