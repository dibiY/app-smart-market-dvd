/**
 * ProductDto — shape of the object returned by the NestJS GET /products endpoint.
 * Fields are made optional where the backend may or may not include them so the
 * mapper can handle both strict and lenient API responses gracefully.
 */
export interface ProductDto {
  id: string | number;
  /** Some backends use "name" instead of "title" */
  title?: string;
  name?: string;
  price: number;
  /** Category string sent by the API (mapped to domain ProductCategory) */
  category?: string;
  description?: string;
  /** Image field can be "image", "imageUrl", "img", or "poster" */
  image?: string;
  imageUrl?: string;
  img?: string;
  poster?: string;
  /** Optional saga/franchise name sent by the API */
  sagaName?: string;
}
