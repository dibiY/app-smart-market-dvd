import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the application header with brand name', () => {
    render(<App />);
    // getAllByText handles the brand name appearing in both header and footer
    expect(screen.getAllByText(/smart market dvd/i).length).toBeGreaterThan(0);
  });

  it('renders the cart panel section', () => {
    render(<App />);
    // The cart heading is rendered inside the sidebar
    expect(screen.getByRole('heading', { name: /panier/i })).toBeInTheDocument();
  });
});
