import { calculateTradeStatsFromList } from '../tradeStatsCalculator';
import { Trade } from '../../services/api';

// Mock trade data
const mockTrades: Trade[] = [
  {
    id: '1',
    userId: 'user1',
    tradeDate: '2024-01-01T10:00:00Z',
    symbol: 'BTCUSD',
    side: 'LONG',
    entryPrice: 40000,
    exitPrice: 42000,
    positionSize: 0.1,
    leverage: 2,
    notes: 'Win trade',
    pnl: 200,
    exitDate: '2024-01-01T11:00:00Z',
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T11:00:00Z'
  },
  {
    id: '2',
    userId: 'user1',
    tradeDate: '2024-01-02T10:00:00Z',
    symbol: 'ETHUSD',
    side: 'SHORT',
    entryPrice: 3000,
    exitPrice: 2900,
    positionSize: 1.0,
    leverage: 1,
    notes: 'Win trade',
    pnl: 100,
    exitDate: '2024-01-02T11:00:00Z',
    createdAt: '2024-01-02T09:00:00Z',
    updatedAt: '2024-01-02T11:00:00Z'
  },
  {
    id: '3',
    userId: 'user1',
    tradeDate: '2024-01-03T10:00:00Z',
    symbol: 'BTCUSD',
    side: 'LONG',
    entryPrice: 41000,
    exitPrice: 40500,
    positionSize: 0.2,
    leverage: 2,
    notes: 'Loss trade',
    pnl: -100,
    exitDate: '2024-01-03T11:00:00Z',
    createdAt: '2024-01-03T09:00:00Z',
    updatedAt: '2024-01-03T11:00:00Z'
  },
  {
    id: '4',
    userId: 'user1',
    tradeDate: '2024-01-04T10:00:00Z',
    symbol: 'ETHUSD',
    side: 'LONG',
    entryPrice: 2950,
    exitPrice: null,
    positionSize: 0.5,
    leverage: 1,
    notes: 'Open trade',
    pnl: null,
    exitDate: null,
    createdAt: '2024-01-04T09:00:00Z',
    updatedAt: '2024-01-04T09:00:00Z'
  }
];

describe('Trade Stats Calculator', () => {
  test('calculates correct stats for sample trades', () => {
    const stats = calculateTradeStatsFromList(mockTrades);

    expect(stats.totalTrades).toBe(4);
    expect(stats.totalPnL).toBe(200); // 200 + 100 - 100 = 200
    expect(stats.winRate).toBeCloseTo(66.67, 1); // 2 wins out of 3 closed trades
    expect(stats.avgWin).toBe(150); // (200 + 100) / 2
    expect(stats.avgLoss).toBe(100); // 100 / 1
    expect(stats.winningTrades).toBe(2);
    expect(stats.losingTrades).toBe(1);
    expect(stats.breakEvenTrades).toBe(0);
    expect(stats.largestWin).toBe(200);
    expect(stats.largestLoss).toBe(-100);
    expect(stats.grossProfit).toBe(300); // 200 + 100
    expect(stats.grossLoss).toBe(100); // abs(-100)
    expect(stats.profitFactor).toBe(3); // 300 / 100
    expect(stats.payoffRatio).toBe(1.5); // 150 / 100
  });

  test('handles empty trade list', () => {
    const stats = calculateTradeStatsFromList([]);

    expect(stats.totalTrades).toBe(0);
    expect(stats.totalPnL).toBe(0);
    expect(stats.winRate).toBe(0);
    expect(stats.avgWin).toBe(0);
    expect(stats.avgLoss).toBe(0);
    expect(stats.profitFactor).toBe(0);
    expect(stats.currentStreakType).toBe('none');
  });

  test('handles trades with no closed positions', () => {
    const openTrades: Trade[] = [
      {
        ...mockTrades[0],
        pnl: null,
        exitPrice: null,
        exitDate: null
      }
    ];

    const stats = calculateTradeStatsFromList(openTrades);

    expect(stats.totalTrades).toBe(1);
    expect(stats.totalPnL).toBe(0);
    expect(stats.winRate).toBe(0);
    expect(stats.winningTrades).toBe(0);
    expect(stats.losingTrades).toBe(0);
  });

  test('calculates consecutive wins correctly', () => {
    const winningTrades: Trade[] = [
      { ...mockTrades[0], tradeDate: '2024-01-01T10:00:00Z', pnl: 100 },
      { ...mockTrades[1], tradeDate: '2024-01-02T10:00:00Z', pnl: 200 },
      { ...mockTrades[2], tradeDate: '2024-01-03T10:00:00Z', pnl: 150 },
      { ...mockTrades[0], tradeDate: '2024-01-04T10:00:00Z', pnl: -50 }
    ];

    const stats = calculateTradeStatsFromList(winningTrades);

    expect(stats.maxConsecutiveWins).toBe(3);
    expect(stats.maxConsecutiveLosses).toBe(1);
    expect(stats.currentStreak).toBe(1);
    expect(stats.currentStreakType).toBe('loss');
  });

  test('handles all winning trades correctly', () => {
    const allWins: Trade[] = [
      { ...mockTrades[0], pnl: 100 },
      { ...mockTrades[1], pnl: 200 }
    ];

    const stats = calculateTradeStatsFromList(allWins);

    expect(stats.winRate).toBe(100);
    expect(stats.profitFactor).toBe(Infinity);
    expect(stats.payoffRatio).toBe(Infinity);
    expect(stats.losingTrades).toBe(0);
    expect(stats.avgLoss).toBe(0);
  });

  test('calculates expectancy correctly', () => {
    const stats = calculateTradeStatsFromList(mockTrades.slice(0, 3)); // First 3 trades (closed)

    const expectedExpectancy = 200 / 3; // Total P&L / number of closed trades
    expect(stats.expectancy).toBeCloseTo(expectedExpectancy, 2);
  });
});