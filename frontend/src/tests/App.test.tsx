import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders add candidate heading', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { name: /add candidate/i });
  expect(headingElement).toBeInTheDocument();
});
