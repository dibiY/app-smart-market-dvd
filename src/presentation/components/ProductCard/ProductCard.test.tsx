import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import type { Product } from '../../../domain/entities/Product';

// ─── Fixtures ─────────────────────────────────────────────────────────────
const sagaProduct: Product = {
  id: 'bttf-1',
  title: 'Back to the Future',
  price: 15,
  category: 'bttf',
  sagaName: 'BTTF',
  description: 'Marty McFly travels to 1955.',
};

const standaloneProduct: Product = {
  id: 'ghost-1',
  title: 'Ghostbusters',
  price: 20,
  category: 'other',
  description: 'Who you gonna call?',
};

// ─── ProductCard ─────────────────────────────────────────────────────────
describe('ProductCard', () => {
  describe('rendering — saga product', () => {
    it('renders the product title', () => {
      render(<ProductCard product={sagaProduct} isInCart={false} onAdd={vi.fn()} />);
      expect(screen.getByText('Back to the Future')).toBeInTheDocument();
    });

    it('renders the product price', () => {
      render(<ProductCard product={sagaProduct} isInCart={false} onAdd={vi.fn()} />);
      // Price appears in badge and in bottom display
      expect(screen.getAllByText(/15/)).not.toHaveLength(0);
    });

    it('renders the saga name badge', () => {
      render(<ProductCard product={sagaProduct} isInCart={false} onAdd={vi.fn()} />);
      expect(screen.getByText('BTTF')).toBeInTheDocument();
    });

    it('renders the description', () => {
      render(<ProductCard product={sagaProduct} isInCart={false} onAdd={vi.fn()} />);
      expect(screen.getByText('Marty McFly travels to 1955.')).toBeInTheDocument();
    });

    it('shows "Ajouter" CTA when product is not in cart', () => {
      render(<ProductCard product={sagaProduct} isInCart={false} onAdd={vi.fn()} />);
      expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument();
    });

    it('shows "Encore" CTA when product is already in cart', () => {
      render(<ProductCard product={sagaProduct} isInCart={true} onAdd={vi.fn()} />);
      // aria-label stays descriptive; check visible button text instead
      expect(screen.getByText(/encore/i)).toBeInTheDocument();
    });
  });

  describe('rendering — standalone product (no saga)', () => {
    it('renders the product title', () => {
      render(<ProductCard product={standaloneProduct} isInCart={false} onAdd={vi.fn()} />);
      expect(screen.getByText('Ghostbusters')).toBeInTheDocument();
    });

    it('does not render a saga badge for no-saga products', () => {
      render(<ProductCard product={standaloneProduct} isInCart={false} onAdd={vi.fn()} />);
      // Standalone products have no sagaName badge — should not find any saga-related text
      expect(screen.queryByText('BTTF')).not.toBeInTheDocument();
      expect(screen.queryByText('Star Wars')).not.toBeInTheDocument();
    });

    it('renders a generic DVD badge for standalone products', () => {
      render(<ProductCard product={standaloneProduct} isInCart={false} onAdd={vi.fn()} />);
      expect(screen.getByText('DVD')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('calls onAdd with the product when the button is clicked', () => {
      const onAdd = vi.fn();
      render(<ProductCard product={sagaProduct} isInCart={false} onAdd={onAdd} />);
      fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));
      expect(onAdd).toHaveBeenCalledOnce();
      expect(onAdd).toHaveBeenCalledWith(sagaProduct);
    });

    it('calls onAdd even when product is already in cart ("Encore")', () => {
      const onAdd = vi.fn();
      render(<ProductCard product={sagaProduct} isInCart={true} onAdd={onAdd} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onAdd).toHaveBeenCalledOnce();
      expect(onAdd).toHaveBeenCalledWith(sagaProduct);
    });
  });

  describe('accessibility', () => {
    it('button has a descriptive aria-label', () => {
      render(<ProductCard product={sagaProduct} isInCart={false} onAdd={vi.fn()} />);
      const btn = screen.getByRole('button');
      expect(btn).toHaveAttribute('aria-label', expect.stringContaining('Back to the Future'));
    });
  });
});
