import { Trade, TradeStats } from '../services/api';

export const calculateTradeStatsFromList = (trades: Trade[]): TradeStats => {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      totalPnL: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      expectancy: 0,
      payoffRatio: 0,
      winLossRatio: 0,
      recoveryFactor: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      currentStreak: 0,
      currentStreakType: 'none',
      largestWin: 0,
      largestLoss: 0,
      grossProfit: 0,
      grossLoss: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0
    };
  }

  // Filter closed trades (trades with P&L)
  const closedTrades = trades.filter(trade => trade.pnl !== null && trade.pnl !== undefined);
  
  if (closedTrades.length === 0) {
    return {
      totalTrades: trades.length,
      totalPnL: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      expectancy: 0,
      payoffRatio: 0,
      winLossRatio: 0,
      recoveryFactor: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      currentStreak: 0,
      currentStreakType: 'none',
      largestWin: 0,
      largestLoss: 0,
      grossProfit: 0,
      grossLoss: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0
    };
  }

  // Sort trades by date for streak calculation
  const sortedTrades = [...closedTrades].sort((a, b) => 
    new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
  );

  // Calculate basic metrics
  const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  
  const winningTrades = closedTrades.filter(trade => (trade.pnl || 0) > 0);
  const losingTrades = closedTrades.filter(trade => (trade.pnl || 0) < 0);
  const breakEvenTrades = closedTrades.filter(trade => (trade.pnl || 0) === 0);

  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) : 0;
  
  const grossProfit = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
  
  const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
  
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0);
  const payoffRatio = avgLoss > 0 ? avgWin / avgLoss : (avgWin > 0 ? Infinity : 0);
  const winLossRatio = losingTrades.length > 0 ? winningTrades.length / losingTrades.length : (winningTrades.length > 0 ? Infinity : 0);
  
  const expectancy = closedTrades.length > 0 ? totalPnL / closedTrades.length : 0;
  
  // Find largest win and loss
  const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl || 0)) : 0;
  const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl || 0)) : 0;
  
  const recoveryFactor = largestLoss < 0 ? totalPnL / Math.abs(largestLoss) : (totalPnL > 0 ? Infinity : 0);

  // Calculate consecutive streaks
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentStreak = 0;
  let currentStreakType: 'win' | 'loss' | 'breakeven' | 'none' = 'none';
  
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  
  sortedTrades.forEach((trade, index) => {
    const pnl = trade.pnl || 0;
    
    if (pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
    } else if (pnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
    } else {
      currentWinStreak = 0;
      currentLossStreak = 0;
    }
  });

  // Determine current streak (from the most recent trades)
  if (sortedTrades.length > 0) {
    const recentTrades = sortedTrades.slice(-10); // Check last 10 trades for current streak
    let streakCount = 0;
    let streakType: 'win' | 'loss' | 'breakeven' | 'none' = 'none';
    
    for (let i = recentTrades.length - 1; i >= 0; i--) {
      const pnl = recentTrades[i].pnl || 0;
      const tradeType = pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven';
      
      if (i === recentTrades.length - 1) {
        streakType = tradeType;
        streakCount = 1;
      } else if (tradeType === streakType) {
        streakCount++;
      } else {
        break;
      }
    }
    
    currentStreak = streakCount;
    currentStreakType = streakType;
  }

  return {
    totalTrades: trades.length,
    totalPnL,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    expectancy,
    payoffRatio,
    winLossRatio,
    recoveryFactor,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    currentStreak,
    currentStreakType,
    largestWin,
    largestLoss,
    grossProfit,
    grossLoss,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    breakEvenTrades: breakEvenTrades.length
  };
};