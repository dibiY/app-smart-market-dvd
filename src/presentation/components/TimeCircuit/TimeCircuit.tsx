import { cn } from '../../../lib/utils';
import { Spinner } from '../ui/Spinner';

// ─── LED digit with "ghost" unlit segments ────────────────────────────────
function LedChar({ char, rgbGlow }: { char: string; rgbGlow: string }) {
  return (
    <span className="relative inline-block min-w-[0.55em] text-center">
      <span
        className="absolute inset-0 text-center select-none pointer-events-none"
        style={{ color: `rgba(${rgbGlow}, 0.07)` }}
        aria-hidden="true"
      >
        {/\d/.test(char) ? '8' : char}
      </span>
      <span className="relative z-10">{char}</span>
    </span>
  );
}

// ─── One column cell (SUBTOTAL | DISCOUNT | TOTAL) ────────────────────────
interface CircuitCellProps {
  label: string;
  value: string;
  hexColor: string;
  rgbGlow: string;
  railClass: string;
  /** TOTAL column is slightly larger */
  hero?: boolean;
}

function CircuitCell({ label, value, hexColor, rgbGlow, railClass, hero }: CircuitCellProps) {
  return (
    <div className={cn('relative flex flex-col select-none border-l-2', railClass)}>
      {/* CRT scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.07) 3px,rgba(0,0,0,0.07) 4px)',
        }}
      />

      {/* Label */}
      <div className="px-2 pt-1.5 pb-0.5">
        <span className="font-share-tech text-[8px] tracking-[0.2em] text-steel/45 uppercase leading-none">
          {label}
        </span>
      </div>

      {/* Value */}
      <div
        className="flex items-baseline justify-end gap-0.5 px-2 pb-1.5 bg-black/60"
        style={{ boxShadow: `inset 0 0 24px rgba(${rgbGlow}, 0.05)` }}
      >
        <span
          className={cn('font-orbitron tracking-wider z-20', hero ? 'text-xl' : 'text-base')}
          style={{
            color: hexColor,
            textShadow: `0 0 5px ${hexColor}, 0 0 12px rgba(${rgbGlow}, 0.4)`,
          }}
        >
          {value.split('').map((ch, i) => (
            <LedChar key={i} char={ch} rgbGlow={rgbGlow} />
          ))}
        </span>
        <span
          className={cn('font-orbitron z-20 mb-px', hero ? 'text-xs' : 'text-[10px]')}
          style={{ color: hexColor, opacity: 0.85 }}
        >
          €
        </span>
      </div>
    </div>
  );
}

// ─── Vertical neon separator ──────────────────────────────────────────────
function VSep({ color }: { color: string }) {
  return (
    <div
      className="w-px self-stretch my-1.5 shrink-0"
      style={{ background: `linear-gradient(to bottom, transparent, ${color}55, transparent)` }}
    />
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

/** Formats a number as a string with 2 decimal places. */
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
      <div className="rounded-sm border border-dark-border bg-[#080812] overflow-hidden">

        {/* Header bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0c0c1c] border-b border-dark-border">
          <span className="font-orbitron text-[8px] tracking-[0.35em] text-steel/45 uppercase">
            Time Circuit — Price Display
          </span>
          <div className="flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green" style={{ boxShadow: '0 0 5px #00ff88' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-neon-yellow" style={{ boxShadow: '0 0 5px #ffd700' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-neon-red"   style={{ boxShadow: '0 0 5px #ff3333' }} />
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
          <div className="flex items-stretch bg-[#080812]">

            {/* SUBTOTAL — yellow */}
            <CircuitCell
              label="Sous-total"
              value={ledFmt(subtotal)}
              hexColor="#ffd700"
              rgbGlow="255,215,0"
              railClass="border-[#ffd700]/50 flex-1"
            />

            {hasDiscount && (
              <>
                <VSep color="#ff3333" />
                {/* DISCOUNT — red */}
                <CircuitCell
                  label={discountLabel ?? 'DISCOUNT'}
                  value={ledFmt(discountAmount, '-')}
                  hexColor="#ff3333"
                  rgbGlow="255,51,51"
                  railClass="border-[#ff3333]/50 flex-1"
                />
              </>
            )}

            <VSep color="#00ff88" />

            {/* TOTAL — green hero */}
            <CircuitCell
              label="Total à payer"
              value={ledFmt(total)}
              hexColor="#00ff88"
              rgbGlow="0,255,136"
              railClass="border-[#00ff88]/60 flex-1"
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

