import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TradeList } from '../TradeList';
import { Trade } from '../../../services/api';

const mockTrades: Trade[] = [
  {
    id: '1',
    userId: 'user1',
    tradeDate: '2025-07-26T10:00:00Z',
    symbol: 'BTC/USDT',
    side: 'LONG',
    entryPrice: 41500.50,
    exitPrice: 43000.00,
    positionSize: 0.2,
    leverage: 5,
    notes: 'Bullish breakout',
    pnl: 300.00,
    exitDate: '2025-07-26T15:30:00Z',
    createdAt: '2025-07-26T09:00:00Z',
    updatedAt: '2025-07-26T15:30:00Z'
  },
  {
    id: '2',
    userId: 'user1',
    tradeDate: '2025-07-25T14:00:00Z',
    symbol: 'ETH/USDT',
    side: 'SHORT',
    entryPrice: 2450.75,
    positionSize: 1.5,
    leverage: 3,
    notes: 'Resistance rejection',
    createdAt: '2025-07-25T13:30:00Z',
    updatedAt: '2025-07-25T14:00:00Z'
  }
];

describe('TradeList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render empty state when no trades', () => {
    render(<TradeList trades={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} loading={false} />);

    expect(screen.getByText(/no trades found/i)).toBeInTheDocument();
    expect(screen.getByText(/create your first trade/i)).toBeInTheDocument();
  });

  test('should render trades list', () => {
    render(<TradeList trades={mockTrades} onEdit={mockOnEdit} onDelete={mockOnDelete} loading={false} />);

    expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument();
    expect(screen.getByText('LONG')).toBeInTheDocument();
    expect(screen.getByText('SHORT')).toBeInTheDocument();
    expect(screen.getByText('$41,500.50')).toBeInTheDocument();
    expect(screen.getByText('$2,450.75')).toBeInTheDocument();
  });

  test('should show PnL for closed trades', () => {
    render(<TradeList trades={mockTrades} onEdit={mockOnEdit} onDelete={mockOnDelete} loading={false} />);

    expect(screen.getByText('+$300.00')).toBeInTheDocument();
    expect(screen.getAllByText('Open')).toHaveLength(2);
  });

  test('should show trade status correctly', () => {
    render(<TradeList trades={mockTrades} onEdit={mockOnEdit} onDelete={mockOnDelete} loading={false} />);

    const statusElements = screen.getAllByText(/open|closed/i);
    expect(statusElements).toHaveLength(3);
    expect(screen.getByText('Closed')).toBeInTheDocument();
    expect(screen.getAllByText('Open')).toHaveLength(2);
  });

  test('should call onEdit when edit button is clicked', () => {
    render(<TradeList trades={mockTrades} onEdit={mockOnEdit} onDelete={mockOnDelete} loading={false} />);

    const editButtons = screen.getAllByText(/edit/i);
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTrades[0]);
  });

  test('should call onDelete when delete button is clicked', () => {
    render(<TradeList trades={mockTrades} onEdit={mockOnEdit} onDelete={mockOnDelete} loading={false} />);

    const deleteButtons = screen.getAllByText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTrades[0]);
  });

  test('should show loading state', () => {
    render(<TradeList trades={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} loading={true} />);

    expect(screen.getByText(/loading trades.../i)).toBeInTheDocument();
  });

  test('should format dates correctly', () => {
    render(<TradeList trades={mockTrades} onEdit={mockOnEdit} onDelete={mockOnDelete} loading={false} />);

    expect(screen.getByText('Jul 26, 2025')).toBeInTheDocument();
    expect(screen.getByText('Jul 25, 2025')).toBeInTheDocument();
  });

  test('should show leverage information', () => {
    render(<TradeList trades={mockTrades} onEdit={mockOnEdit} onDelete={mockOnDelete} loading={false} />);

    expect(screen.getByText('5x')).toBeInTheDocument();
    expect(screen.getByText('3x')).toBeInTheDocument();
  });

  test('should show position size', () => {
    render(<TradeList trades={mockTrades} onEdit={mockOnEdit} onDelete={mockOnDelete} loading={false} />);

    expect(screen.getByText('0.2')).toBeInTheDocument();
    expect(screen.getByText('1.5')).toBeInTheDocument();
  });

  test('should handle trades without notes', () => {
    const tradesWithoutNotes = [
      {
        ...mockTrades[0],
        notes: undefined
      }
    ];

    render(<TradeList trades={tradesWithoutNotes} onEdit={mockOnEdit} onDelete={mockOnDelete} loading={false} />);

    expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
  });
});