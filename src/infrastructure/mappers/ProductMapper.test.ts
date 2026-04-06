import { describe, it, expect } from 'vitest';
import { ProductMapper } from './ProductMapper';
import type { ProductDto } from '../api/product.types';

// ─── Helpers ──────────────────────────────────────────────────────────────
function makeDto(overrides: Partial<ProductDto> & { id: string | number; price: number }): ProductDto {
  return { title: 'Default Film', ...overrides };
}

// ─── ProductMapper.toDomain ───────────────────────────────────────────────
describe('ProductMapper.toDomain', () => {
  describe('id mapping', () => {
    it('converts numeric id to string', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 42, price: 15 }));
      expect(p.id).toBe('42');
    });

    it('keeps string id as string', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 'bttf-1', price: 15 }));
      expect(p.id).toBe('bttf-1');
    });
  });

  describe('title resolution', () => {
    it('prefers dto.title over dto.name', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 10, title: 'Title Value', name: 'Name Value' }));
      expect(p.title).toBe('Title Value');
    });

    it('falls back to dto.name when title is absent', () => {
      const dto: ProductDto = { id: 1, price: 10, name: 'Name Only' };
      const p = ProductMapper.toDomain(dto);
      expect(p.title).toBe('Name Only');
    });

    it('returns empty string when neither title nor name is present', () => {
      const dto: ProductDto = { id: 1, price: 10 };
      const p = ProductMapper.toDomain(dto);
      expect(p.title).toBe('');
    });
  });

  describe('category detection', () => {
    it('sets category to bttf for "Back to the Future" in title', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 15, title: 'Back to the Future' }));
      expect(p.category).toBe('bttf');
    });

    it('sets category to bttf for french title "Retour vers le Futur"', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 15, title: 'Retour vers le Futur' }));
      expect(p.category).toBe('bttf');
    });

    it('sets category to other for an unrelated title', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 20, title: 'Ghostbusters' }));
      expect(p.category).toBe('other');
    });

    it('respects explicit category from DTO', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 15, category: 'bttf' }));
      expect(p.category).toBe('bttf');
    });
  });

  describe('bttfPart detection', () => {
    it('detects Part I from "Back to the Future" title (no part suffix)', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 15, title: 'Back to the Future', category: 'bttf' }));
      expect(p.bttfPart).toBe(1);
    });

    it('detects Part II from title containing "Part II"', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 15, title: 'Back to the Future Part II', category: 'bttf' }));
      expect(p.bttfPart).toBe(2);
    });

    it('detects Part III from title containing "Part III"', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 15, title: 'Back to the Future Part III', category: 'bttf' }));
      expect(p.bttfPart).toBe(3);
    });

    it('returns undefined bttfPart for non-bttf products', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 20, title: 'Ghostbusters' }));
      expect(p.bttfPart).toBeUndefined();
    });
  });

  describe('sagaName resolution — API is source of truth', () => {
    it('uses dto.sagaName when present', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 15, sagaName: 'Star Wars' }));
      expect(p.sagaName).toBe('Star Wars');
    });

    it('assigns sagaName "BTTF" when category is bttf and no sagaName in DTO', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 15, category: 'bttf', title: 'Back to the Future' }));
      expect(p.sagaName).toBe('BTTF');
    });

    it('does NOT infer sagaName from title for "other" category products without dto.sagaName', () => {
      // e.g. "The Matrix" must NOT get sagaName="Matrix" from title alone
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 20, title: 'The Matrix' }));
      expect(p.sagaName).toBeUndefined();
    });

    it('does NOT infer sagaName from "Star Wars" title without dto.sagaName', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 20, title: 'Star Wars: A New Hope' }));
      expect(p.sagaName).toBeUndefined();
    });

    it('does NOT infer sagaName from "Terminator" title without dto.sagaName', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 20, title: 'Terminator 2' }));
      expect(p.sagaName).toBeUndefined();
    });
  });

  describe('sagaId passthrough', () => {
    it('maps dto.sagaId directly to product.sagaId', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 15, sagaId: 'SW_GROUP' }));
      expect(p.sagaId).toBe('SW_GROUP');
    });

    it('leaves sagaId undefined when not present in DTO', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 15 }));
      expect(p.sagaId).toBeUndefined();
    });
  });

  describe('image URL resolution', () => {
    it('prefers dto.imageUrl', () => {
      const p = ProductMapper.toDomain(makeDto({ id: 1, price: 10, imageUrl: 'http://a.com/img.jpg', image: 'http://b.com' }));
      expect(p.imageUrl).toBe('http://a.com/img.jpg');
    });

    it('falls back to dto.image then dto.img then dto.poster', () => {
      const p1 = ProductMapper.toDomain(makeDto({ id: 1, price: 10, image: 'http://b.com/img.jpg' }));
      expect(p1.imageUrl).toBe('http://b.com/img.jpg');

      const p2 = ProductMapper.toDomain(makeDto({ id: 1, price: 10, img: 'http://c.com/img.jpg' }));
      expect(p2.imageUrl).toBe('http://c.com/img.jpg');

      const p3 = ProductMapper.toDomain(makeDto({ id: 1, price: 10, poster: 'http://d.com/img.jpg' }));
      expect(p3.imageUrl).toBe('http://d.com/img.jpg');
    });
  });
});
