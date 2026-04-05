import { cn } from '../../../lib/utils';
import { Spinner } from '../ui/Spinner';

// ─── LED digit with "ghost" unlit segments ────────────────────────────────
function LedChar({
  char,
  rgbGlow,
}: {
  char: string;
  rgbGlow: string;
}) {
  return (
    <span className="relative inline-block min-w-[0.62em] text-center">
      {/* Faint ghost "8" mimics unlit LED segments */}
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

// ─── One display row (SUBTOTAL / DISCOUNT / TOTAL) ────────────────────────
interface CircuitRowProps {
  label: string;
  value: string;
  hexColor: string;
  rgbGlow: string;
  /** left rail color */
  railClass: string;
}

function CircuitRow({ label, value, hexColor, rgbGlow, railClass }: CircuitRowProps) {
  return (
    <div className="relative select-none">
      {/* Row label */}
      <div className="px-4 pt-1 pb-0">
        <span className="font-share-tech text-[9px] tracking-[0.3em] text-steel/50 uppercase">
          {label}
        </span>
      </div>

      {/* Display panel */}
      <div
        className={cn('relative flex items-center justify-end gap-1 px-4 py-1.5 border-l-4 bg-black/70 overflow-hidden', railClass)}
        style={{ boxShadow: `inset 0 0 40px rgba(${rgbGlow}, 0.06)` }}
      >
        {/* CRT scanlines */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.09) 3px,rgba(0,0,0,0.09) 4px)',
          }}
        />

        {/* Digits */}
        <span
          className="font-orbitron text-2xl tracking-wider z-20"
          style={{
            color: hexColor,
            textShadow: `0 0 6px ${hexColor}, 0 0 14px rgba(${rgbGlow}, 0.45)`,
          }}
        >
          {value.split('').map((ch, i) => (
            <LedChar key={i} char={ch} rgbGlow={rgbGlow} />
          ))}
        </span>

        {/* Currency symbol */}
        <span
          className="font-orbitron text-sm tracking-wider z-20 mb-0.5"
          style={{ color: hexColor, opacity: 0.9 }}
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

/** Formats a number as a fixed-width string like " 47.00" (7 chars). */
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
  return (
    <div className={cn('relative', className)}>
      {/* Outer frame */}
      <div className="rounded-sm border border-dark-border bg-[#080812] overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0c0c1c] border-b border-dark-border">
          <span className="font-orbitron text-[9px] tracking-[0.4em] text-steel/50 uppercase">
            Time Circuit — Price Display
          </span>
          <div className="flex gap-1.5 items-center">
            <span
              className="w-2 h-2 rounded-full bg-neon-green"
              style={{ boxShadow: '0 0 6px #00ff88' }}
            />
            <span
              className="w-2 h-2 rounded-full bg-neon-yellow"
              style={{ boxShadow: '0 0 6px #ffd700' }}
            />
            <span
              className="w-2 h-2 rounded-full bg-neon-red"
              style={{ boxShadow: '0 0 6px #ff3333' }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <Spinner />
            <span className="font-orbitron text-xs text-neon-blue/70 tracking-widest animate-pulse">
              CALCULATING...
            </span>
          </div>
        ) : (
          <div className="divide-y divide-dark-border/60">
            {/* SUBTOTAL — yellow */}
            <CircuitRow
              label="SUBTOTAL BRUT"
              value={ledFmt(subtotal)}
              hexColor="#ffd700"
              rgbGlow="255,215,0"
              railClass="border-[#ffd700]/70"
            />

            {/* DISCOUNT — red (only when applicable) */}
            {discountAmount > 0 && (
              <CircuitRow
                label={discountLabel ?? 'SAGA BTTF DISCOUNT'}
                value={ledFmt(discountAmount, '-')}
                hexColor="#ff3333"
                rgbGlow="255,51,51"
                railClass="border-[#ff3333]/70"
              />
            )}

            {/* TOTAL — green (hero row) */}
            <CircuitRow
              label="TOTAL À PAYER"
              value={ledFmt(total)}
              hexColor="#00ff88"
              rgbGlow="0,255,136"
              railClass="border-[#00ff88]/70"
            />
          </div>
        )}

        {/* Bottom flame stripe */}
        <div className="h-1.5 bg-gradient-to-r from-neon-orange/50 via-neon-blue/40 to-neon-orange/50" />
      </div>

      {/* Corner bolt decorations */}
      {(['top-1.5 left-1.5', 'top-1.5 right-1.5', 'bottom-1.5 left-1.5', 'bottom-1.5 right-1.5'] as const).map(
        (pos) => (
          <div
            key={pos}
            className={`absolute w-2 h-2 rounded-full bg-[#1a1a3e] border border-[#44446a] ${pos}`}
          />
        ),
      )}
    </div>
  );
}
