import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders trading journal app', () => {
  render(<App />);
  const titleElement = screen.getByText(/trading journal/i);
  expect(titleElement).toBeInTheDocument();
});
