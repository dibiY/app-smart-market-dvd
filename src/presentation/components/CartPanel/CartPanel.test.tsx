import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartPanel } from './CartPanel';
import type { CartItem } from '../../../domain/entities/Cart';

function makeItem(id: string, title: string, price: number, qty = 1, category = 'other'): CartItem {
  return { product: { id, title, price, category }, quantity: qty };
}

const noOp = () => {};

describe('CartPanel — empty state', () => {
  it('shows the empty placeholder when cart is empty', () => {
    render(
      <CartPanel
        items={[]}
        totalItems={0}
        onIncrement={noOp}
        onDecrement={noOp}
        onRemove={noOp}
        onClear={noOp}
      />,
    );
    expect(screen.getByText(/votre panier est vide/i)).toBeInTheDocument();
  });

  it('does not show the "Vider" button when the cart is empty', () => {
    render(
      <CartPanel
        items={[]}
        totalItems={0}
        onIncrement={noOp}
        onDecrement={noOp}
        onRemove={noOp}
        onClear={noOp}
      />,
    );
    expect(screen.queryByText(/vider/i)).not.toBeInTheDocument();
  });
});

describe('CartPanel — with items', () => {
  const items = [
    makeItem('bttf-1', 'Back to the Future', 15, 2, 'bttf'),
    makeItem('sw-1', 'Star Wars', 20, 1),
  ];

  it('renders all item titles', () => {
    render(
      <CartPanel
        items={items}
        totalItems={3}
        onIncrement={noOp}
        onDecrement={noOp}
        onRemove={noOp}
        onClear={noOp}
      />,
    );
    expect(screen.getByText('Back to the Future')).toBeInTheDocument();
    expect(screen.getByText('Star Wars')).toBeInTheDocument();
  });

  it('shows the item count badge in the header', () => {
    render(
      <CartPanel
        items={items}
        totalItems={3}
        onIncrement={noOp}
        onDecrement={noOp}
        onRemove={noOp}
        onClear={noOp}
      />,
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows the "Vider" button when there are items', () => {
    render(
      <CartPanel
        items={items}
        totalItems={3}
        onIncrement={noOp}
        onDecrement={noOp}
        onRemove={noOp}
        onClear={noOp}
      />,
    );
    expect(screen.getByText(/vider/i)).toBeInTheDocument();
  });

  it('calls onClear when "Vider" is clicked', () => {
    const onClear = vi.fn();
    render(
      <CartPanel
        items={items}
        totalItems={3}
        onIncrement={noOp}
        onDecrement={noOp}
        onRemove={noOp}
        onClear={onClear}
      />,
    );
    fireEvent.click(screen.getByText(/vider/i));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('calls onIncrement with the correct productId when + is clicked', () => {
    const onIncrement = vi.fn();
    render(
      <CartPanel
        items={[makeItem('bttf-1', 'Back to the Future', 15, 1, 'bttf')]}
        totalItems={1}
        onIncrement={onIncrement}
        onDecrement={noOp}
        onRemove={noOp}
        onClear={noOp}
      />,
    );
    fireEvent.click(screen.getByLabelText(/augmenter quantité/i));
    expect(onIncrement).toHaveBeenCalledWith('bttf-1');
  });

  it('calls onDecrement with the correct productId when – is clicked', () => {
    const onDecrement = vi.fn();
    render(
      <CartPanel
        items={[makeItem('bttf-1', 'Back to the Future', 15, 2, 'bttf')]}
        totalItems={2}
        onIncrement={noOp}
        onDecrement={onDecrement}
        onRemove={noOp}
        onClear={noOp}
      />,
    );
    fireEvent.click(screen.getByLabelText(/diminuer quantité/i));
    expect(onDecrement).toHaveBeenCalledWith('bttf-1');
  });

  it('calls onRemove when the delete button is triggered', () => {
    const onRemove = vi.fn();
    render(
      <CartPanel
        items={[makeItem('bttf-1', 'Back to the Future', 15, 1, 'bttf')]}
        totalItems={1}
        onIncrement={noOp}
        onDecrement={noOp}
        onRemove={onRemove}
        onClear={noOp}
      />,
    );
    fireEvent.click(screen.getByLabelText(/supprimer back to the future/i));
    expect(onRemove).toHaveBeenCalledWith('bttf-1');
  });

  it('displays the correct line total for a multi-quantity item', () => {
    render(
      <CartPanel
        items={[makeItem('bttf-1', 'Back to the Future', 15, 3, 'bttf')]}
        totalItems={3}
        onIncrement={noOp}
        onDecrement={noOp}
        onRemove={noOp}
        onClear={noOp}
      />,
    );
    expect(screen.getByText(/45\.00/)).toBeInTheDocument();
  });
});
