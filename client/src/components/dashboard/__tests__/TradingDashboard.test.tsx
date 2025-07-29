import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TradingDashboard } from '../TradingDashboard';
import { apiClient } from '../../../services/api';

// Mock the API client
jest.mock('../../../services/api');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock react-router-dom Link component
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

// Mock context providers
jest.mock('../../../contexts/HelpContext', () => ({
  useHelp: () => ({ toggleHelpMode: jest.fn() })
}));

jest.mock('../../../contexts/UndoContext', () => ({
  useUndoHelpers: () => ({ createTradeDeleteUndo: jest.fn() })
}));

jest.mock('../../common/ConfirmationDialog', () => ({
  useConfirmationDialog: () => ({ 
    showConfirmation: jest.fn(),
    ConfirmationDialog: () => null
  })
}));

jest.mock('../../common/ErrorDisplay', () => ({
  useErrorState: () => ({
    error: null,
    handleError: jest.fn(),
    clearError: jest.fn(),
    retry: jest.fn()
  })
}));

jest.mock('../../help/KeyboardShortcutsPanel', () => ({
  useKeyboardShortcutsPanel: () => ({
    isOpen: false,
    showShortcuts: jest.fn(),
    hideShortcuts: jest.fn()
  })
}));

jest.mock('../../../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: jest.fn(),
  createCommonShortcuts: () => []
}));

jest.mock('../../../hooks/useLoadingState', () => ({
  useLoadingState: () => ({
    loadingState: { steps: [], isLoading: false },
    startLoading: jest.fn(),
    updateStepProgress: jest.fn(),
    completeLoading: jest.fn(),
    resetLoading: jest.fn()
  })
}));

// Helper function to render component
const renderComponent = (component: React.ReactElement) => {
  return render(component);
};

const mockTrades = [
  {
    id: '1',
    userId: 'user1',
    tradeDate: '2025-07-26T10:00:00Z',
    symbol: 'BTC/USDT',
    side: 'LONG' as const,
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
    side: 'SHORT' as const,
    entryPrice: 2450.75,
    exitPrice: 2400.00,
    positionSize: 1.5,
    leverage: 3,
    notes: 'Resistance rejection',
    pnl: 76.125,
    exitDate: '2025-07-25T16:00:00Z',
    createdAt: '2025-07-25T13:30:00Z',
    updatedAt: '2025-07-25T16:00:00Z'
  }
];

const mockStats = {
  totalTrades: 2,
  totalPnL: 376.125,
  winRate: 100,
  avgWin: 188.06,
  avgLoss: 0,
  profitFactor: Infinity,
  expectancy: 188.06,
  payoffRatio: Infinity,
  winLossRatio: Infinity,
  maxConsecutiveWins: 2,
  maxConsecutiveLosses: 0,
  currentStreak: 2,
  currentStreakType: 'win' as const,
  largestWin: 300.00,
  largestLoss: 0,
  recoveryFactor: Infinity,
  grossProfit: 376.125,
  grossLoss: 0,
  winningTrades: 2,
  losingTrades: 0,
  breakEvenTrades: 0
};

