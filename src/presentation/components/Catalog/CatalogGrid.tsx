import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { Product } from '../../../domain/entities/Product';
import { ProductCard } from '../ProductCard/ProductCard';
import { Spinner } from '../ui/Spinner';
import { cn } from '@/lib/utils';

interface CatalogGridProps {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  cartProductIds: Set<string>;
  onAdd: (product: Product) => void;
}

// ─── Per-saga section header accent ──────────────────────────────────────
interface SagaAccent {
  /** CSS utility class for the section title (e.g. "neon-orange") */
  titleClass: string;
  /** Tailwind `from-*` class for the fade separator line */
  lineClass: string;
  /** Classes for the product-count pill */
  countClass: string;
  emoji: string;
}

const SAGA_ACCENTS: Record<string, SagaAccent> = {
  BTTF: {
    titleClass: 'neon-orange',
    lineClass: 'from-neon-orange/40',
    countClass: 'text-neon-orange/70 border-neon-orange/30 bg-neon-orange/10',
    emoji: '⚡',
  },
  'Star Wars': {
    titleClass: 'neon-yellow',
    lineClass: 'from-neon-yellow/40',
    countClass: 'text-neon-yellow/70 border-neon-yellow/30 bg-neon-yellow/10',
    emoji: '✦',
  },
  'Indiana Jones': {
    titleClass: 'neon-yellow',
    lineClass: 'from-neon-yellow/40',
    countClass: 'text-neon-yellow/70 border-neon-yellow/30 bg-neon-yellow/10',
    emoji: '◈',
  },
  Terminator: {
    titleClass: 'neon-red',
    lineClass: 'from-neon-red/40',
    countClass: 'text-neon-red/70 border-neon-red/30 bg-neon-red/10',
    emoji: '⬡',
  },
  Alien: {
    titleClass: 'neon-green',
    lineClass: 'from-neon-green/40',
    countClass: 'text-neon-green/70 border-neon-green/30 bg-neon-green/10',
    emoji: '◉',
  },
  Matrix: {
    titleClass: 'neon-green',
    lineClass: 'from-neon-green/40',
    countClass: 'text-neon-green/70 border-neon-green/30 bg-neon-green/10',
    emoji: '◈',
  },
};

const DEFAULT_SAGA_ACCENT: SagaAccent = {
  titleClass: 'neon-blue',
  lineClass: 'from-neon-blue/40',
  countClass: 'text-neon-blue/70 border-neon-blue/30 bg-neon-blue/10',
  emoji: '◆',
};

const NO_SAGA_ACCENT: SagaAccent = {
  titleClass: 'text-steel/55',
  lineClass: 'from-steel/25',
  countClass: 'text-steel/50 border-steel/20 bg-steel/10',
  emoji: '▸',
};

// ─── Section header ───────────────────────────────────────────────────────
function SectionHeader({
  label,
  count,
  accent,
}: {
  label: string;
  count: number;
  accent: SagaAccent;
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2
        className={cn(
          'font-orbitron text-xs font-bold tracking-[0.3em] uppercase whitespace-nowrap',
          accent.titleClass,
        )}
      >
        <span className="mr-1.5 opacity-80">{accent.emoji}</span>
        {label}
      </h2>
      <span
        className={cn(
          'font-orbitron text-[9px] rounded-sm border px-1.5 py-0.5 shrink-0',
          accent.countClass,
        )}
      >
        {count}
      </span>
      <div
        className={cn(
          'flex-1 h-px bg-gradient-to-r to-transparent',
          accent.lineClass,
        )}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────
export function CatalogGrid({ products, isLoading, error, cartProductIds, onAdd }: CatalogGridProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.sagaName?.toLowerCase().includes(q)) ||
        (p.bttfPart !== undefined && `part ${p.bttfPart}`.includes(q)),
    );
  }, [products, query]);

  // Group into saga sections + a no-saga bucket
  const { sagaGroups, noSagaProducts } = useMemo(() => {
    const groupMap = new Map<string, Product[]>();
    const noSaga: Product[] = [];
    for (const p of filtered) {
      if (p.sagaName) {
        if (!groupMap.has(p.sagaName)) groupMap.set(p.sagaName, []);
        groupMap.get(p.sagaName)!.push(p);
      } else {
        noSaga.push(p);
      }
    }
    // BTTF first, then alphabetical
    const groups = Array.from(groupMap.entries()).sort(([a], [b]) => {
      if (a === 'BTTF') return -1;
      if (b === 'BTTF') return 1;
      return a.localeCompare(b);
    });
    return { sagaGroups: groups, noSagaProducts: noSaga };
  }, [filtered]);

  const isEmpty = sagaGroups.length === 0 && noSagaProducts.length === 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Spinner size="lg" />
        <span className="font-orbitron text-xs text-neon-blue/60 tracking-widest animate-pulse">
          LOADING CATALOG...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-neon-red/30 bg-neon-red/5 p-6 text-center">
        <p className="font-orbitron text-sm text-neon-red">Erreur de chargement</p>
        <p className="mt-1 text-xs text-steel/70">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search bar */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-steel/50 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un film ou une saga..."
          className="w-full rounded border border-dark-border bg-dark-card py-2.5 pl-9 pr-9 text-sm text-[#d0d0f0] placeholder:text-steel/40 font-rajdhani tracking-wide focus:outline-none focus:border-neon-blue/60 focus:shadow-[0_0_10px_rgba(0,212,255,0.15)] transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-steel/50 hover:text-neon-blue transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isEmpty ? (
        <p className="text-center text-steel/50 font-rajdhani py-10">
          Aucun film trouvé pour «{query}».
        </p>
      ) : (
        <>
          {/* ── Saga sections ───────────────────────────────────────── */}
          {sagaGroups.map(([sagaName, sagaProducts]) => {
            const accent = SAGA_ACCENTS[sagaName] ?? DEFAULT_SAGA_ACCENT;
            return (
              <section key={sagaName}>
                <SectionHeader label={sagaName} count={sagaProducts.length} accent={accent} />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {sagaProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      isInCart={cartProductIds.has(p.id)}
                      onAdd={onAdd}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {/* ── Non-saga products ────────────────────────────────────── */}
          {noSagaProducts.length > 0 && (
            <section>
              <SectionHeader
                label="Autres Films"
                count={noSagaProducts.length}
                accent={NO_SAGA_ACCENT}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {noSagaProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isInCart={cartProductIds.has(p.id)}
                    onAdd={onAdd}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

