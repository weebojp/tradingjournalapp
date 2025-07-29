const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// テクニカル分析に基づく戦略タグ
const STRATEGY_TAGS = [
  { name: 'SMA Cross', description: '単純移動平均線のゴールデンクロス・デッドクロスを利用した手法' },
  { name: 'EMA Cross', description: '指数移動平均線のクロスオーバーを利用した手法' },
  { name: 'RSI Divergence', description: 'RSIの逆行現象を利用したリバーサル手法' },
  { name: 'MACD Signal', description: 'MACDのシグナルライン交差やヒストグラムを利用' },
  { name: 'Bollinger Bands', description: 'ボリンジャーバンドのバンドウォークや逆張りを利用' },
  { name: 'Support/Resistance', description: 'サポート・レジスタンスラインでの反発やブレイクを狙う' },
  { name: 'Fibonacci Retracement', description: 'フィボナッチリトレースメントレベルでの反発を狙う' },
  { name: 'Chart Pattern', description: 'ヘッドアンドショルダー、三角形等のチャートパターン' },
  { name: 'Volume Analysis', description: '出来高分析に基づく価格予測手法' },
  { name: 'Candlestick Pattern', description: 'ローソク足パターン（ハンマー、十字星等）を利用' },
  { name: 'Trendline Break', description: 'トレンドラインのブレイクアウトを狙う手法' },
  { name: 'Momentum', description: 'モメンタム系指標（RSI、Stochastic等）を利用' },
  { name: 'FOMO', description: '感情的な買い（テクニカル分析なし）' },
  { name: 'Panic Sell', description: '感情的な売り（テクニカル分析なし）' }
];

// 取引ペア
const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'];

// 初心者トレーダーの行動パターンを反映した取引データ生成
function generateBeginnerTrades(userId, startDate) {
  const trades = [];
  let currentDate = new Date(startDate);
  let accountBalance = 10000; // 初期資金 $10,000
  
  // 100件の取引を生成
  for (let i = 0; i < 100; i++) {
    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const side = Math.random() > 0.45 ? 'LONG' : 'SHORT'; // 少しロングバイアス
    
    // 初心者の特徴：感情的な取引が多い
    const isEmotionalTrade = Math.random() > 0.6;
    const isFOMO = isEmotionalTrade && Math.random() > 0.5;
    const isPanic = isEmotionalTrade && !isFOMO;
    
    // エントリー価格（実際の相場を模擬）
    let basePrice;
    switch (symbol) {
      case 'BTC/USDT': basePrice = 30000 + Math.random() * 40000; break;
      case 'ETH/USDT': basePrice = 1500 + Math.random() * 3000; break;
      case 'SOL/USDT': basePrice = 20 + Math.random() * 150; break;
      case 'BNB/USDT': basePrice = 200 + Math.random() * 400; break;
      case 'XRP/USDT': basePrice = 0.3 + Math.random() * 1.2; break;
      default: basePrice = 100;
    }
    
    const entryPrice = basePrice;
    
    // 初心者の特徴：リスク管理が甘い（ポジションサイズが大きすぎる）
    const riskPercentage = isEmotionalTrade ? 0.05 + Math.random() * 0.15 : 0.02 + Math.random() * 0.08;
    
    // レバレッジ（初心者は高レバレッジを使いがち）
    const leverage = Math.floor(1 + Math.random() * (isEmotionalTrade ? 20 : 10));
    
    // 証拠金の計算
    const marginUsed = accountBalance * riskPercentage;
    
    // ポジションサイズ = 証拠金 × レバレッジ ÷ エントリー価格（0.1単位に調整）
    const calculatedSize = (marginUsed * leverage) / entryPrice;
    const positionSize = Math.round(calculatedSize * 10) / 10; // 0.1単位に調整
    
    // 取引期間（初心者は短期取引が多い）
    const holdingHours = isEmotionalTrade ? 
      Math.random() * 4 : // 感情的な取引は数時間
      Math.random() * 48; // 通常でも2日以内
    
    // 価格変動をシミュレート
    let priceChange;
    if (isFOMO) {
      // FOMO: 高値で買って損失
      priceChange = side === 'LONG' ? -0.02 - Math.random() * 0.08 : 0.02 + Math.random() * 0.08;
    } else if (isPanic) {
      // パニック売り: 底値で売って損失
      priceChange = side === 'LONG' ? -0.03 - Math.random() * 0.1 : 0.03 + Math.random() * 0.1;
    } else {
      // 通常の取引: 勝率40%程度
      const isWin = Math.random() > 0.6;
      if (isWin) {
        // 初心者の特徴：利確が早い（1-3%）
        priceChange = (side === 'LONG' ? 1 : -1) * (0.01 + Math.random() * 0.02);
      } else {
        // 初心者の特徴：損切りが遅い（3-10%）
        priceChange = (side === 'LONG' ? -1 : 1) * (0.03 + Math.random() * 0.07);
      }
    }
    
    const exitPrice = entryPrice * (1 + priceChange);
    
    // PnL計算（ポジションサイズは既にレバレッジ適用後なので、重複適用しない）
    let pnl;
    if (side === 'LONG') {
      pnl = (exitPrice - entryPrice) * positionSize;
    } else {
      pnl = (entryPrice - exitPrice) * positionSize;
    }
    
    // 資金残高を更新
    accountBalance += pnl;
    
    // 戦略タグを決定（複数根拠の可能性あり）
    let strategies = [];
    if (isFOMO) {
      strategies = ['FOMO'];
    } else if (isPanic) {
      strategies = ['Panic Sell'];
    } else {
      // テクニカル分析に基づく戦略
      const technicalStrategies = [
        'SMA Cross', 'EMA Cross', 'RSI Divergence', 'MACD Signal', 
        'Bollinger Bands', 'Support/Resistance', 'Fibonacci Retracement',
        'Chart Pattern', 'Volume Analysis', 'Candlestick Pattern', 
        'Trendline Break', 'Momentum'
      ];
      
      // 30%の確率で複数根拠
      if (Math.random() > 0.7) {
        // 2つの根拠
        const strategy1 = technicalStrategies[Math.floor(Math.random() * technicalStrategies.length)];
        let strategy2 = technicalStrategies[Math.floor(Math.random() * technicalStrategies.length)];
        while (strategy2 === strategy1) {
          strategy2 = technicalStrategies[Math.floor(Math.random() * technicalStrategies.length)];
        }
        strategies = [strategy1, strategy2];
      } else {
        // 単一根拠
        strategies = [technicalStrategies[Math.floor(Math.random() * technicalStrategies.length)]];
      }
    }
    
    // メモ生成
    let notes = '';
    if (isFOMO) {
      notes = 'Saw the price pumping on Twitter, had to get in! 🚀';
    } else if (isPanic) {
      notes = 'Market crashed, sold everything in panic 😱';
    } else if (strategies.length > 1) {
      notes = `Multiple confirmations: ${strategies.join(' + ')}. Strong signal!`;
    } else {
      const strategy = strategies[0];
      switch (strategy) {
        case 'SMA Cross':
          notes = pnl > 0 ? 'Perfect SMA golden cross entry!' : 'False breakout, SMA cross failed';
          break;
        case 'RSI Divergence':
          notes = pnl > 0 ? 'RSI divergence played out perfectly' : 'Divergence signal failed to materialize';
          break;
        case 'Support/Resistance':
          notes = pnl > 0 ? 'Clean bounce from support level' : 'Support level broken, stop loss hit';
          break;
        case 'MACD Signal':
          notes = pnl > 0 ? 'MACD signal line cross confirmed trend' : 'MACD signal was premature';
          break;
        default:
          notes = pnl > 0 ? `${strategy} setup worked well` : `${strategy} setup failed`;
      }
    }
    
    // 取引日時
    const tradeDate = new Date(currentDate);
    currentDate.setHours(currentDate.getHours() + Math.random() * 24);
    
    const exitDate = new Date(tradeDate);
    exitDate.setHours(exitDate.getHours() + holdingHours);
    
    trades.push({
      userId,
      tradeDate,
      symbol,
      side,
      entryPrice,
      exitPrice,
      positionSize,
      leverage,
      pnl,
      exitDate,
      notes,
      strategies,
      durationSec: Math.floor(holdingHours * 3600)
    });
  }
  
  return trades;
}

