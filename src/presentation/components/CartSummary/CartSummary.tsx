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
    <div className="group flex items-center gap-1.5 rounded px-2 py-1 hover:bg-white/[0.02] transition-colors">
      {/* Product name */}
      <p className="flex-1 font-rajdhani text-[11px] text-steel/90 truncate min-w-0">
        {line.productName}
      </p>

      {/* Qty × unit price */}
      <span className="font-share-tech text-[10px] text-steel/55 whitespace-nowrap shrink-0">
        {line.quantity} × {line.unitPrice.toFixed(2)} €
      </span>

      {/* Discount badge */}
      {hasDiscount ? (
        <span className="font-orbitron text-[8px] bg-neon-red/15 text-neon-red border border-neon-red/30 rounded-sm px-1 py-0.5 shrink-0">
          -{line.discountRate}%
        </span>
      ) : (
        <span className="w-[30px] shrink-0" />
      )}

      {/* Line total */}
      <span
        className={cn(
          'font-orbitron text-[11px] min-w-[3.5rem] text-right shrink-0',
          hasDiscount ? 'neon-green' : 'text-[#d0d0f0]',
        )}
      >
        {line.lineTotal.toFixed(2)} €
      </span>

      {/* Savings annotation */}
      {hasDiscount && (
        <span className="font-share-tech text-[9px] text-steel/40 whitespace-nowrap shrink-0">
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
  /** Extra classes forwarded to the outer container (e.g. flex-1 min-h-0) */
  className?: string;
}

export function CartSummary({
  priceBreakdown,
  isLoading,
  error,
  onRecalculate,
  className,
}: CartSummaryProps) {
  const hasLines = (priceBreakdown?.lines?.length ?? 0) > 0;
  const totalDiscount = (priceBreakdown?.discounts ?? []).reduce((s, d) => s + d.amount, 0);
  const firstDiscount = priceBreakdown?.discounts[0];

  return (
    <div className={cn('flex flex-col rounded border border-dark-border bg-dark-card overflow-hidden', className)}>

      {/* ── FIXED: Panel header ─────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-2.5 pb-2 border-b border-dark-border/50">
        <span className="font-orbitron text-[9px] tracking-[0.35em] text-steel/50 uppercase">
          Résumé de facturation
        </span>
        <button
          onClick={onRecalculate}
          disabled={isLoading}
          className="flex items-center gap-1.5 font-rajdhani text-[11px] text-steel/50 hover:text-neon-blue transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Recalculer le prix"
          title="Recalculer"
        >
          <RefreshCw size={10} className={cn(isLoading && 'animate-spin')} />
          Recalculer
        </button>
      </div>

      {/* ── FIXED: Column headers (only when line data is available) ── */}
      {hasLines && (
        <div className="shrink-0 flex items-center gap-2 px-4 py-1 border-b border-dark-border/40 bg-dark-card">
          <span className="flex-1 font-share-tech text-[8px] tracking-widest text-steel/30 uppercase">Film</span>
          <span className="font-share-tech text-[8px] tracking-widest text-steel/30 uppercase">Qté × Prix</span>
          <span className="w-[30px]" />
          <span className="font-share-tech text-[8px] tracking-widest text-steel/30 uppercase min-w-[3.5rem] text-right">Total</span>
        </div>
      )}

      {/* ── SCROLLABLE: Line rows + subtotal + discounts + error ─────── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto
          [&::-webkit-scrollbar]:w-[3px]
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-neon-blue/25
          [&::-webkit-scrollbar-thumb:hover]:bg-neon-blue/55"
      >
        {/* Error alert */}
        {error && (
          <div className="mx-3 mt-2 mb-1 flex items-start gap-2 rounded border border-neon-red/30 bg-neon-red/5 px-3 py-1.5">
            <AlertTriangle size={12} className="text-neon-red mt-0.5 shrink-0" />
            <p className="font-share-tech text-[11px] text-neon-red leading-relaxed">
              {error.message}
            </p>
          </div>
        )}

        {hasLines && (
          <div className="mx-2 pb-1">
            {/* Line items */}
            {priceBreakdown!.lines!.map((line) => (
              <LineRow key={line.productId} line={line} />
            ))}

            {/* Subtotal row */}
            <div className="flex items-center justify-between px-2 pt-1.5 mt-1 border-t border-dark-border/60">
              <span className="font-rajdhani text-[11px] text-steel/70 uppercase tracking-wider">
                Sous-total brut
              </span>
              <span className="font-orbitron text-[11px] text-[#d0d0f0]">
                {priceBreakdown!.subtotal.toFixed(2)} €
              </span>
            </div>

            {/* Discount rows */}
            {(priceBreakdown?.discounts ?? []).map((d, i) => (
              <div key={i} className="flex items-center justify-between px-2 py-0.5">
                <div className="flex items-center gap-1.5 min-w-0 mr-2">
                  <Tag size={9} className="text-neon-red/70 shrink-0" />
                  <span className="font-share-tech text-[10px] text-neon-red/90 truncate">{d.label}</span>
                </div>
                <span className="font-orbitron text-[11px] neon-red shrink-0">
                  -{d.amount.toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FIXED FOOTER: Time Circuit — always fully visible ────────── */}
      <div className="shrink-0 border-t border-dark-border/60 px-2.5 pb-2.5 pt-2">
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
