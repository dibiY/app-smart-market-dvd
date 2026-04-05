import type { Product, ProductCategory } from '../../domain/entities/Product';

export interface ProductDto {
  id: string | number;
  title: string;
  price: number;
  category?: string;
  description?: string;
  image?: string;
}

function detectCategory(title: string): ProductCategory {
  const lower = title.toLowerCase();
  if (lower.includes('back to the future') || lower.includes('retour vers le futur')) {
    return 'bttf';
  }
  return 'other';
}

function detectBttfPart(title: string): 1 | 2 | 3 | undefined {
  if (/part\s*iii|partie\s*3/i.test(title)) return 3;
  if (/part\s*ii|partie\s*2/i.test(title)) return 2;
  if (/back to the future|retour vers le futur/i.test(title)) return 1;
  return undefined;
}

export const ProductMapper = {
  toDomain(dto: ProductDto): Product {
    const category =
      (dto.category as ProductCategory | undefined) ?? detectCategory(dto.title);

    return {
      id: String(dto.id),
      title: dto.title,
      price: dto.price,
      category,
      description: dto.description,
      imageUrl: dto.image,
      bttfPart: category === 'bttf' ? detectBttfPart(dto.title) : undefined,
    };
  },
};
