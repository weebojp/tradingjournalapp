function calculateWinRate(trades) {
  if (trades.length === 0) return 0;
  
  const wins = trades.filter(trade => trade.pnl > 0).length;
  return wins / trades.length;
}

function calculateProfitFactor(trades) {
  if (trades.length === 0) return 0;
  
  const grossProfit = trades
    .filter(trade => trade.pnl > 0)
    .reduce((sum, trade) => sum + trade.pnl, 0);
    
  const grossLoss = Math.abs(trades
    .filter(trade => trade.pnl < 0)
    .reduce((sum, trade) => sum + trade.pnl, 0));
    
  if (grossLoss === 0) return Infinity;
  if (grossProfit === 0) return 0;
  
  return grossProfit / grossLoss;
}

function calculateExpectancy(trades) {
  if (trades.length === 0) return 0;
  
  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  return totalPnL / trades.length;
}

function calculateSharpeRatio(returns, annualRiskFreeRate = 0.02) {
  if (returns.length === 0) return 0;
  
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const dailyRiskFree = annualRiskFreeRate / 252; // Trading days in a year
  
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return Infinity;
  
  // Annualized Sharpe ratio
  return (avgReturn - dailyRiskFree) / stdDev * Math.sqrt(252);
}

function calculateAverageWin(trades) {
  const winningTrades = trades.filter(trade => trade.pnl > 0);
  if (winningTrades.length === 0) return 0;
  
  const totalWins = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  return totalWins / winningTrades.length;
}

function calculateAverageLoss(trades) {
  const losingTrades = trades.filter(trade => trade.pnl < 0);
  if (losingTrades.length === 0) return 0;
  
  const totalLosses = losingTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  return Number((totalLosses / losingTrades.length).toFixed(2));
}

function calculateMaxDrawdown(equityCurve) {
  if (equityCurve.length === 0) {
    return {
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      drawdownStart: -1,
      drawdownEnd: -1
    };
  }
  
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  let drawdownStart = -1;
  let drawdownEnd = -1;
  let peak = equityCurve[0];
  let peakIndex = 0;
  
  for (let i = 1; i < equityCurve.length; i++) {
    if (equityCurve[i] > peak) {
      peak = equityCurve[i];
      peakIndex = i;
    } else {
      const drawdown = peak - equityCurve[i];
      const drawdownPercent = (drawdown / peak) * 100;
      
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercent = drawdownPercent;
        drawdownStart = peakIndex;
        drawdownEnd = i;
      }
    }
  }
  
  return {
    maxDrawdown,
    maxDrawdownPercent,
    drawdownStart,
    drawdownEnd
  };
}

function groupByTimeframe(trades, timeframe) {
  const grouped = {};
  
  trades.forEach(trade => {
    const date = new Date(trade.tradeDate);
    let key;
    
    switch (timeframe) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        throw new Error('Invalid timeframe');
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(trade);
  });
  
  return grouped;
}

function calculateDailyPnL(trades) {
  if (trades.length === 0) return [];
  
  const dailyGroups = groupByTimeframe(trades, 'day');
  const result = [];
  let cumulative = 0;
  
  // Sort dates to ensure chronological order
  const sortedDates = Object.keys(dailyGroups).sort();
  
  sortedDates.forEach(date => {
    const dayTrades = dailyGroups[date];
    const dayPnL = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    cumulative += dayPnL;
    
    result.push({
      date,
      pnl: dayPnL,
      cumulative
    });
  });
  
  return result;
}

function calculateWeekdayStats(trades) {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const stats = {};
  
  // Initialize all weekdays
  weekdays.forEach(day => {
    stats[day] = {
      totalPnL: 0,
      tradeCount: 0,
      avgPnL: 0,
      winRate: 0
    };
  });
  
  // Group trades by weekday
  const tradesByDay = {};
  weekdays.forEach(day => {
    tradesByDay[day] = [];
  });
  
  trades.forEach(trade => {
    const date = new Date(trade.tradeDate);
    const dayName = weekdays[date.getDay()];
    tradesByDay[dayName].push(trade);
  });
  
  // Calculate stats for each weekday
  weekdays.forEach(day => {
    const dayTrades = tradesByDay[day];
    if (dayTrades.length > 0) {
      stats[day].totalPnL = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
      stats[day].tradeCount = dayTrades.length;
      stats[day].avgPnL = stats[day].totalPnL / dayTrades.length;
      stats[day].winRate = calculateWinRate(dayTrades);
    }
  });
  
  return stats;
}

function calculateHourlyStats(trades) {
  const stats = {};
  
  // Initialize all 24 hours
  for (let hour = 0; hour < 24; hour++) {
    stats[hour] = {
      totalPnL: 0,
      tradeCount: 0,
      avgPnL: 0,
      winRate: 0
    };
  }
  
  // Group trades by hour
  const tradesByHour = {};
  for (let hour = 0; hour < 24; hour++) {
    tradesByHour[hour] = [];
  }
  
  trades.forEach(trade => {
    const date = new Date(trade.tradeDate);
    const hour = date.getHours();
    tradesByHour[hour].push(trade);
  });
  
  // Calculate stats for each hour
  for (let hour = 0; hour < 24; hour++) {
    const hourTrades = tradesByHour[hour];
    if (hourTrades.length > 0) {
      stats[hour].totalPnL = hourTrades.reduce((sum, trade) => sum + trade.pnl, 0);
      stats[hour].tradeCount = hourTrades.length;
      stats[hour].avgPnL = stats[hour].totalPnL / hourTrades.length;
      stats[hour].winRate = calculateWinRate(hourTrades);
    }
  }
  
  return stats;
}

module.exports = {
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
};