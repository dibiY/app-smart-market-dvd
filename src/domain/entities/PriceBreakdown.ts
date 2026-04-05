export interface DiscountLine {
  label: string;
  /** Positive amount saved (e.g. 5.00 means "saved 5 €") */
  amount: number;
}

export interface PriceBreakdown {
  subtotal: number;
  discounts: DiscountLine[];
  total: number;
}
