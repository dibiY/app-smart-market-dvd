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

/**
 * Resolves the saga name for a product.
 *
 * Priority:
 *   1. dto.sagaName  — explicit API/DB value (most authoritative)
 *   2. category 'bttf' — confirmed DB category, always means BTTF franchise
 *
 * Title-based guessing is intentionally NOT performed: if the backend does
 * not tag a product as belonging to a saga, it must appear in "Autres produits"
 * regardless of what words appear in the title.
 */
function resolveSagaName(category: ProductCategory, apiSagaName?: string): string | undefined {
  if (apiSagaName) return apiSagaName;
  if (category === 'bttf') return 'BTTF';
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
      sagaName: resolveSagaName(category, dto.sagaName),
      sagaId: dto.sagaId,
    };
  },
};
