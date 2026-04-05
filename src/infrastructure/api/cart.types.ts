/**
 * API Contract types — NestJS backend.
 * These mirror the exact shapes the server expects and returns.
 * Never import these into the domain layer directly; always go through CartMapper.
 */

// ─── Request ──────────────────────────────────────────────────────────────

export interface CartPriceRequestItem {
  productId: string;
  quantity: number;
}

export interface CartPriceRequest {
  items: CartPriceRequestItem[];
}

// ─── Response ─────────────────────────────────────────────────────────────

export interface CartPriceResponseLine {
  productId: string;
  productName: string;
  quantity: number;
  /** Unit price in € (e.g. 15 for BTTF, 20 for other) */
  unitPrice: number;
  /** Line total after discount in € (e.g. 12 when -20% applied) */
  lineTotal: number;
  /** Discount rate applied as a percentage value, e.g. 20 means 20% */
  discountRate: number;
  currency: string;
}

export interface CartPriceResponse {
  lines: CartPriceResponseLine[];
  total: number;
  currency: string;
}
