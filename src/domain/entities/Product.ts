export type ProductCategory = 'bttf' | 'other';

export interface Product {
  id: string;
  title: string;
  price: number;
  category: ProductCategory;
  description?: string;
  imageUrl?: string;
  /** 1 | 2 | 3 for BTTF films, undefined for others */
  bttfPart?: 1 | 2 | 3;
  /** Name of the saga/franchise this product belongs to, e.g. "BTTF", "Star Wars" */
  sagaName?: string;
}
