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

// ─── Per-saga visual theme ────────────────────────────────────────────────
interface SagaCardTheme {
  cardBorder: string;
  cardHover: string;
  iconAreaBorder: string;
  iconAreaBg: string;
  iconClass: string;
  /** Applied to the <h3> title — use .neon-* CSS utilities for color + glow */
  titleClass: string;
  priceClass: string;
  badgeVariant: 'orange' | 'yellow' | 'red' | 'green' | 'blue' | 'steel';
  buttonVariant: 'orange' | 'primary' | 'danger' | 'secondary' | 'ghost';
  cornerBg: string;
  cornerIconClass: string;
  /** Inline filter for the corner Zap icon drop-shadow */
  cornerFilter: string;
}

const SAGA_CARD_THEMES: Record<string, SagaCardTheme> = {
  BTTF: {
    cardBorder: 'border-neon-orange/30',
    cardHover: 'hover:border-neon-orange/70 hover:shadow-[0_0_20px_rgba(255,102,0,0.2)]',
    iconAreaBorder: 'border-neon-orange/20',
    iconAreaBg: 'bg-neon-orange/5',
    iconClass: 'text-neon-orange',
    titleClass: 'neon-orange',
    priceClass: 'neon-orange',
    badgeVariant: 'orange',
    buttonVariant: 'orange',
    cornerBg: 'bg-neon-orange/20',
    cornerIconClass: 'text-neon-orange',
    cornerFilter: 'drop-shadow(0 0 4px #ff6600)',
  },
  'Star Wars': {
    cardBorder: 'border-neon-yellow/30',
    cardHover: 'hover:border-neon-yellow/70 hover:shadow-[0_0_20px_rgba(255,215,0,0.2)]',
    iconAreaBorder: 'border-neon-yellow/20',
    iconAreaBg: 'bg-neon-yellow/5',
    iconClass: 'text-neon-yellow',
    titleClass: 'neon-yellow',
    priceClass: 'neon-yellow',
    badgeVariant: 'yellow',
    buttonVariant: 'primary',
    cornerBg: 'bg-neon-yellow/20',
    cornerIconClass: 'text-neon-yellow',
    cornerFilter: 'drop-shadow(0 0 4px #ffd700)',
  },
  'Indiana Jones': {
    cardBorder: 'border-neon-yellow/30',
    cardHover: 'hover:border-neon-yellow/70 hover:shadow-[0_0_20px_rgba(255,215,0,0.2)]',
    iconAreaBorder: 'border-neon-yellow/20',
    iconAreaBg: 'bg-neon-yellow/5',
    iconClass: 'text-neon-yellow',
    titleClass: 'neon-yellow',
    priceClass: 'neon-yellow',
    badgeVariant: 'yellow',
    buttonVariant: 'primary',
    cornerBg: 'bg-neon-yellow/20',
    cornerIconClass: 'text-neon-yellow',
    cornerFilter: 'drop-shadow(0 0 4px #ffd700)',
  },
  Terminator: {
    cardBorder: 'border-neon-red/30',
    cardHover: 'hover:border-neon-red/70 hover:shadow-[0_0_20px_rgba(255,51,51,0.2)]',
    iconAreaBorder: 'border-neon-red/20',
    iconAreaBg: 'bg-neon-red/5',
    iconClass: 'text-neon-red',
    titleClass: 'neon-red',
    priceClass: 'neon-red',
    badgeVariant: 'red',
    buttonVariant: 'primary',
    cornerBg: 'bg-neon-red/20',
    cornerIconClass: 'text-neon-red',
    cornerFilter: 'drop-shadow(0 0 4px #ff3333)',
  },
  Alien: {
    cardBorder: 'border-neon-green/30',
    cardHover: 'hover:border-neon-green/70 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)]',
    iconAreaBorder: 'border-neon-green/20',
    iconAreaBg: 'bg-neon-green/5',
    iconClass: 'text-neon-green',
    titleClass: 'neon-green',
    priceClass: 'neon-green',
    badgeVariant: 'green',
    buttonVariant: 'primary',
    cornerBg: 'bg-neon-green/20',
    cornerIconClass: 'text-neon-green',
    cornerFilter: 'drop-shadow(0 0 4px #00ff88)',
  },
  Matrix: {
    cardBorder: 'border-neon-green/30',
    cardHover: 'hover:border-neon-green/70 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)]',
    iconAreaBorder: 'border-neon-green/20',
    iconAreaBg: 'bg-neon-green/5',
    iconClass: 'text-neon-green',
    titleClass: 'neon-green',
    priceClass: 'neon-green',
    badgeVariant: 'green',
    buttonVariant: 'primary',
    cornerBg: 'bg-neon-green/20',
    cornerIconClass: 'text-neon-green',
    cornerFilter: 'drop-shadow(0 0 4px #00ff88)',
  },
};

