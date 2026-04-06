import { describe, it, expect } from 'vitest';
import { groupProductsBySaga, NO_SAGA_KEY } from './groupProductsBySaga';
import type { Product } from '../entities/Product';

// ─── Fixtures ─────────────────────────────────────────────────────────────
function makeProduct(overrides: Partial<Product> & { id: string }): Product {
  return {
    title: `Film ${overrides.id}`,
    price: 15,
    category: 'other',
    ...overrides,
  };
}

const bttf1 = makeProduct({ id: 'b1', category: 'bttf', sagaName: 'BTTF' });
const bttf2 = makeProduct({ id: 'b2', category: 'bttf', sagaName: 'BTTF' });
const sw1   = makeProduct({ id: 's1', sagaName: 'Star Wars' });
const sw2   = makeProduct({ id: 's2', sagaName: 'Star Wars' });
const lone1 = makeProduct({ id: 'l1' }); // no saga
const lone2 = makeProduct({ id: 'l2' }); // no saga

// ─── groupProductsBySaga ──────────────────────────────────────────────────
describe('groupProductsBySaga', () => {
  describe('basic grouping', () => {
    it('returns an empty array for an empty product list', () => {
      expect(groupProductsBySaga([])).toEqual([]);
    });

    it('places products with sagaName into their saga group', () => {
      const groups = groupProductsBySaga([bttf1, sw1]);
      const names = groups.map((g) => g.sagaName);
      expect(names).toContain('BTTF');
      expect(names).toContain('Star Wars');
    });

    it('saga groups have isVirtual = false', () => {
      const groups = groupProductsBySaga([bttf1, sw1]);
      groups
        .filter((g) => g.sagaName !== NO_SAGA_KEY)
        .forEach((g) => expect(g.isVirtual).toBe(false));
    });

    it('places products without sagaName or sagaId into the virtual group', () => {
      const groups = groupProductsBySaga([lone1, lone2]);
      expect(groups).toHaveLength(1);
      expect(groups[0].isVirtual).toBe(true);
      expect(groups[0].sagaName).toBe(NO_SAGA_KEY);
      expect(groups[0].products).toHaveLength(2);
    });

    it('collects multiple saga products under the same group', () => {
      const groups = groupProductsBySaga([sw1, sw2]);
      expect(groups).toHaveLength(1);
      expect(groups[0].products).toHaveLength(2);
    });
  });

  describe('sorting rules', () => {
    it('pins BTTF as the first group', () => {
      const groups = groupProductsBySaga([sw1, bttf1]);
      expect(groups[0].sagaName).toBe('BTTF');
    });

    it('other sagas are sorted alphabetically after BTTF', () => {
      const alien  = makeProduct({ id: 'a1', sagaName: 'Alien' });
      const matrix = makeProduct({ id: 'm1', sagaName: 'Matrix' });
      const groups = groupProductsBySaga([matrix, bttf1, alien, sw1]);
      const names  = groups.map((g) => g.sagaName);
      expect(names[0]).toBe('BTTF');
      expect(names.slice(1)).toEqual(['Alien', 'Matrix', 'Star Wars']);
    });

    it('"Autres produits" virtual group is always last', () => {
      const groups = groupProductsBySaga([lone1, bttf1, sw1]);
      expect(groups[groups.length - 1].sagaName).toBe(NO_SAGA_KEY);
    });

    it('no virtual group is added when all products have a saga', () => {
      const groups = groupProductsBySaga([bttf1, sw1]);
      expect(groups.every((g) => !g.isVirtual)).toBe(true);
    });

    it('no saga group is added when all products are standalone', () => {
      const groups = groupProductsBySaga([lone1, lone2]);
      expect(groups.every((g) => g.isVirtual)).toBe(true);
    });
  });

  describe('sagaId takes precedence over sagaName', () => {
    it('uses sagaId as the group key when both are present', () => {
      const p = makeProduct({ id: 'x1', sagaId: 'SW_GROUP', sagaName: 'Star Wars' });
      const groups = groupProductsBySaga([p]);
      expect(groups[0].sagaName).toBe('SW_GROUP');
    });

    it('uses sagaId when sagaName is absent', () => {
      const p = makeProduct({ id: 'x2', sagaId: 'T_GROUP' });
      const groups = groupProductsBySaga([p]);
      expect(groups[0].sagaName).toBe('T_GROUP');
    });
  });

  describe('bttfFirst override', () => {
    it('allows a different saga to be pinned first', () => {
      const groups = groupProductsBySaga([bttf1, sw1], 'Star Wars');
      expect(groups[0].sagaName).toBe('Star Wars');
    });
  });

  describe('product integrity', () => {
    it('preserves all product fields inside groups', () => {
      const groups = groupProductsBySaga([bttf1]);
      expect(groups[0].products[0]).toStrictEqual(bttf1);
    });

    it('does not mutate the original products array', () => {
      const input = [bttf1, lone1];
      const copy  = [...input];
      groupProductsBySaga(input);
      expect(input).toEqual(copy);
    });
  });
});
