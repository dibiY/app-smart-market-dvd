import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimeCircuit } from './TimeCircuit';

/**
 * The LED display splits each character into its own <span> via LedChar,
 * so standard getByText matchers can't find whole numbers.
 * We collect only the visible (non-aria-hidden) character spans to verify values.
 */
function getVisibleLedText(container: HTMLElement): string {
  return Array.from(container.querySelectorAll<HTMLElement>('.relative.z-10'))
    .map((el) => el.textContent ?? '')
    .join('');
}

describe('TimeCircuit', () => {
  const baseProps = {
    subtotal: 45,
    discountAmount: 9,
    discountLabel: 'Saga BTTF Discount -20% (3 volets)',
    total: 36,
  };

  // ── Loading state ──────────────────────────────────────────────────────
  it('shows the loading spinner when isLoading is true', () => {
    render(<TimeCircuit {...baseProps} isLoading />);
    expect(screen.getByText(/calculating/i)).toBeInTheDocument();
  });

  it('does not render column labels while loading', () => {
    render(<TimeCircuit {...baseProps} isLoading />);
    expect(screen.queryByText(/sous-total brut/i)).not.toBeInTheDocument();
  });

  // ── Normal display — LED value rendering ──────────────────────────────
  it('renders the subtotal value in LED digits', () => {
    const { container } = render(<TimeCircuit {...baseProps} />);
    expect(getVisibleLedText(container)).toContain('45.00');
  });

  it('renders the total value in LED digits', () => {
    const { container } = render(<TimeCircuit {...baseProps} />);
    expect(getVisibleLedText(container)).toContain('36.00');
  });

  it('renders the discount value with a leading minus', () => {
    const { container } = render(<TimeCircuit {...baseProps} />);
    expect(getVisibleLedText(container)).toContain('-9.00');
  });

  it('renders the discount label text', () => {
    render(<TimeCircuit {...baseProps} />);
    expect(screen.getByText(/saga bttf discount/i)).toBeInTheDocument();
  });

  // ── Column structure labels ────────────────────────────────────────────
  it('shows the subtotal column label', () => {
    render(<TimeCircuit {...baseProps} />);
    expect(screen.getByText(/sous-total brut/i)).toBeInTheDocument();
  });

  it('shows the total column label', () => {
    render(<TimeCircuit {...baseProps} />);
    expect(screen.getByText(/total à payer/i)).toBeInTheDocument();
  });

  // ── No discount column when discountAmount is 0 ────────────────────────
  it('hides the discount column when discountAmount is 0', () => {
    render(<TimeCircuit subtotal={45} discountAmount={0} total={45} />);
    // The fallback discount label "Remise" should not appear
    expect(screen.queryByText(/remise/i)).not.toBeInTheDocument();
  });

  it('renders subtotal and total LED values when there is no discount', () => {
    const { container } = render(<TimeCircuit subtotal={30} discountAmount={0} total={30} />);
    expect(getVisibleLedText(container)).toContain('30.00');
  });

  // ── Fallback discount label ────────────────────────────────────────────
  it('falls back to "Remise" when no discountLabel is provided', () => {
    render(<TimeCircuit subtotal={30} discountAmount={6} total={24} />);
    expect(screen.getByText(/remise/i)).toBeInTheDocument();
  });

  // ── ledFmt precision ──────────────────────────────────────────────────
  it('formats values to exactly 2 decimal places in LED digits', () => {
    const { container } = render(<TimeCircuit subtotal={10.1} discountAmount={0} total={10.1} />);
    expect(getVisibleLedText(container)).toContain('10.10');
  });
});