/** Fallback for any saga name not in the static map */
const DEFAULT_SAGA_THEME: SagaCardTheme = {
  cardBorder: 'border-neon-blue/30',
  cardHover: 'hover:border-neon-blue/70 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]',
  iconAreaBorder: 'border-neon-blue/20',
  iconAreaBg: 'bg-neon-blue/5',
  iconClass: 'text-neon-blue',
  titleClass: 'neon-blue',
  priceClass: 'neon-blue',
  badgeVariant: 'blue',
  buttonVariant: 'primary',
  cornerBg: 'bg-neon-blue/20',
  cornerIconClass: 'text-neon-blue',
  cornerFilter: 'drop-shadow(0 0 4px #00d4ff)',
};

/**
 * Palette used for dynamic assignment of unknown sagas.
 * Cycles deterministically based on a hash of the saga name so the same
 * saga always gets the same color across renders/sessions.
 */
const DYNAMIC_PALETTE: SagaCardTheme[] = [
  DEFAULT_SAGA_THEME,
  SAGA_CARD_THEMES['Star Wars'],
  SAGA_CARD_THEMES['Terminator'],
  SAGA_CARD_THEMES['Alien'],
  SAGA_CARD_THEMES['BTTF'],
];

/** djb2-style hash → stable index into DYNAMIC_PALETTE */
function hashSagaName(name: string): number {
  let h = 5381;
  for (let i = 0; i < name.length; i++) h = (h * 33) ^ name.charCodeAt(i);
  return Math.abs(h) % DYNAMIC_PALETTE.length;
}

/** Neutral theme for products that belong to no saga */
const NO_SAGA_THEME: SagaCardTheme = {
  cardBorder: 'border-dark-border',
  cardHover: 'hover:border-steel/40 hover:shadow-[0_0_15px_rgba(136,136,170,0.08)]',
  iconAreaBorder: 'border-dark-border',
  iconAreaBg: 'bg-dark-border/20',
  iconClass: 'text-steel/50',
  titleClass: 'text-[#e0e0ff]',
  priceClass: 'neon-blue',
  badgeVariant: 'steel',
  buttonVariant: 'primary',
  cornerBg: '',
  cornerIconClass: '',
  cornerFilter: '',
};

function getTheme(sagaName: string | undefined): SagaCardTheme {
  if (!sagaName) return NO_SAGA_THEME;
  // Known saga → specific branded color
  if (SAGA_CARD_THEMES[sagaName]) return SAGA_CARD_THEMES[sagaName];
  // Unknown saga from API → deterministic neon color from palette (always distinct from NO_SAGA)
  return DYNAMIC_PALETTE[hashSagaName(sagaName)];
}

const BTTF_PART_LABELS: Record<number, string> = {
  1: 'Part I',
  2: 'Part II',
  3: 'Part III',
};

export function ProductCard({ product, isInCart, onAdd }: ProductCardProps) {
  const theme = getTheme(product.sagaName);
  const hasSaga = !!product.sagaName;

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 rounded border bg-dark-card p-4 transition-all duration-300',
        theme.cardBorder,
        theme.cardHover,
      )}
    >
      {/* Saga corner flash — only for saga products */}
      {hasSaga && (
        <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden rounded-tr">
          <div className={cn('absolute inset-0', theme.cornerBg)} />
          <Zap
            size={12}
            className={cn('absolute top-1 right-1', theme.cornerIconClass)}
            style={{ filter: theme.cornerFilter }}
          />
        </div>
      )}

      {/* DVD icon area */}
      <div
        className={cn(
          'flex h-28 items-center justify-center rounded-sm border',
          theme.iconAreaBorder,
          theme.iconAreaBg,
        )}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover rounded-sm"
          />
        ) : (
          <Film size={40} className={cn('opacity-40', theme.iconClass)} />
        )}
      </div>

      {/* Title & badges */}
      <div className="flex flex-col gap-1.5">
        <h3 className={cn('font-rajdhani font-semibold text-base leading-tight', theme.titleClass)}>
          {product.title}
        </h3>

        <div className="flex flex-wrap gap-1">
          {hasSaga ? (
            <>
              <Badge variant={theme.badgeVariant}>{product.sagaName}</Badge>
              {product.bttfPart && (
                <Badge variant={theme.badgeVariant}>{BTTF_PART_LABELS[product.bttfPart]}</Badge>
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
        <span className={cn('font-orbitron text-xl font-bold', theme.priceClass)}>
          {product.price} €
        </span>

        <Button
          variant={theme.buttonVariant}
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
