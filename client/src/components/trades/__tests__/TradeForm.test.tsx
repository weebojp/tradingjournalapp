import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TradeForm } from '../TradeForm';

describe('TradeForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render trade form with all required fields', () => {
    render(<TradeForm onSubmit={mockOnSubmit} loading={false} />);

    expect(screen.getByLabelText(/trade date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/symbol/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/side/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/entry price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/position size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/leverage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create trade/i })).toBeInTheDocument();
  });

  test('should call onSubmit with form data when submitted', async () => {
    render(<TradeForm onSubmit={mockOnSubmit} loading={false} />);

    const tradeDateInput = screen.getByLabelText(/trade date/i);
    const symbolInput = screen.getByLabelText(/symbol/i);
    const sideSelect = screen.getByLabelText(/side/i);
    const entryPriceInput = screen.getByLabelText(/entry price/i);
    const positionSizeInput = screen.getByLabelText(/position size/i);
    const leverageInput = screen.getByLabelText(/leverage/i);
    const notesInput = screen.getByLabelText(/notes/i);
    const submitButton = screen.getByRole('button', { name: /create trade/i });

    fireEvent.change(tradeDateInput, { target: { value: '2025-07-26T10:00' } });
    fireEvent.change(symbolInput, { target: { value: 'BTC/USDT' } });
    fireEvent.change(sideSelect, { target: { value: 'LONG' } });
    fireEvent.change(entryPriceInput, { target: { value: '41500.50' } });
    fireEvent.change(positionSizeInput, { target: { value: '0.2' } });
    fireEvent.change(leverageInput, { target: { value: '5' } });
    fireEvent.change(notesInput, { target: { value: 'Bullish breakout pattern' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        tradeDate: '2025-07-26T10:00',
        symbol: 'BTC/USDT',
        side: 'LONG',
        entryPrice: 41500.50,
        positionSize: 0.2,
        leverage: 5,
        notes: 'Bullish breakout pattern'
      });
    });
  });

  test('should show validation errors for empty required fields', async () => {
    render(<TradeForm onSubmit={mockOnSubmit} loading={false} />);

    const submitButton = screen.getByRole('button', { name: /create trade/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Trade date is required')).toBeInTheDocument();
      expect(screen.getByText('Symbol is required')).toBeInTheDocument();
      expect(screen.getByText('Entry price is required')).toBeInTheDocument();
      expect(screen.getByText('Position size is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should show validation error for invalid entry price', async () => {
    render(<TradeForm onSubmit={mockOnSubmit} loading={false} />);

    const entryPriceInput = screen.getByLabelText(/entry price/i);
    const submitButton = screen.getByRole('button', { name: /create trade/i });

    fireEvent.change(entryPriceInput, { target: { value: '-100' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Entry price must be positive')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should show validation error for invalid position size', async () => {
    render(<TradeForm onSubmit={mockOnSubmit} loading={false} />);

    const positionSizeInput = screen.getByLabelText(/position size/i);
    const submitButton = screen.getByRole('button', { name: /create trade/i });

    fireEvent.change(positionSizeInput, { target: { value: '0' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Position size must be positive')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should show validation error for invalid leverage', async () => {
    render(<TradeForm onSubmit={mockOnSubmit} loading={false} />);

    const leverageInput = screen.getByLabelText(/leverage/i);
    const submitButton = screen.getByRole('button', { name: /create trade/i });

    fireEvent.change(leverageInput, { target: { value: '0.5' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Leverage must be at least 1')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should disable form when loading', () => {
    render(<TradeForm onSubmit={mockOnSubmit} loading={true} />);

    expect(screen.getByLabelText(/trade date/i)).toBeDisabled();
    expect(screen.getByLabelText(/symbol/i)).toBeDisabled();
    expect(screen.getByLabelText(/side/i)).toBeDisabled();
    expect(screen.getByLabelText(/entry price/i)).toBeDisabled();
    expect(screen.getByLabelText(/position size/i)).toBeDisabled();
    expect(screen.getByLabelText(/leverage/i)).toBeDisabled();
    expect(screen.getByLabelText(/notes/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /creating.../i })).toBeDisabled();
  });

  test('should show error message when provided', () => {
    const errorMessage = 'Invalid symbol format';
    render(<TradeForm onSubmit={mockOnSubmit} loading={false} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('text-danger-500');
  });

  test('should have default leverage value of 1', () => {
    render(<TradeForm onSubmit={mockOnSubmit} loading={false} />);

    const leverageInput = screen.getByLabelText(/leverage/i) as HTMLInputElement;
    expect(leverageInput.value).toBe('1');
  });

  test('should have default side value of LONG', () => {
    render(<TradeForm onSubmit={mockOnSubmit} loading={false} />);

    const sideSelect = screen.getByLabelText(/side/i) as HTMLSelectElement;
    expect(sideSelect.value).toBe('LONG');
  });
});