import type { PriceBreakdown, DiscountLine } from '../../domain/entities/PriceBreakdown';

export interface PriceBreakdownDto {
  total: number;
  subtotal?: number;
  discounts?: Array<{
    type?: string;
    label?: string;
    percent?: number;
    amount?: number;
  }>;
}

export const PriceBreakdownMapper = {
  toDomain(dto: PriceBreakdownDto): PriceBreakdown {
    const discounts: DiscountLine[] = (dto.discounts ?? []).map((d) => ({
      label: d.label ?? `Saga BTTF Discount -${d.percent ?? 0}%`,
      amount: d.amount ?? 0,
    }));

    const totalDiscountAmount = discounts.reduce((sum, d) => sum + d.amount, 0);
    const subtotal = dto.subtotal ?? dto.total + totalDiscountAmount;

    return { subtotal, discounts, total: dto.total };
  },
};