async function seedMockData() {
  try {
    console.log('🌱 Starting mock data generation...');
    
    // Create test user with proper password hash
    const testPassword = 'password123'; // Simple test password
    const passwordHash = await bcrypt.hash(testPassword, 10);
    
    const testUser = await prisma.user.upsert({
      where: { email: 'beginner@trader.com' },
      update: { passwordHash }, // Update password hash if user exists
      create: {
        email: 'beginner@trader.com',
        passwordHash
      }
    });
    
    console.log('👤 Test user created:', testUser.email);
    
    // Create strategy tags
    console.log('🏷️  Creating strategy tags...');
    for (const tag of STRATEGY_TAGS) {
      await prisma.tag.upsert({
        where: { name: tag.name },
        update: { descriptionMD: tag.description },
        create: {
          name: tag.name,
          descriptionMD: tag.description
        }
      });
    }
    
    // Generate trades
    console.log('📊 Generating 100 mock trades...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // Start 90 days ago
    
    const mockTrades = generateBeginnerTrades(testUser.id, startDate);
    
    // Insert trades with tags
    for (const tradeData of mockTrades) {
      const { strategies, ...trade } = tradeData;
      
      // Create trade
      const createdTrade = await prisma.trade.create({
        data: trade
      });
      
      // Associate multiple tags with trade
      for (const strategyName of strategies) {
        const tag = await prisma.tag.findUnique({
          where: { name: strategyName }
        });
        
        if (tag) {
          await prisma.tradeTag.create({
            data: {
              tradeId: createdTrade.id,
              tagId: tag.id
            }
          });
        }
      }
    }
    
    // Calculate final statistics
    const stats = await prisma.trade.aggregate({
      where: { userId: testUser.id },
      _sum: { pnl: true },
      _count: true
    });
    
    const winningTrades = await prisma.trade.count({
      where: {
        userId: testUser.id,
        pnl: { gt: 0 }
      }
    });
    
    console.log('✅ Mock data generation complete!');
    console.log('👤 Test Account Credentials:');
    console.log(`   - Email: beginner@trader.com`);
    console.log(`   - Password: ${testPassword}`);
    console.log('📈 Final Statistics:');
    console.log(`   - Total Trades: ${stats._count}`);
    console.log(`   - Total PnL: $${stats._sum.pnl?.toFixed(2)}`);
    console.log(`   - Win Rate: ${((winningTrades / stats._count) * 100).toFixed(1)}%`);
    console.log(`   - Starting Balance: $10,000`);
    console.log(`   - Final Balance: $${(10000 + Number(stats._sum.pnl)).toFixed(2)}`);
    
  } catch (error) {
    console.error('❌ Error generating mock data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedMockData();