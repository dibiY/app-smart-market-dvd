import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CatalogGrid } from './CatalogGrid';
import type { Product } from '../../../domain/entities/Product';

const noOp = () => {};

function makeProduct(id: string, title: string, overrides: Partial<Product> = {}): Product {
  return { id, title, price: 15, category: 'other', ...overrides };
}

const bttfProducts: Product[] = [
  makeProduct('bttf-1', 'Back to the Future', { category: 'bttf', sagaName: 'BTTF', sagaId: 'bttf' }),
  makeProduct('bttf-2', 'Back to the Future Part II', { category: 'bttf', sagaName: 'BTTF', sagaId: 'bttf' }),
];

const otherProducts: Product[] = [
  makeProduct('other-1', 'Random Film A'),
  makeProduct('other-2', 'Random Film B'),
];

const allProducts = [...bttfProducts, ...otherProducts];

describe('CatalogGrid — loading state', () => {
  it('shows the loading spinner when isLoading is true', () => {
    render(
      <CatalogGrid products={[]} isLoading error={null} cartProductIds={new Set()} onAdd={noOp} />,
    );
    expect(screen.getByText(/loading catalog/i)).toBeInTheDocument();
  });

  it('does not render products while loading', () => {
    render(
      <CatalogGrid
        products={allProducts}
        isLoading
        error={null}
        cartProductIds={new Set()}
        onAdd={noOp}
      />,
    );
    expect(screen.queryByText('Back to the Future')).not.toBeInTheDocument();
  });
});

describe('CatalogGrid — error state', () => {
  it('shows the error message when error is provided', () => {
    render(
      <CatalogGrid
        products={[]}
        isLoading={false}
        error={new Error('Failed to fetch')}
        cartProductIds={new Set()}
        onAdd={noOp}
      />,
    );
    expect(screen.getByText(/erreur de chargement/i)).toBeInTheDocument();
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });
});

describe('CatalogGrid — product rendering', () => {
  it('renders product cards for all products', () => {
    render(
      <CatalogGrid
        products={allProducts}
        isLoading={false}
        error={null}
        cartProductIds={new Set()}
        onAdd={noOp}
      />,
    );
    expect(screen.getByText('Back to the Future')).toBeInTheDocument();
    expect(screen.getByText('Random Film A')).toBeInTheDocument();
  });

  it('renders a section header for the BTTF saga', () => {
    render(
      <CatalogGrid
        products={allProducts}
        isLoading={false}
        error={null}
        cartProductIds={new Set()}
        onAdd={noOp}
      />,
    );
    // getByRole('heading') targets the <h2> specifically, avoiding badge/card duplicates
    expect(screen.getByRole('heading', { name: /bttf/i })).toBeInTheDocument();
  });

  it('calls onAdd with the product when add button is clicked', () => {
    const onAdd = vi.fn();
    render(
      <CatalogGrid
        products={[makeProduct('p1', 'My Film')]}
        isLoading={false}
        error={null}
        cartProductIds={new Set()}
        onAdd={onAdd}
      />,
    );
    fireEvent.click(screen.getByLabelText(/ajouter my film/i));
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1' }));
  });
});

describe('CatalogGrid — search filtering', () => {
  it('filters products by title', () => {
    render(
      <CatalogGrid
        products={allProducts}
        isLoading={false}
        error={null}
        cartProductIds={new Set()}
        onAdd={noOp}
      />,
    );
    const input = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(input, { target: { value: 'Random Film A' } });
    expect(screen.getByText('Random Film A')).toBeInTheDocument();
    expect(screen.queryByText('Back to the Future')).not.toBeInTheDocument();
  });

  it('filters products by sagaName', () => {
    render(
      <CatalogGrid
        products={allProducts}
        isLoading={false}
        error={null}
        cartProductIds={new Set()}
        onAdd={noOp}
      />,
    );
    const input = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(input, { target: { value: 'BTTF' } });
    expect(screen.getByText('Back to the Future')).toBeInTheDocument();
    expect(screen.queryByText('Random Film A')).not.toBeInTheDocument();
  });

  it('clears filters when the X button is clicked', () => {
    render(
      <CatalogGrid
        products={allProducts}
        isLoading={false}
        error={null}
        cartProductIds={new Set()}
        onAdd={noOp}
      />,
    );
    const input = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(input, { target: { value: 'BTTF' } });
    // Clear button appears after typing
    fireEvent.click(screen.getByRole('button', { name: /effacer|clear|vider/i }));
    expect(screen.getByText('Random Film A')).toBeInTheDocument();
  });

  it('shows empty state when search matches nothing', () => {
    render(
      <CatalogGrid
        products={allProducts}
        isLoading={false}
        error={null}
        cartProductIds={new Set()}
        onAdd={noOp}
      />,
    );
    const input = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(input, { target: { value: 'xyznotfound' } });
    expect(screen.queryByText('Back to the Future')).not.toBeInTheDocument();
    expect(screen.queryByText('Random Film A')).not.toBeInTheDocument();
  });
});
