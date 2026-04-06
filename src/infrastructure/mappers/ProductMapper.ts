import type { Product, ProductCategory } from '../../domain/entities/Product';
import type { ProductDto } from '../api/product.types';

export type { ProductDto };

function detectCategory(title: string): ProductCategory {
  const lower = title.toLowerCase();
  if (lower.includes('back to the future') || lower.includes('retour vers le futur')) {
    return 'bttf';
  }
  return 'other';
}

function detectSagaName(title: string, category: ProductCategory, apiSagaName?: string): string | undefined {
  if (apiSagaName) return apiSagaName;
  if (category === 'bttf') return 'BTTF';
  const lower = title.toLowerCase();
  if (lower.includes('star wars')) return 'Star Wars';
  if (lower.includes('indiana jones')) return 'Indiana Jones';
  if (lower.includes('terminator')) return 'Terminator';
  if (lower.includes('alien')) return 'Alien';
  if (lower.includes('matrix')) return 'Matrix';
  return undefined;
}

function detectBttfPart(title: string): 1 | 2 | 3 | undefined {
  if (/part\s*iii|partie\s*3/i.test(title)) return 3;
  if (/part\s*ii|partie\s*2/i.test(title)) return 2;
  if (/back to the future|retour vers le futur/i.test(title)) return 1;
  return undefined;
}

export const ProductMapper = {
  toDomain(dto: ProductDto): Product {
    const title = dto.title ?? dto.name ?? '';
    const imageUrl = dto.imageUrl ?? dto.image ?? dto.img ?? dto.poster;
    const category =
      (dto.category as ProductCategory | undefined) ?? detectCategory(title);

    return {
      id: String(dto.id),
      title,
      price: dto.price,
      category,
      description: dto.description,
      imageUrl,
      bttfPart: category === 'bttf' ? detectBttfPart(title) : undefined,
      sagaName: detectSagaName(title, category, dto.sagaName),
      sagaId: dto.sagaId,
    };
  },
};
