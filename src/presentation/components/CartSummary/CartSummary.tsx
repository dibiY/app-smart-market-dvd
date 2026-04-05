/**
 * CartSummary — Résumé de Facturation
 *
 * Displays a full per-line billing breakdown populated from the API response,
 * including:
 *  - Per-line rows with qty, unit price, discount rate, and line total
 *  - Aggregated subtotal
 *  - Discount lines (e.g. "Saga BTTF Discount -20%")
 *  - TimeCircuit display for the grand total
 *  - Error messages (including the "product not found" 404 case)
 *  - A "Recalculer" button for manual refresh
 */
import { RefreshCw, Tag, AlertTriangle } from 'lucide-react';
import type { PriceBreakdown, PriceBreakdownLine } from '../../../domain/entities/PriceBreakdown';
import { TimeCircuit } from '../TimeCircuit/TimeCircuit';
import { cn } from '@/lib/utils';

// ─── Sub-components ───────────────────────────────────────────────────────

function LineRow({ line }: { line: PriceBreakdownLine }) {
  const hasDiscount = line.discountRate > 0;
  const lineGross = line.unitPrice * line.quantity;

  return (
    <div className="group flex items-center gap-2 rounded px-2 py-1.5 hover:bg-white/[0.02] transition-colors">
      {/* Product name */}
      <p className="flex-1 font-rajdhani text-xs text-steel/90 truncate min-w-0">
        {line.productName}
      </p>

      {/* Qty × unit price */}
      <span className="font-share-tech text-[11px] text-steel/55 whitespace-nowrap shrink-0">
        {line.quantity} × {line.unitPrice.toFixed(2)} €
      </span>

      {/* Discount badge */}
      {hasDiscount ? (
        <span className="font-orbitron text-[9px] bg-neon-red/15 text-neon-red border border-neon-red/30 rounded-sm px-1 py-0.5 shrink-0">
          -{line.discountRate}%
        </span>
      ) : (
        /* Placeholder to keep layout aligned */
        <span className="w-[34px] shrink-0" />
      )}

      {/* Line total */}
      <span
        className={cn(
          'font-orbitron text-xs min-w-[4rem] text-right shrink-0',
          hasDiscount ? 'neon-green' : 'text-[#d0d0f0]',
        )}
      >
        {line.lineTotal.toFixed(2)} €
      </span>

      {/* Savings annotation */}
      {hasDiscount && (
        <span className="font-share-tech text-[10px] text-steel/40 whitespace-nowrap shrink-0">
          (−{(lineGross - line.lineTotal).toFixed(2)} €)
        </span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

export interface CartSummaryProps {
  priceBreakdown?: PriceBreakdown;
  isLoading: boolean;
  error?: Error | null;
  onRecalculate: () => void;
}

export function CartSummary({
  priceBreakdown,
  isLoading,
  error,
  onRecalculate,
}: CartSummaryProps) {
  const hasLines = (priceBreakdown?.lines?.length ?? 0) > 0;
  const totalDiscount = (priceBreakdown?.discounts ?? []).reduce((s, d) => s + d.amount, 0);
  const firstDiscount = priceBreakdown?.discounts[0];

  return (
    <div className="flex flex-col rounded border border-dark-border bg-dark-card overflow-hidden">
      {/* ── Panel header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="font-orbitron text-[9px] tracking-[0.35em] text-steel/50 uppercase">
          Résumé de facturation
        </span>
        <button
          onClick={onRecalculate}
          disabled={isLoading}
          className="flex items-center gap-1.5 font-rajdhani text-xs text-steel/50 hover:text-neon-blue transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Recalculer le prix"
          title="Recalculer"
        >
          <RefreshCw size={11} className={cn(isLoading && 'animate-spin')} />
          Recalculer
        </button>
      </div>

      {/* ── Error alert ─────────────────────────────────────────────── */}
      {error && (
        <div className="mx-3 mb-2 flex items-start gap-2 rounded border border-neon-red/30 bg-neon-red/5 px-3 py-2">
          <AlertTriangle size={13} className="text-neon-red mt-0.5 shrink-0" />
          <p className="font-share-tech text-xs text-neon-red leading-relaxed">
            {error.message}
          </p>
        </div>
      )}

      {/* ── Per-line API breakdown ───────────────────────────────────── */}
      {hasLines && (
        <div className="flex flex-col mx-2 mb-2">
          {/* Column headers */}
          <div className="flex items-center gap-2 px-2 pb-1 border-b border-dark-border/60">
            <span className="flex-1 font-share-tech text-[9px] tracking-widest text-steel/35 uppercase">Film</span>
            <span className="font-share-tech text-[9px] tracking-widest text-steel/35 uppercase">Qté × Prix</span>
            <span className="w-[34px]" />
            <span className="font-share-tech text-[9px] tracking-widest text-steel/35 uppercase min-w-[4rem] text-right">Total</span>
          </div>

          {/* Scrollable line items */}
          <div
            className="overflow-y-auto max-h-40
              [&::-webkit-scrollbar]:w-1
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-neon-blue/30
              [&::-webkit-scrollbar-thumb:hover]:bg-neon-blue/60"
          >
            {priceBreakdown!.lines!.map((line) => (
              <LineRow key={line.productId} line={line} />
            ))}
          </div>

          {/* Subtotal row */}
          <div className="flex items-center justify-between px-2 pt-2 mt-1 border-t border-dark-border/60">
            <span className="font-rajdhani text-xs text-steel/70 uppercase tracking-wider">
              Sous-total brut
            </span>
            <span className="font-orbitron text-xs text-[#d0d0f0]">
              {priceBreakdown!.subtotal.toFixed(2)} €
            </span>
          </div>

          {/* Discount rows */}
          {(priceBreakdown?.discounts ?? []).map((d, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-1.5">
                <Tag size={10} className="text-neon-red/70" />
                <span className="font-share-tech text-[11px] text-neon-red/90">{d.label}</span>
              </div>
              <span className="font-orbitron text-xs neon-red">
                -{d.amount.toFixed(2)} €
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Time Circuit (grand total) ────────────────────────────────── */}
      <div className="px-3 pb-3 pt-2 border-t border-dark-border/60">
        <TimeCircuit
          subtotal={priceBreakdown?.subtotal ?? 0}
          discountAmount={totalDiscount}
          discountLabel={firstDiscount?.label?.toUpperCase()}
          total={priceBreakdown?.total ?? 0}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
