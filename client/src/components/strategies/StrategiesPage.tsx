import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, Trade } from '../../services/api';

interface Tag {
  id: string;
  name: string;
  descriptionMD: string;
  trades: any[];
}

interface StrategyStats {
  totalTrades: number;
  winRate: number;
  avgPnL: number;
  totalPnL: number;
}

export const StrategiesPage: React.FC = () => {
  const [strategies, setStrategies] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadStrategies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all trades and aggregate by tags
      const tradesResponse = await apiClient.getTrades({ limit: 1000, offset: 0 });
      const trades = tradesResponse.trades;

      // Create tag map from trades
      const tagMap = new Map<string, {
        id: string;
        name: string;
        trades: Trade[];
        descriptionMD: string;
      }>();

      trades.forEach(trade => {
        trade.tags?.forEach(tradeTag => {
          const tagName = tradeTag.tag.name;
          if (!tagMap.has(tagName)) {
            tagMap.set(tagName, {
              id: tradeTag.tag.id.toString(),
              name: tagName,
              trades: [],
              descriptionMD: getStrategyDescription(tagName)
            });
          }
          tagMap.get(tagName)!.trades.push(trade);
        });
      });

      const strategiesData = Array.from(tagMap.values()).sort((a, b) => b.trades.length - a.trades.length);
      setStrategies(strategiesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load strategies';
      setError(errorMessage);
      console.error('Strategies loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStrategyStats = (strategy: Tag): StrategyStats => {
    const trades = strategy.trades || [];
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => (trade.pnl || 0) > 0);
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    
    return {
      totalTrades,
      winRate: totalTrades > 0 ? winningTrades.length / totalTrades : 0,
      avgPnL: totalTrades > 0 ? totalPnL / totalTrades : 0,
      totalPnL
    };
  };

  useEffect(() => {
    loadStrategies();
  }, []);

  const getStrategyDescription = (strategyName: string): string => {
    const descriptions: { [key: string]: string } = {
      'SMA Cross': `
# SMA Cross (単純移動平均線クロス)

## 概要
単純移動平均線（SMA）のクロスオーバーを利用したトレンドフォロー手法です。短期SMAが長期SMAを上抜けするゴールデンクロス、下抜けするデッドクロスでエントリーします。

## 使用する指標
- 短期SMA (例: 20期間)
- 長期SMA (例: 50期間)

## エントリールール
**買いエントリー (ゴールデンクロス)**
- 短期SMAが長期SMAを上抜け
- 出来高の増加確認
- トレンドの初期段階であること

**売りエントリー (デッドクロス)**
- 短期SMAが長期SMAを下抜け
- 出来高の増加確認
- 下降トレンドの初期段階であること

## 利確・損切り
- 利確: 逆方向のクロス発生時
- 損切り: エントリー価格から2-3%の逆行

## 注意点
- レンジ相場では多くのダマシが発生
- トレンドの遅れて反応するため、天底での取引は困難
- 強いトレンド相場で威力を発揮
      `,
      'EMA Cross': `
# EMA Cross (指数移動平均線クロス)

## 概要
指数移動平均線（EMA）は直近の価格により多くの重みを置くため、SMAよりも反応が早い特徴があります。

## 使用する指標
- 短期EMA (例: 12期間)
- 長期EMA (例: 26期間)

## エントリールール
- SMAクロスと同様だが、より早いシグナル
- ダマシも多いため、他の指標との組み合わせが重要

## 特徴
- SMAより早いシグナル
- より多くの取引機会
- ダマシのリスクも高い
      `,
      'RSI Divergence': `
# RSI Divergence (RSI逆行現象)

## 概要
価格とRSI（相対力指数）の動きが逆行する現象を利用したリバーサル手法です。

## 使用する指標
- RSI (14期間)
- 価格チャート

## ダイバージェンスの種類
**強気ダイバージェンス**
- 価格: より安い安値
- RSI: より高い安値
- → 上昇反転の可能性

**弱気ダイバージェンス**
- 価格: より高い高値
- RSI: より低い高値
- → 下降反転の可能性

## エントリールール
- ダイバージェンス確認後、RSIが50ラインを突破でエントリー
- サポート/レジスタンスとの組み合わせ
      `,
      'MACD Signal': `
# MACD Signal

## 概要
MACD（移動平均収束拡散法）のシグナルライン交差やヒストグラムを利用した手法です。

## 使用する指標
- MACD Line (12EMA - 26EMA)
- Signal Line (MACDの9期間EMA)
- ヒストグラム (MACD - Signal)

## エントリールール
- MACDがシグナルラインを上抜け（買い）
- MACDがシグナルラインを下抜け（売り）
- ゼロライン上での交差がより強いシグナル
      `
    };

    return descriptions[strategyName] || `# ${strategyName}\n\n詳細な解説は準備中です。`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading strategies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Strategies</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadStrategies}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trading Strategies</h1>
        <p className="text-gray-600 mt-1">あなたが使用している戦略とそのパフォーマンス</p>
      </div>

      {strategies.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">戦略が見つかりません</h3>
          <p className="text-gray-600">取引にタグを追加して戦略分析を開始しましょう。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => {
          const stats = calculateStrategyStats(strategy);
          
          return (
            <div
              key={strategy.id}
              onClick={() => navigate(`/strategies/${encodeURIComponent(strategy.name)}`)}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{strategy.name}</h3>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">取引数:</span>
                  <span className="text-sm font-medium">{stats.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">勝率:</span>
                  <span className={`text-sm font-medium ${Number(stats.winRate || 0) >= 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                    {(Number(stats.winRate || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">総損益:</span>
                  <span className={`text-sm font-medium ${Number(stats.totalPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Number(stats.totalPnL || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2">
                {strategy.descriptionMD}
              </p>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};