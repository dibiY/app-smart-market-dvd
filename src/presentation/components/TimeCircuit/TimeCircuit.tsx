import { cn } from '../../../lib/utils';
import { Spinner } from '../ui/Spinner';

// ─── LED digit with "ghost" unlit segments ────────────────────────────────
function LedChar({ char, rgbGlow }: { char: string; rgbGlow: string }) {
  return (
    <span className="relative inline-block min-w-[0.55em] text-center">
      <span
        className="absolute inset-0 text-center select-none pointer-events-none"
        style={{ color: `rgba(${rgbGlow}, 0.08)` }}
        aria-hidden="true"
      >
        {/\d/.test(char) ? '8' : char}
      </span>
      <span className="relative z-10">{char}</span>
    </span>
  );
}

// ─── One column cell ──────────────────────────────────────────────────────
interface CircuitCellProps {
  label: string;
  value: string;
  hexColor: string;
  rgbGlow: string;
  /** Remove left border on the first (leftmost) cell to avoid double-border */
  first?: boolean;
  /** TOTAL column: larger digit + stronger glow */
  hero?: boolean;
}

function CircuitCell({ label, value, hexColor, rgbGlow, first, hero }: CircuitCellProps) {
  return (
    <div className="relative flex flex-col flex-1 select-none overflow-hidden">
      {/* Neon accent rail on the left edge (skipped for first cell) */}
      {!first && (
        <div
          className="absolute left-0 inset-y-0 w-px z-20"
          style={{
            background: `linear-gradient(to bottom, transparent 5%, ${hexColor}55 35%, ${hexColor}77 65%, transparent 95%)`,
          }}
        />
      )}

      {/* CRT scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)',
        }}
      />

      {/* ── Label area — fixed 2-line height so all columns stay flush ── */}
      <div className="h-8 flex items-start px-2.5 pt-1.5 overflow-hidden shrink-0">
        <span
          className="font-share-tech text-[7.5px] tracking-[0.18em] text-steel/40 uppercase leading-tight line-clamp-2 cursor-default"
          title={label}
        >
          {label}
        </span>
      </div>

      {/* ── Value area — flex-1 keeps all cells the same total height ── */}
      <div
        className="flex-1 flex items-center justify-end gap-0.5 px-2.5 pb-2 relative"
        style={{
          background: `linear-gradient(160deg, transparent 30%, rgba(${rgbGlow}, 0.05) 100%)`,
          boxShadow: `inset 0 -10px 20px rgba(${rgbGlow}, 0.04)`,
        }}
      >
        <span
          className={cn('font-orbitron tracking-wider z-20', hero ? 'text-[1.3rem]' : 'text-[1rem]')}
          style={{
            color: hexColor,
            textShadow: `0 0 6px ${hexColor}, 0 0 ${hero ? 22 : 12}px rgba(${rgbGlow}, ${hero ? 0.6 : 0.4})`,
          }}
        >
          {value.split('').map((ch, i) => (
            <LedChar key={i} char={ch} rgbGlow={rgbGlow} />
          ))}
        </span>
        <span
          className={cn('font-orbitron z-20 mb-0.5', hero ? 'text-[0.6rem]' : 'text-[0.55rem]')}
          style={{ color: hexColor, opacity: 0.8 }}
        >
          €
        </span>
      </div>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────
export interface TimeCircuitProps {
  subtotal: number;
  discountAmount: number;
  discountLabel?: string;
  total: number;
  isLoading?: boolean;
  className?: string;
}

function ledFmt(n: number, prefix = ''): string {
  return prefix + n.toFixed(2);
}

export function TimeCircuit({
  subtotal,
  discountAmount,
  discountLabel,
  total,
  isLoading,
  className,
}: TimeCircuitProps) {
  const hasDiscount = discountAmount > 0;

  return (
    <div className={cn('relative', className)}>
      {/* Outer frame */}
      <div
        className="rounded-sm border border-dark-border/80 bg-[#080812] overflow-hidden"
        style={{ boxShadow: '0 0 18px rgba(0,212,255,0.05), inset 0 0 28px rgba(0,0,0,0.35)' }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0c0c1c] border-b border-dark-border/70">
          <span className="font-orbitron text-[7.5px] tracking-[0.35em] text-steel/40 uppercase">
            Time Circuit — Price Display
          </span>
          <div className="flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green"  style={{ boxShadow: '0 0 5px #00ff88' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-neon-yellow" style={{ boxShadow: '0 0 5px #ffd700' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-neon-red"    style={{ boxShadow: '0 0 5px #ff3333' }} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-5">
            <Spinner />
            <span className="font-orbitron text-[10px] text-neon-blue/70 tracking-widest animate-pulse">
              CALCULATING...
            </span>
          </div>
        ) : (
          /* ── Horizontal columns ──────────────────────────────────── */
          <div className="flex items-stretch divide-x divide-dark-border/40">
            {/* SUBTOTAL — yellow */}
            <CircuitCell
              label="Sous-total brut"
              value={ledFmt(subtotal)}
              hexColor="#ffd700"
              rgbGlow="255,215,0"
              first
            />

            {/* DISCOUNT — red (conditional) */}
            {hasDiscount && (
              <CircuitCell
                label={discountLabel ?? 'Remise'}
                value={ledFmt(discountAmount, '-')}
                hexColor="#ff3333"
                rgbGlow="255,51,51"
              />
            )}

            {/* TOTAL — green hero */}
            <CircuitCell
              label="Total à payer"
              value={ledFmt(total)}
              hexColor="#00ff88"
              rgbGlow="0,255,136"
              hero
            />
          </div>
        )}

        {/* Bottom flame stripe */}
        <div className="h-1 bg-gradient-to-r from-neon-orange/50 via-neon-blue/40 to-neon-orange/50" />
      </div>

      {/* Corner bolt decorations */}
      {(['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'] as const).map((pos) => (
        <div
          key={pos}
          className={`absolute w-1.5 h-1.5 rounded-full bg-[#1a1a3e] border border-[#44446a] ${pos}`}
        />
      ))}
    </div>
  );
}