describe('TradingDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render loading state initially', () => {
    mockApiClient.getTrades.mockImplementation(() => new Promise(() => {}));
    mockApiClient.getTradeStats.mockImplementation(() => new Promise(() => {}));

    renderComponent(<TradingDashboard />);

    expect(screen.getByText(/loading dashboard.../i)).toBeInTheDocument();
  });

  test('should render dashboard with stats and recent trades', async () => {
    mockApiClient.getTrades.mockResolvedValueOnce({
      trades: mockTrades,
      pagination: { total: 2, limit: 100, offset: 0 }
    });
    mockApiClient.getTradeStats.mockResolvedValueOnce(mockStats);

    renderComponent(<TradingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Trading Dashboard')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Total Trades
      expect(screen.getByText('$376.13')).toBeInTheDocument(); // Total PnL
      expect(screen.getByText('100.0%')).toBeInTheDocument(); // Win Rate
      expect(screen.getByText('$188.06')).toBeInTheDocument(); // Avg Win
    });
  });

  test('should show stats cards with correct values', async () => {
    mockApiClient.getTrades.mockResolvedValueOnce({
      trades: mockTrades,
      pagination: { total: 2, limit: 100, offset: 0 }
    });
    mockApiClient.getTradeStats.mockResolvedValueOnce(mockStats);

    renderComponent(<TradingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Trades')).toBeInTheDocument();
      expect(screen.getByText('Total PnL')).toBeInTheDocument();
      expect(screen.getByText('Win Rate')).toBeInTheDocument();
      expect(screen.getByText('Average Win')).toBeInTheDocument();
    });
  });

  test('should show recent trades section', async () => {
    mockApiClient.getTrades.mockResolvedValueOnce({
      trades: mockTrades,
      pagination: { total: 2, limit: 100, offset: 0 }
    });
    mockApiClient.getTradeStats.mockResolvedValueOnce(mockStats);

    renderComponent(<TradingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Trades')).toBeInTheDocument();
      expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
      expect(screen.getByText('ETH/USDT')).toBeInTheDocument();
    });
  });

  test('should handle empty trades state', async () => {
    mockApiClient.getTrades.mockResolvedValueOnce({
      trades: [],
      pagination: { total: 0, limit: 100, offset: 0 }
    });
    mockApiClient.getTradeStats.mockResolvedValueOnce({
      totalTrades: 0,
      totalPnL: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      expectancy: 0,
      payoffRatio: 0,
      winLossRatio: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      currentStreak: 0,
      currentStreakType: 'none' as const,
      largestWin: 0,
      largestLoss: 0,
      recoveryFactor: 0,
      grossProfit: 0,
      grossLoss: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0
    });

    renderComponent(<TradingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument(); // Total Trades
      expect(screen.getAllByText('$0.00')).toHaveLength(2); // Total PnL and Average Win
      expect(screen.getByText('No trades found')).toBeInTheDocument();
    });
  });

  test('should handle API error gracefully', async () => {
    mockApiClient.getTrades.mockRejectedValueOnce(new Error('API Error'));
    mockApiClient.getTradeStats.mockRejectedValueOnce(new Error('API Error'));

    renderComponent(<TradingDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument();
    });
  });

  test('should show positive trend for positive PnL', async () => {
    mockApiClient.getTrades.mockResolvedValueOnce({
      trades: mockTrades,
      pagination: { total: 2, limit: 100, offset: 0 }
    });
    mockApiClient.getTradeStats.mockResolvedValueOnce(mockStats);

    renderComponent(<TradingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('$376.13')).toBeInTheDocument();
    });
  });

  test('should show negative trend for negative PnL', async () => {
    const negativeStats = {
      ...mockStats,
      totalPnL: -150.00
    };

    mockApiClient.getTrades.mockResolvedValueOnce({
      trades: mockTrades,
      pagination: { total: 2, limit: 100, offset: 0 }
    });
    mockApiClient.getTradeStats.mockResolvedValueOnce(negativeStats);

    renderComponent(<TradingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('-$150.00')).toBeInTheDocument();
    });
  });

  test('should limit recent trades to 5 items', async () => {
    const manyTrades = Array.from({ length: 10 }, (_, i) => ({
      ...mockTrades[0],
      id: `trade-${i}`,
      symbol: `SYMBOL${i}/USDT`
    }));

    mockApiClient.getTrades.mockResolvedValueOnce({
      trades: manyTrades,
      pagination: { total: 10, limit: 100, offset: 0 }
    });
    mockApiClient.getTradeStats.mockResolvedValueOnce(mockStats);

    renderComponent(<TradingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Trades')).toBeInTheDocument();
    });

    // Check that only 5 trades are displayed (first 5 symbols)
    await waitFor(() => {
      expect(screen.getByText('SYMBOL0/USDT')).toBeInTheDocument();
      expect(screen.getByText('SYMBOL4/USDT')).toBeInTheDocument();
      expect(screen.queryByText('SYMBOL5/USDT')).not.toBeInTheDocument();
    });
  });

  test('should refresh data when refresh button is clicked', async () => {
    mockApiClient.getTrades.mockResolvedValue({
      trades: mockTrades,
      pagination: { total: 2, limit: 100, offset: 0 }
    });
    mockApiClient.getTradeStats.mockResolvedValue(mockStats);

    renderComponent(<TradingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Trading Dashboard')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText(/refresh/i);
    refreshButton.click();

    expect(mockApiClient.getTrades).toHaveBeenCalledTimes(2);
    expect(mockApiClient.getTradeStats).toHaveBeenCalledTimes(2);
  });
});