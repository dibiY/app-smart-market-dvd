import { ShoppingCart, Zap, Film } from 'lucide-react';
import type { Product } from '../../../domain/entities/Product';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../../lib/utils';

interface ProductCardProps {
  product: Product;
  isInCart: boolean;
  onAdd: (product: Product) => void;
}

const BTTF_PART_LABELS: Record<number, string> = {
  1: 'Part I',
  2: 'Part II',
  3: 'Part III',
};

export function ProductCard({ product, isInCart, onAdd }: ProductCardProps) {
  const isBttf = product.category === 'bttf';

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 rounded border bg-dark-card p-4 transition-all duration-300',
        isBttf
          ? 'border-neon-orange/30 hover:border-neon-orange/70 hover:shadow-[0_0_20px_rgba(255,102,0,0.2)]'
          : 'border-dark-border hover:border-neon-blue/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]',
      )}
    >
      {/* BTTF corner flash */}
      {isBttf && (
        <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden rounded-tr">
          <div className="absolute inset-0 bg-neon-orange/20" />
          <Zap
            size={12}
            className="absolute top-1 right-1 text-neon-orange"
            style={{ filter: 'drop-shadow(0 0 4px #ff6600)' }}
          />
        </div>
      )}

      {/* DVD icon area */}
      <div
        className={cn(
          'flex h-28 items-center justify-center rounded-sm border',
          isBttf ? 'border-neon-orange/20 bg-neon-orange/5' : 'border-dark-border bg-neon-blue/5',
        )}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover rounded-sm"
          />
        ) : (
          <Film
            size={40}
            className={cn('opacity-40', isBttf ? 'text-neon-orange' : 'text-neon-blue')}
          />
        )}
      </div>

      {/* Title & badges */}
      <div className="flex flex-col gap-1.5">
        <h3
          className={cn(
            'font-rajdhani font-semibold text-base leading-tight',
            isBttf ? 'text-neon-orange' : 'text-[#e0e0ff]',
          )}
          style={isBttf ? { textShadow: '0 0 8px rgba(255,102,0,0.4)' } : undefined}
        >
          {product.title}
        </h3>

        <div className="flex flex-wrap gap-1">
          {isBttf ? (
            <>
              <Badge variant="orange">BTTF</Badge>
              {product.bttfPart && (
                <Badge variant="orange">{BTTF_PART_LABELS[product.bttfPart]}</Badge>
              )}
              <Badge variant="yellow">{product.price} €</Badge>
            </>
          ) : (
            <>
              <Badge variant="steel">DVD</Badge>
              <Badge variant="blue">{product.price} €</Badge>
            </>
          )}
        </div>

        {product.description && (
          <p className="text-xs text-steel/80 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      {/* Price + CTA */}
      <div className="mt-auto flex items-center justify-between pt-2 border-t border-dark-border/60">
        <span
          className={cn('font-orbitron text-xl font-bold', isBttf ? 'neon-orange' : 'neon-blue')}
        >
          {product.price} €
        </span>

        <Button
          variant={isBttf ? 'orange' : 'primary'}
          size="sm"
          onClick={() => onAdd(product)}
          aria-label={`Ajouter ${product.title} au panier`}
        >
          <ShoppingCart size={14} />
          {isInCart ? 'Encore' : 'Ajouter'}
        </Button>
      </div>
    </div>
  );
}
