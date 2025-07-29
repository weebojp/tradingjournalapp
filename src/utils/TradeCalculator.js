class TradeCalculator {
  calculateProfit(trade) {
    if (!trade.buyPrice || !trade.sellPrice || !trade.quantity) {
      throw new Error('Invalid trade data');
    }
    
    if (trade.buyPrice < 0 || trade.sellPrice < 0) {
      throw new Error('Invalid price values');
    }
    
    const profit = (trade.sellPrice - trade.buyPrice) * trade.quantity;
    const profitPercentage = ((trade.sellPrice - trade.buyPrice) / trade.buyPrice) * 100;
    
    return {
      profit: Math.round(profit * 100) / 100,
      profitPercentage: Math.round(profitPercentage * 100) / 100
    };
  }
}

module.exports = TradeCalculator;