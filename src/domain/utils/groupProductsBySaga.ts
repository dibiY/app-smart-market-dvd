import type { Product } from '../entities/Product';

/** Virtual group key used for products that belong to no saga. Always sorted last. */
export const NO_SAGA_KEY = '__NO_SAGA__' as const;

export interface ProductGroup {
  /** Saga display name, or the NO_SAGA_KEY sentinel */
  sagaName: string;
  products: Product[];
  /** True when this group is the virtual "Autres produits" bucket */
  isVirtual: boolean;
}

/**
 * Groups a flat product list into saga sections.
 *
 * Rules:
 * - A product is placed in its saga group if it has a `sagaId` OR `sagaName`.
 *   (`sagaId` wins when both are present — they should match in practice.)
 * - Products with neither field fall into the virtual "Autres produits" group.
 * - Saga groups are sorted alphabetically, with BTTF pinned first.
 * - The "Autres produits" group is always last.
 *
 * @param products - Flat array from the domain / repository
 * @param bttfFirst - Override which saga is pinned to the top (default: "BTTF")
 */
export function groupProductsBySaga(
  products: Product[],
  bttfFirst = 'BTTF',
): ProductGroup[] {
  const sagaMap = new Map<string, Product[]>();
  const noSaga: Product[] = [];

  for (const product of products) {
    const key = product.sagaId ?? product.sagaName;
    if (key) {
      if (!sagaMap.has(key)) sagaMap.set(key, []);
      sagaMap.get(key)!.push(product);
    } else {
      noSaga.push(product);
    }
  }

  // Sort: pinned saga first, then alphabetical
  const sagaGroups: ProductGroup[] = Array.from(sagaMap.entries())
    .sort(([a], [b]) => {
      if (a === bttfFirst) return -1;
      if (b === bttfFirst) return 1;
      return a.localeCompare(b, 'fr');
    })
    .map(([sagaName, prods]) => ({ sagaName, products: prods, isVirtual: false }));

  // "Autres produits" always last
  if (noSaga.length > 0) {
    sagaGroups.push({ sagaName: NO_SAGA_KEY, products: noSaga, isVirtual: true });
  }

  return sagaGroups;
}
