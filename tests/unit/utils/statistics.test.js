const {
  calculateWinRate,
  calculateProfitFactor,
  calculateExpectancy,
  calculateSharpeRatio,
  calculateAverageWin,
  calculateAverageLoss,
  calculateMaxDrawdown,
  groupByTimeframe,
  calculateDailyPnL,
  calculateWeekdayStats,
  calculateHourlyStats
} = require('../../../src/utils/statistics');

describe('Statistics Utils', () => {
  describe('calculateWinRate', () => {
    test('should calculate win rate for mixed results', () => {
      const trades = [
        { pnl: 100 },
        { pnl: -50 },
        { pnl: 200 },
        { pnl: -30 },
        { pnl: 150 }
      ];
      
      expect(calculateWinRate(trades)).toBe(0.6); // 3 wins out of 5
    });

    test('should return 0 for empty trades', () => {
      expect(calculateWinRate([])).toBe(0);
    });

    test('should return 1 for all winning trades', () => {
      const trades = [{ pnl: 100 }, { pnl: 200 }, { pnl: 50 }];
      expect(calculateWinRate(trades)).toBe(1);
    });

    test('should return 0 for all losing trades', () => {
      const trades = [{ pnl: -100 }, { pnl: -200 }, { pnl: -50 }];
      expect(calculateWinRate(trades)).toBe(0);
    });

    test('should treat zero PnL as break-even (not a win)', () => {
      const trades = [{ pnl: 100 }, { pnl: 0 }, { pnl: -50 }];
      expect(calculateWinRate(trades)).toBeCloseTo(0.333, 3);
    });
  });

  describe('calculateProfitFactor', () => {
    test('should calculate profit factor correctly', () => {
      const trades = [
        { pnl: 100 },
        { pnl: -50 },
        { pnl: 200 },
        { pnl: -30 }
      ];
      
      // Gross profit: 300, Gross loss: 80
      expect(calculateProfitFactor(trades)).toBe(3.75);
    });

    test('should return Infinity when no losses', () => {
      const trades = [{ pnl: 100 }, { pnl: 200 }];
      expect(calculateProfitFactor(trades)).toBe(Infinity);
    });

    test('should return 0 when no profits', () => {
      const trades = [{ pnl: -100 }, { pnl: -200 }];
      expect(calculateProfitFactor(trades)).toBe(0);
    });

    test('should return 0 for empty trades', () => {
      expect(calculateProfitFactor([])).toBe(0);
    });
  });

  describe('calculateExpectancy', () => {
    test('should calculate expectancy correctly', () => {
      const trades = [
        { pnl: 100 },
        { pnl: -50 },
        { pnl: 200 },
        { pnl: -30 },
        { pnl: 80 }
      ];
      
      expect(calculateExpectancy(trades)).toBe(60); // Total 300 / 5 trades
    });

    test('should return 0 for empty trades', () => {
      expect(calculateExpectancy([])).toBe(0);
    });

    test('should handle negative expectancy', () => {
      const trades = [{ pnl: -100 }, { pnl: -200 }, { pnl: 50 }];
      expect(calculateExpectancy(trades)).toBe(-250 / 3);
    });
  });

  describe('calculateSharpeRatio', () => {
    test('should calculate Sharpe ratio for daily returns', () => {
      const dailyReturns = [0.02, -0.01, 0.03, 0.01, -0.005, 0.025];
      const annualRiskFreeRate = 0.02;
      
      const sharpe = calculateSharpeRatio(dailyReturns, annualRiskFreeRate);
      
      // Manual calculation for verification
      const avgReturn = dailyReturns.reduce((a, b) => a + b) / dailyReturns.length;
      const dailyRiskFree = annualRiskFreeRate / 252;
      const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length;
      const stdDev = Math.sqrt(variance);
      const expectedSharpe = (avgReturn - dailyRiskFree) / stdDev * Math.sqrt(252);
      
      expect(sharpe).toBeCloseTo(expectedSharpe, 4);
    });

    test('should return 0 for empty returns', () => {
      expect(calculateSharpeRatio([])).toBe(0);
    });

    test('should handle zero standard deviation', () => {
      const returns = [0.01, 0.01, 0.01, 0.01];
      const sharpe = calculateSharpeRatio(returns, 0);
      expect(sharpe).toBe(Infinity);
    });
  });

  describe('calculateAverageWin', () => {
    test('should calculate average winning trade', () => {
      const trades = [
        { pnl: 100 },
        { pnl: -50 },
        { pnl: 200 },
        { pnl: -30 },
        { pnl: 150 }
      ];
      
      expect(calculateAverageWin(trades)).toBe(150); // (100 + 200 + 150) / 3
    });

    test('should return 0 when no winning trades', () => {
      const trades = [{ pnl: -100 }, { pnl: -50 }];
      expect(calculateAverageWin(trades)).toBe(0);
    });
  });

  describe('calculateAverageLoss', () => {
    test('should calculate average losing trade', () => {
      const trades = [
        { pnl: 100 },
        { pnl: -50 },
        { pnl: 200 },
        { pnl: -30 },
        { pnl: -120 }
      ];
      
      expect(calculateAverageLoss(trades)).toBe(-66.67); // (-50 + -30 + -120) / 3
    });

    test('should return 0 when no losing trades', () => {
      const trades = [{ pnl: 100 }, { pnl: 50 }];
      expect(calculateAverageLoss(trades)).toBe(0);
    });
  });

  describe('calculateMaxDrawdown', () => {
    test('should calculate maximum drawdown', () => {
      const equityCurve = [1000, 1100, 1050, 900, 950, 1200, 1150, 1000];
      
      const result = calculateMaxDrawdown(equityCurve);
      
      expect(result.maxDrawdown).toBe(200); // From 1100 to 900
      expect(result.maxDrawdownPercent).toBeCloseTo(18.18, 2); // 200/1100
      expect(result.drawdownStart).toBe(1); // Index where 1100 occurs
      expect(result.drawdownEnd).toBe(3); // Index where 900 occurs
    });

    test('should return 0 for constantly increasing equity', () => {
      const equityCurve = [1000, 1100, 1200, 1300, 1400];
      const result = calculateMaxDrawdown(equityCurve);
      
      expect(result.maxDrawdown).toBe(0);
      expect(result.maxDrawdownPercent).toBe(0);
    });

    test('should handle empty equity curve', () => {
      const result = calculateMaxDrawdown([]);
      
      expect(result.maxDrawdown).toBe(0);
      expect(result.maxDrawdownPercent).toBe(0);
    });
  });

  describe('groupByTimeframe', () => {
    test('should group trades by day', () => {
      const trades = [
        { tradeDate: new Date('2025-07-25T10:00:00'), pnl: 100 },
        { tradeDate: new Date('2025-07-25T15:00:00'), pnl: 50 },
        { tradeDate: new Date('2025-07-26T09:00:00'), pnl: -30 },
        { tradeDate: new Date('2025-07-26T14:00:00'), pnl: 80 }
      ];
      
      const grouped = groupByTimeframe(trades, 'day');
      
      expect(Object.keys(grouped).length).toBe(2);
      expect(grouped['2025-07-25'].length).toBe(2);
      expect(grouped['2025-07-26'].length).toBe(2);
    });

    test('should group trades by week', () => {
      const trades = [
        { tradeDate: new Date('2025-07-21'), pnl: 100 }, // Monday
        { tradeDate: new Date('2025-07-25'), pnl: 50 },  // Friday
        { tradeDate: new Date('2025-07-28'), pnl: -30 }, // Next Monday
      ];
      
      const grouped = groupByTimeframe(trades, 'week');
      
      expect(Object.keys(grouped).length).toBe(2);
    });

    test('should group trades by month', () => {
      const trades = [
        { tradeDate: new Date('2025-07-01'), pnl: 100 },
        { tradeDate: new Date('2025-07-31'), pnl: 50 },
        { tradeDate: new Date('2025-08-01'), pnl: -30 },
      ];
      
      const grouped = groupByTimeframe(trades, 'month');
      
      expect(Object.keys(grouped).length).toBe(2);
      expect(grouped['2025-07'].length).toBe(2);
      expect(grouped['2025-08'].length).toBe(1);
    });
  });

  describe('calculateDailyPnL', () => {
    test('should calculate daily PnL with cumulative values', () => {
      const trades = [
        { tradeDate: new Date('2025-07-25T10:00:00'), pnl: 100 },
        { tradeDate: new Date('2025-07-25T15:00:00'), pnl: 50 },
        { tradeDate: new Date('2025-07-26T09:00:00'), pnl: -30 },
        { tradeDate: new Date('2025-07-27T14:00:00'), pnl: 80 }
      ];
      
      const dailyPnL = calculateDailyPnL(trades);
      
      expect(dailyPnL).toEqual([
        { date: '2025-07-25', pnl: 150, cumulative: 150 },
        { date: '2025-07-26', pnl: -30, cumulative: 120 },
        { date: '2025-07-27', pnl: 80, cumulative: 200 }
      ]);
    });

    test('should return empty array for no trades', () => {
      expect(calculateDailyPnL([])).toEqual([]);
    });
  });

  describe('calculateWeekdayStats', () => {
    test('should calculate statistics by weekday', () => {
      const trades = [
        { tradeDate: new Date('2025-07-21'), pnl: 100 }, // Monday
        { tradeDate: new Date('2025-07-21'), pnl: 50 },  // Monday
        { tradeDate: new Date('2025-07-22'), pnl: -30 }, // Tuesday
        { tradeDate: new Date('2025-07-23'), pnl: 80 },  // Wednesday
        { tradeDate: new Date('2025-07-25'), pnl: -20 }, // Friday
      ];
      
      const stats = calculateWeekdayStats(trades);
      
      expect(stats['Monday']).toEqual({
        totalPnL: 150,
        tradeCount: 2,
        avgPnL: 75,
        winRate: 1
      });
      
      expect(stats['Tuesday']).toEqual({
        totalPnL: -30,
        tradeCount: 1,
        avgPnL: -30,
        winRate: 0
      });
      
      expect(stats['Thursday']).toEqual({
        totalPnL: 0,
        tradeCount: 0,
        avgPnL: 0,
        winRate: 0
      });
    });
  });

  describe('calculateHourlyStats', () => {
    test('should calculate statistics by hour', () => {
      const trades = [
        { tradeDate: new Date('2025-07-25T09:30:00'), pnl: 100 },
        { tradeDate: new Date('2025-07-25T09:45:00'), pnl: 50 },
        { tradeDate: new Date('2025-07-25T14:00:00'), pnl: -30 },
        { tradeDate: new Date('2025-07-25T14:30:00'), pnl: 80 },
        { tradeDate: new Date('2025-07-26T09:00:00'), pnl: 120 }
      ];
      
      const stats = calculateHourlyStats(trades);
      
      expect(stats[9]).toEqual({
        totalPnL: 270,
        tradeCount: 3,
        avgPnL: 90,
        winRate: 1
      });
      
      expect(stats[14]).toEqual({
        totalPnL: 50,
        tradeCount: 2,
        avgPnL: 25,
        winRate: 0.5
      });
      
      // Check all 24 hours are present
      expect(Object.keys(stats).length).toBe(24);
      expect(stats[0].tradeCount).toBe(0);
    });
  });
});