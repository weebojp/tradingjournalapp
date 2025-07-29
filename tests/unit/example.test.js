// TDDの例：トレード計算機能のテスト
describe('Trade Calculator', () => {
  // Red: 失敗するテストを最初に書く
  test('should calculate profit correctly', () => {
    // まだ実装されていない関数をテスト
    const TradeCalculator = require('../../src/utils/TradeCalculator');
    const calculator = new TradeCalculator();
    
    const result = calculator.calculateProfit({
      buyPrice: 100,
      sellPrice: 110,
      quantity: 10
    });
    
    expect(result).toEqual({
      profit: 100,
      profitPercentage: 10
    });
  });
  
  test('should calculate loss correctly', () => {
    const TradeCalculator = require('../../src/utils/TradeCalculator');
    const calculator = new TradeCalculator();
    
    const result = calculator.calculateProfit({
      buyPrice: 110,
      sellPrice: 100,
      quantity: 10
    });
    
    expect(result).toEqual({
      profit: -100,
      profitPercentage: -9.09
    });
  });
  
  test('should handle invalid input', () => {
    const TradeCalculator = require('../../src/utils/TradeCalculator');
    const calculator = new TradeCalculator();
    
    expect(() => {
      calculator.calculateProfit({
        buyPrice: -100,
        sellPrice: 110,
        quantity: 10
      });
    }).toThrow('Invalid price values');
  });
}); 