import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders dashboard CTA', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { name: /candidate dashboard/i });
  const ctaElement = screen.getByRole('link', { name: /add a new candidate/i });

  expect(headingElement).toBeInTheDocument();
  expect(ctaElement).toBeInTheDocument();
});
