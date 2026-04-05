export interface DiscountLine {
  label: string;
  /** Positive amount saved (e.g. 5.00 means "saved 5 €") */
  amount: number;
}

/** Per-line billing detail — populated from API response (optional in local fallback) */
export interface PriceBreakdownLine {
  productId: string;
  productName: string;
  quantity: number;
  /** Unit price in € before any discount */
  unitPrice: number;
  /** Line total in € after discount */
  lineTotal: number;
  /** Discount rate applied, e.g. 20 means 20% — 0 if no discount */
  discountRate: number;
}

export interface PriceBreakdown {
  subtotal: number;
  discounts: DiscountLine[];
  total: number;
  /** Per-line detail populated from API response — absent in local fallback mode */
  lines?: PriceBreakdownLine[];
  currency?: string;
}
