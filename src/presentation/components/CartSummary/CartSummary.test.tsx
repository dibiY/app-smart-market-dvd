import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartSummary } from './CartSummary';
import type { PriceBreakdown } from '../../../domain/entities/PriceBreakdown';

const noOp = () => {};

const breakdown: PriceBreakdown = {
  subtotal: 45,
  discounts: [{ label: 'Saga BTTF Discount -20% (3 volets)', amount: 9 }],
  total: 36,
  lines: [
    {
      productId: 'bttf-1',
      productName: 'Back to the Future',
      quantity: 2,
      unitPrice: 15,
      lineTotal: 24,
      discountRate: 20,
    },
    {
      productId: 'bttf-2',
      productName: 'BTTF Part II',
      quantity: 1,
      unitPrice: 15,
      lineTotal: 12,
      discountRate: 20,
    },
  ],
  currency: 'EUR',
};

describe('CartSummary — header', () => {
  it('renders the panel header label', () => {
    render(<CartSummary priceBreakdown={breakdown} isLoading={false} onRecalculate={noOp} />);
    expect(screen.getByText(/résumé de facturation/i)).toBeInTheDocument();
  });

  it('renders the Recalculer button', () => {
    render(<CartSummary priceBreakdown={breakdown} isLoading={false} onRecalculate={noOp} />);
    expect(screen.getByLabelText(/recalculer le prix/i)).toBeInTheDocument();
  });

  it('calls onRecalculate when the button is clicked', () => {
    const onRecalculate = vi.fn();
    render(
      <CartSummary priceBreakdown={breakdown} isLoading={false} onRecalculate={onRecalculate} />,
    );
    fireEvent.click(screen.getByLabelText(/recalculer le prix/i));
    expect(onRecalculate).toHaveBeenCalledOnce();
  });

  it('disables the Recalculer button while loading', () => {
    render(<CartSummary priceBreakdown={breakdown} isLoading onRecalculate={noOp} />);
    expect(screen.getByLabelText(/recalculer le prix/i)).toBeDisabled();
  });
});

describe('CartSummary — line items', () => {
  it('renders each product name in the line table', () => {
    render(<CartSummary priceBreakdown={breakdown} isLoading={false} onRecalculate={noOp} />);
    expect(screen.getByText('Back to the Future')).toBeInTheDocument();
    expect(screen.getByText('BTTF Part II')).toBeInTheDocument();
  });

  it('renders the subtotal value', () => {
    render(<CartSummary priceBreakdown={breakdown} isLoading={false} onRecalculate={noOp} />);
    expect(screen.getByText(/45\.00/)).toBeInTheDocument();
  });

  it('renders the discount label', () => {
    render(<CartSummary priceBreakdown={breakdown} isLoading={false} onRecalculate={noOp} />);
    // Label appears in both the discount row and the TimeCircuit header (uppercased) — check at least one
    expect(screen.getAllByText(/saga bttf discount -20%/i).length).toBeGreaterThan(0);
  });

  it('renders the discount amount with a minus sign', () => {
    render(<CartSummary priceBreakdown={breakdown} isLoading={false} onRecalculate={noOp} />);
    expect(screen.getByText(/-9\.00 €/)).toBeInTheDocument();
  });
});

describe('CartSummary — error state', () => {
  it('shows the error message when error prop is provided', () => {
    render(
      <CartSummary
        isLoading={false}
        error={new Error('Le film "Matrix" n\'est pas reconnu')}
        onRecalculate={noOp}
      />,
    );
    expect(screen.getByText(/matrix/i)).toBeInTheDocument();
  });

  it('does not show error when error prop is null', () => {
    render(
      <CartSummary priceBreakdown={breakdown} isLoading={false} error={null} onRecalculate={noOp} />,
    );
    expect(screen.queryByRole('img', { name: /alert/i })).not.toBeInTheDocument();
  });
});

describe('CartSummary — no data state', () => {
  it('renders without crashing when priceBreakdown is undefined', () => {
    render(<CartSummary isLoading={false} onRecalculate={noOp} />);
    // Column headers (Film, Qté × Prix…) are hidden when there are no lines
    expect(screen.queryByText(/qté × prix/i)).not.toBeInTheDocument();
  });

  it('shows the TimeCircuit component regardless of breakdown presence', () => {
    render(<CartSummary isLoading={false} onRecalculate={noOp} />);
    // TimeCircuit renders "Time Circuit" header bar
    expect(screen.getByText(/time circuit/i)).toBeInTheDocument();
  });
});
