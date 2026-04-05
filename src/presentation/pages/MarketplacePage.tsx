import { useMemo } from 'react';
import { Zap } from 'lucide-react';
import { useProducts } from '../../application/hooks/useProducts';
import { useCart } from '../../application/hooks/useCart';
import { CatalogGrid } from '../components/Catalog/CatalogGrid';
import { CartPanel } from '../components/CartPanel/CartPanel';
import { CartSummary } from '../components/CartSummary/CartSummary';

export default function MarketplacePage() {
  const { data: products = [], isLoading, error } = useProducts();
  const {
    items,
    totalItems,
    priceBreakdown,
    isPriceLoading,
    priceError,
    recalculate,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  const cartProductIds = useMemo(() => new Set(items.map((i) => i.product.id)), [items]);

  return (
    <div className="min-h-screen">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-dark-border/60 bg-deep-black/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Logo / brand */}
          <div className="flex items-center gap-2.5">
            <Zap
              size={20}
              className="text-neon-orange"
              style={{ filter: 'drop-shadow(0 0 6px #ff6600)' }}
            />
            <span
              className="font-orbitron text-base font-bold tracking-wider"
              style={{
                background: 'linear-gradient(90deg, #ff6600, #00d4ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Smart Market DVD
            </span>
          </div>

          {/* Cart badge */}
          <div className="flex items-center gap-2">
            {totalItems > 0 && (
              <span className="font-orbitron text-[10px] tracking-widest text-neon-blue/70">
                {totalItems} article{totalItems > 1 ? 's' : ''}{' '}
                {priceBreakdown ? `— ${priceBreakdown.total.toFixed(2)} €` : isPriceLoading ? '— ...' : ''}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Main layout ───────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-6 lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Catalog — 2/3 width on desktop */}
        <section className="lg:col-span-2">
          <CatalogGrid
            products={products}
            isLoading={isLoading}
            error={error as Error | null}
            cartProductIds={cartProductIds}
            onAdd={addItem}
          />
        </section>

        {/* Cart sidebar — sticky, split layout: CartPanel shrinks, CartSummary fills remaining height */}
        <aside className="mt-8 lg:mt-0 lg:sticky lg:top-[61px] lg:h-[calc(100vh-77px)] flex flex-col gap-3 overflow-hidden pb-3">
          {/* CartPanel: never grows, stays compact */}
          <div className="shrink-0">
            <CartPanel
              items={items}
              totalItems={totalItems}
              onIncrement={(id) => {
                const item = items.find((i) => i.product.id === id);
                if (item) updateQuantity(id, item.quantity + 1);
              }}
              onDecrement={(id) => {
                const item = items.find((i) => i.product.id === id);
                if (item) updateQuantity(id, item.quantity - 1);
              }}
              onRemove={removeItem}
              onClear={clearCart}
            />
          </div>

          {/* CartSummary: fills all remaining height, handles its own internal scroll */}
          {items.length > 0 && (
            <CartSummary
              priceBreakdown={priceBreakdown}
              isLoading={isPriceLoading}
              error={priceError}
              onRecalculate={recalculate}
              className="flex-1 min-h-0"
            />
          )}
        </aside>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="mt-16 border-t border-dark-border/40 py-6 text-center">
        <p className="font-share-tech text-[11px] tracking-widest text-steel/30 uppercase">
          Smart Market DVD · 88 mph · Back to the Future &copy; Universal Pictures
        </p>
      </footer>
    </div>
  );
}
