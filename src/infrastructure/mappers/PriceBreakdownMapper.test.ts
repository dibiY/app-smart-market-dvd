import { describe, it, expect } from 'vitest';
import { PriceBreakdownMapper } from './PriceBreakdownMapper';
import type { PriceBreakdownDto } from './PriceBreakdownMapper';

// ─── PriceBreakdownMapper.toDomain ────────────────────────────────────────
describe('PriceBreakdownMapper.toDomain', () => {
  describe('total', () => {
    it('maps dto.total to result.total', () => {
      const result = PriceBreakdownMapper.toDomain({ total: 45 });
      expect(result.total).toBe(45);
    });
  });

  describe('subtotal', () => {
    it('uses dto.subtotal when provided', () => {
      const result = PriceBreakdownMapper.toDomain({ total: 45, subtotal: 50 });
      expect(result.subtotal).toBe(50);
    });

    it('infers subtotal as total + sum-of-discounts when dto.subtotal is absent', () => {
      const dto: PriceBreakdownDto = {
        total: 45,
        discounts: [{ amount: 5 }],
      };
      const result = PriceBreakdownMapper.toDomain(dto);
      expect(result.subtotal).toBe(50);
    });

    it('sets subtotal equal to total when there are no discounts and no dto.subtotal', () => {
      const result = PriceBreakdownMapper.toDomain({ total: 60 });
      expect(result.subtotal).toBe(60);
    });
  });

  describe('discounts', () => {
    it('returns empty discounts array when dto has no discounts field', () => {
      const result = PriceBreakdownMapper.toDomain({ total: 30 });
      expect(result.discounts).toEqual([]);
    });

    it('returns empty discounts array for empty dto.discounts', () => {
      const result = PriceBreakdownMapper.toDomain({ total: 30, discounts: [] });
      expect(result.discounts).toEqual([]);
    });

    it('maps dto.label to discount label when present', () => {
      const dto: PriceBreakdownDto = {
        total: 40,
        discounts: [{ label: 'Saga BTTF Discount -20%', amount: 10 }],
      };
      const result = PriceBreakdownMapper.toDomain(dto);
      expect(result.discounts[0].label).toBe('Saga BTTF Discount -20%');
    });

    it('falls back to a generated label from percent when dto.label is absent', () => {
      const dto: PriceBreakdownDto = {
        total: 40,
        discounts: [{ percent: 20, amount: 10 }],
      };
      const result = PriceBreakdownMapper.toDomain(dto);
      expect(result.discounts[0].label).toContain('20');
    });

    it('maps dto.amount to discount amount', () => {
      const dto: PriceBreakdownDto = {
        total: 40,
        discounts: [{ label: 'Test discount', amount: 7.5 }],
      };
      const result = PriceBreakdownMapper.toDomain(dto);
      expect(result.discounts[0].amount).toBe(7.5);
    });

    it('defaults discount amount to 0 when dto.amount is absent', () => {
      const dto: PriceBreakdownDto = {
        total: 40,
        discounts: [{ label: 'Mystery discount' }],
      };
      const result = PriceBreakdownMapper.toDomain(dto);
      expect(result.discounts[0].amount).toBe(0);
    });

    it('maps multiple discounts correctly', () => {
      const dto: PriceBreakdownDto = {
        total: 30,
        discounts: [
          { label: 'Disc A', amount: 5 },
          { label: 'Disc B', amount: 3 },
        ],
      };
      const result = PriceBreakdownMapper.toDomain(dto);
      expect(result.discounts).toHaveLength(2);
      expect(result.discounts[1].label).toBe('Disc B');
    });
  });
});
