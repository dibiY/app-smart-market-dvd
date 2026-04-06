import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { Product } from '../../../domain/entities/Product';
import { groupProductsBySaga } from '../../../domain/utils/groupProductsBySaga';
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
        (p.sagaId?.toLowerCase().includes(q)) ||
        (p.bttfPart !== undefined && `part ${p.bttfPart}`.includes(q)),
    );
  }, [products, query]);

  // Delegate grouping logic to the domain utility (pure function, no side effects)
  const groups = useMemo(() => groupProductsBySaga(filtered), [filtered]);

  const isEmpty = groups.length === 0;

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
          {groups.map((group) => {
            const isVirtual = group.isVirtual;
            const label = isVirtual ? 'Autres produits' : group.sagaName;
            const accent = isVirtual
              ? NO_SAGA_ACCENT
              : (SAGA_ACCENTS[group.sagaName] ?? DEFAULT_SAGA_ACCENT);

            return (
              <section key={group.sagaName}>
                <SectionHeader label={label} count={group.products.length} accent={accent} />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {group.products.map((p) => (
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
        </>
      )}
    </div>
  );
}

