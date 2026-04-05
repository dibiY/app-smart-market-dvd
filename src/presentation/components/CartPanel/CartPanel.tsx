import { Minus, Plus, Trash2, Tag } from 'lucide-react';
import type { CartItem } from '../../../domain/entities/Cart';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';

// ─── Single line item ─────────────────────────────────────────────────────
interface CartItemRowProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

function CartItemRow({ item, onIncrement, onDecrement, onRemove }: CartItemRowProps) {
  const isBttf = item.product.category === 'bttf';
  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded border px-3 py-2 bg-deep-black/60 animate-slide-in transition-colors',
        isBttf
          ? 'border-neon-orange/20 hover:border-neon-orange/40'
          : 'border-dark-border hover:border-neon-blue/30',
      )}
    >
      {/* Title */}
      <p className="flex-1 font-rajdhani text-sm font-medium text-[#d0d0f0] truncate">
        {item.product.title}
      </p>

      {/* Qty controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onDecrement}
          className="flex h-6 w-6 items-center justify-center rounded border border-dark-border text-steel hover:border-neon-blue/50 hover:text-neon-blue transition-colors cursor-pointer"
          aria-label="Diminuer quantité"
        >
          <Minus size={10} />
        </button>
        <span className="font-orbitron text-xs w-5 text-center text-neon-blue">
          {item.quantity}
        </span>
        <button
          onClick={onIncrement}
          className="flex h-6 w-6 items-center justify-center rounded border border-dark-border text-steel hover:border-neon-blue/50 hover:text-neon-blue transition-colors cursor-pointer"
          aria-label="Augmenter quantité"
        >
          <Plus size={10} />
        </button>
      </div>

      {/* Line total */}
      <span
        className={cn(
          'font-orbitron text-sm min-w-[3.5rem] text-right',
          isBttf ? 'text-neon-orange' : 'text-neon-blue',
        )}
      >
        {(item.product.price * item.quantity).toFixed(2)} €
      </span>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-steel hover:text-neon-red transition-all cursor-pointer"
        aria-label={`Supprimer ${item.product.title}`}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Cart item list panel ─────────────────────────────────────────────────

export interface CartPanelProps {
  items: CartItem[];
  totalItems: number;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export function CartPanel({
  items,
  totalItems,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
}: CartPanelProps) {
  const isEmpty = items.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-orbitron text-sm font-bold neon-blue tracking-widest uppercase">
          Panier
          {totalItems > 0 && (
            <span className="ml-2 font-orbitron text-xs bg-neon-blue/15 border border-neon-blue/40 text-neon-blue rounded-sm px-1.5 py-0.5">
              {totalItems}
            </span>
          )}
        </h2>

        {!isEmpty && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Vider
          </Button>
        )}
      </div>

      {/* Item list */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded border border-dark-border/50 border-dashed bg-dark-card/30 py-10 text-center">
          <Tag size={28} className="text-steel/40" />
          <p className="font-rajdhani text-sm text-steel/60">
            Votre panier est vide. <br />
            Ajoutez des DVDs depuis le catalogue.
          </p>
        </div>
      ) : (
        <div
          className="flex flex-col gap-1.5 overflow-y-auto max-h-[160px] pr-0.5
            [&::-webkit-scrollbar]:w-[3px]
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-neon-blue/25
            [&::-webkit-scrollbar-thumb:hover]:bg-neon-blue/55"
        >
          {items.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              onIncrement={() => onIncrement(item.product.id)}
              onDecrement={() => onDecrement(item.product.id)}
              onRemove={() => onRemove(item.product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

