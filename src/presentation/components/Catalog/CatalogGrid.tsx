import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { Product } from '../../../domain/entities/Product';
import { ProductCard } from '../ProductCard/ProductCard';
import { Spinner } from '../ui/Spinner';

interface CatalogGridProps {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  cartProductIds: Set<string>;
  onAdd: (product: Product) => void;
}

export function CatalogGrid({ products, isLoading, error, cartProductIds, onAdd }: CatalogGridProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.bttfPart !== undefined && `part ${p.bttfPart}`.includes(q)),
    );
  }, [products, query]);

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
          placeholder="Rechercher un film..."
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

      {/* Flat product grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-steel/50 font-rajdhani py-10">
          Aucun film trouvé pour «{query}».
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isInCart={cartProductIds.has(p.id)}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
