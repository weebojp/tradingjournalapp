import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CloseTradeModal } from '../CloseTradeModal';
import { Trade } from '../../../services/api';

const mockTrade: Trade = {
  id: '1',
  userId: 'user1',
  tradeDate: '2025-07-26T10:00:00Z',
  symbol: 'BTC/USDT',
  side: 'LONG',
  entryPrice: 41500.50,
  positionSize: 0.2,
  leverage: 5,
  notes: 'Bullish breakout',
  createdAt: '2025-07-26T09:00:00Z',
  updatedAt: '2025-07-26T10:00:00Z'
};

describe('CloseTradeModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should not render when isOpen is false', () => {
    render(
      <CloseTradeModal
        isOpen={false}
        trade={mockTrade}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    expect(screen.queryByText(/close trade/i)).not.toBeInTheDocument();
  });

  test('should render modal when isOpen is true', () => {
    render(
      <CloseTradeModal
        isOpen={true}
        trade={mockTrade}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    expect(screen.getAllByText(/close trade/i)).toHaveLength(2);
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
    expect(screen.getByText('LONG')).toBeInTheDocument();
    expect(screen.getByLabelText(/exit price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/exit date/i)).toBeInTheDocument();
  });

  test('should call onClose when cancel button is clicked', () => {
    render(
      <CloseTradeModal
        isOpen={true}
        trade={mockTrade}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should call onClose when backdrop is clicked', () => {
    render(
      <CloseTradeModal
        isOpen={true}
        trade={mockTrade}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should call onSubmit with form data when submitted', async () => {
    render(
      <CloseTradeModal
        isOpen={true}
        trade={mockTrade}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    const exitPriceInput = screen.getByLabelText(/exit price/i);
    const exitDateInput = screen.getByLabelText(/exit date/i);
    const submitButton = screen.getByRole('button', { name: /close trade/i });

    fireEvent.change(exitPriceInput, { target: { value: '43000.00' } });
    fireEvent.change(exitDateInput, { target: { value: '2025-07-26T15:30' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        exitPrice: 43000,
        exitDate: '2025-07-26T15:30',
        notes: 'Bullish breakout',
        pnl: 1499.5000000000002
      });
    });
  });

  test('should show validation error for missing exit price', async () => {
    render(
      <CloseTradeModal
        isOpen={true}
        trade={mockTrade}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: /close trade/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Exit price is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should show validation error for invalid exit price', async () => {
    render(
      <CloseTradeModal
        isOpen={true}
        trade={mockTrade}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    const exitPriceInput = screen.getByLabelText(/exit price/i);
    const submitButton = screen.getByRole('button', { name: /close trade/i });

    fireEvent.change(exitPriceInput, { target: { value: '-100' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Exit price must be positive')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should calculate PnL for LONG trade correctly', async () => {
    render(
      <CloseTradeModal
        isOpen={true}
        trade={mockTrade}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    const exitPriceInput = screen.getByLabelText(/exit price/i);
    
    fireEvent.change(exitPriceInput, { target: { value: '43000' } });

    await waitFor(() => {
      expect(screen.getByText(/estimated pnl/i)).toBeInTheDocument();
      expect(screen.getByText(/\+\$1,499\.50/)).toBeInTheDocument();
    });
  });

  test('should calculate PnL for SHORT trade correctly', async () => {
    const shortTrade = { ...mockTrade, side: 'SHORT' as const };
    
    render(
      <CloseTradeModal
        isOpen={true}
        trade={shortTrade}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    const exitPriceInput = screen.getByLabelText(/exit price/i);
    
    fireEvent.change(exitPriceInput, { target: { value: '40000' } });

    await waitFor(() => {
      expect(screen.getByText(/estimated pnl/i)).toBeInTheDocument();
      expect(screen.getByText(/\+\$1,500\.50/)).toBeInTheDocument();
    });
  });

  test('should disable form when loading', () => {
    render(
      <CloseTradeModal
        isOpen={true}
        trade={mockTrade}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        loading={true}
      />
    );

    expect(screen.getByLabelText(/exit price/i)).toBeDisabled();
    expect(screen.getByLabelText(/exit date/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /closing.../i })).toBeDisabled();
  });

  test('should show error message when provided', () => {
    const errorMessage = 'Failed to close trade';
    render(
      <CloseTradeModal
        isOpen={true}
        trade={mockTrade}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        loading={false}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('should have current date/time as default exit date', () => {
    const now = new Date();
    const expectedDateTime = now.toISOString().slice(0, 16);

    render(
      <CloseTradeModal
        isOpen={true}
        trade={mockTrade}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    const exitDateInput = screen.getByLabelText(/exit date/i) as HTMLInputElement;
    expect(exitDateInput.value).toBe(expectedDateTime);
  });
});