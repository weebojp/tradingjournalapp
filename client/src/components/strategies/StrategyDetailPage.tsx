import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient, Trade } from '../../services/api';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { StrategyEditModal } from './StrategyEditModal';

interface StrategyAnalysis {
  winRate: number;
  totalTrades: number;
  totalPnL: number;
  avgPnL: number;
  avgWin: number;
  avgLoss: number;
  winCount: number;
  lossCount: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  compatibleTags: { name: string; winRate: number; trades: number }[];
  monthlyPerformance: { month: string; pnl: number; trades: number }[];
}

export const StrategyDetailPage: React.FC = () => {
  const { strategyName } = useParams<{ strategyName: string }>();
  const navigate = useNavigate();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customDescription, setCustomDescription] = useState<any>(null);

  const decodedStrategyName = strategyName ? decodeURIComponent(strategyName) : '';

  const loadTrades = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getTrades({ limit: 1000, offset: 0 });
      const allTrades = response.trades;

      // Filter trades that have the specific strategy tag
      const strategyTrades = allTrades.filter(trade =>
        trade.tags?.some(tradeTag => tradeTag.tag.name === decodedStrategyName)
      );

      setTrades(strategyTrades);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load strategy data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (decodedStrategyName) {
      loadTrades();
      // Load custom description from localStorage
      const savedDescriptions = localStorage.getItem('strategyDescriptions');
      if (savedDescriptions) {
        const descriptions = JSON.parse(savedDescriptions);
        if (descriptions[decodedStrategyName]) {
          setCustomDescription(descriptions[decodedStrategyName]);
        }
      }
    }
  }, [decodedStrategyName]);

  const analysis: StrategyAnalysis = useMemo(() => {
    if (trades.length === 0) {
      return {
        winRate: 0,
        totalTrades: 0,
        totalPnL: 0,
        avgPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        winCount: 0,
        lossCount: 0,
        profitFactor: 0,
        bestTrade: 0,
        worstTrade: 0,
        compatibleTags: [],
        monthlyPerformance: []
      };
    }

    const validTrades = trades.filter(t => t.pnl !== null && t.pnl !== undefined);
    const winningTrades = validTrades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = validTrades.filter(t => (t.pnl || 0) < 0);
    
    const totalPnL = validTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length : 0;

    // Compatible tags analysis
    const tagCompatibility = new Map<string, { wins: number; total: number }>();
    validTrades.forEach(trade => {
      trade.tags?.forEach(tradeTag => {
        const tagName = tradeTag.tag.name;
        if (tagName !== decodedStrategyName) {
          if (!tagCompatibility.has(tagName)) {
            tagCompatibility.set(tagName, { wins: 0, total: 0 });
          }
          const tagStats = tagCompatibility.get(tagName)!;
          tagStats.total += 1;
          if ((trade.pnl || 0) > 0) {
            tagStats.wins += 1;
          }
        }
      });
    });

    const compatibleTags = Array.from(tagCompatibility.entries())
      .map(([name, stats]) => ({
        name,
        winRate: (stats.wins / stats.total) * 100,
        trades: stats.total
      }))
      .filter(tag => tag.trades >= 3) // Only show tags with at least 3 trades
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);

    // Monthly performance
    const monthlyMap = new Map<string, { pnl: number; trades: number }>();
    validTrades.forEach(trade => {
      const date = new Date(trade.tradeDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { pnl: 0, trades: 0 });
      }
      const monthData = monthlyMap.get(monthKey)!;
      monthData.pnl += trade.pnl || 0;
      monthData.trades += 1;
    });

    const monthlyPerformance = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      winRate: validTrades.length > 0 ? (winningTrades.length / validTrades.length) * 100 : 0,
      totalTrades: validTrades.length,
      totalPnL,
      avgPnL: validTrades.length > 0 ? totalPnL / validTrades.length : 0,
      avgWin,
      avgLoss,
      winCount: winningTrades.length,
      lossCount: losingTrades.length,
      profitFactor: avgLoss !== 0 ? avgWin / Math.abs(avgLoss) : 0,
      bestTrade: validTrades.length > 0 ? Math.max(...validTrades.map(t => t.pnl || 0)) : 0,
      worstTrade: validTrades.length > 0 ? Math.min(...validTrades.map(t => t.pnl || 0)) : 0,
      compatibleTags,
      monthlyPerformance
    };
  }, [trades, decodedStrategyName]);

  const getStrategyDescription = (name: string) => {
    const descriptions: { [key: string]: {
      overview: string;
      indicators: string;
      entryRules: string;
      advantages: string;
      disadvantages: string;
      bestConditions: string;
    } } = {
      'SMA Cross': {
        overview: '単純移動平均線（SMA）のクロスオーバーを利用したトレンドフォロー手法です。',
        indicators: '短期SMA（20期間）と長期SMA（50期間）を使用',
        entryRules: 'ゴールデンクロス（買い）とデッドクロス（売り）でエントリー',
        advantages: '明確なシグナル、トレンド相場で高い効果',
        disadvantages: 'レンジ相場でのダマシ、遅れてのエントリー',
        bestConditions: '強いトレンドが発生している相場'
      },
      'EMA Cross': {
        overview: '指数移動平均線（EMA）のクロスオーバーを利用した手法です。',
        indicators: '短期EMA（12期間）と長期EMA（26期間）を使用',
        entryRules: 'EMAクロスでエントリー、SMAより早いシグナル',
        advantages: 'SMAより反応が早い、より多くの取引機会',
        disadvantages: 'ダマシが多い、ノイズに敏感',
        bestConditions: 'ボラティリティがある相場'
      },
      'RSI Divergence': {
        overview: '価格とRSIの逆行現象を利用したリバーサル手法です。',
        indicators: 'RSI（14期間）と価格チャート',
        entryRules: 'ダイバージェンス確認後、RSI50ライン突破でエントリー',
        advantages: '反転ポイントを早期発見、高い勝率',
        disadvantages: 'エントリー機会が少ない、判断が難しい',
        bestConditions: 'オーバーバウト・オーバーソールド状態'
      },
      'MACD Signal': {
        overview: 'MACD（移動平均収束拡散法）を利用したモメンタム手法です。',
        indicators: 'MACD Line、Signal Line、ヒストグラム',
        entryRules: 'MACDとシグナルラインの交差でエントリー',
        advantages: 'トレンドとモメンタムを同時に判断',
        disadvantages: 'レンジ相場では効果が薄い',
        bestConditions: 'トレンドの初期段階'
      }
    };

    return customDescription || descriptions[name] || {
      overview: 'この戦略の詳細な解説は準備中です。',
      indicators: '使用する指標は取引履歴から分析中',
      entryRules: 'エントリールールを分析中',
      advantages: 'メリットを分析中',
      disadvantages: 'リスクを分析中',
      bestConditions: '最適な相場環境を分析中'
    };
  };

  const handleSaveDescription = (newDescription: any) => {
    // Save to localStorage
    const savedDescriptions = localStorage.getItem('strategyDescriptions') || '{}';
    const descriptions = JSON.parse(savedDescriptions);
    descriptions[decodedStrategyName] = newDescription;
    localStorage.setItem('strategyDescriptions', JSON.stringify(descriptions));
    
    setCustomDescription(newDescription);
    setIsEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading strategy analysis...</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Strategy</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadTrades}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const strategyInfo = getStrategyDescription(decodedStrategyName);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{decodedStrategyName}</h1>
          <p className="text-gray-600 mt-1">戦略分析と詳細パフォーマンス</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-primary-700"
          >
            戦略を編集
          </button>
          <button
            onClick={() => navigate('/strategies')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            ← 戦略一覧に戻る
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">総取引数</div>
          <div className="text-2xl font-bold text-gray-900">{analysis.totalTrades}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">勝率</div>
          <div className={`text-2xl font-bold ${analysis.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(analysis.winRate)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">総損益</div>
          <div className={`text-2xl font-bold ${analysis.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(analysis.totalPnL)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">プロフィットファクター</div>
          <div className={`text-2xl font-bold ${analysis.profitFactor >= 1 ? 'text-green-600' : 'text-red-600'}`}>
            {analysis.profitFactor.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Strategy Description */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">戦略概要</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">概要</h3>
              <p className="text-gray-900">{strategyInfo.overview}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">使用指標</h3>
              <p className="text-gray-900">{strategyInfo.indicators}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">エントリールール</h3>
              <p className="text-gray-900">{strategyInfo.entryRules}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">最適な相場環境</h3>
              <p className="text-gray-900">{strategyInfo.bestConditions}</p>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">詳細統計</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">勝ちトレード</span>
              <span className="font-medium">{analysis.winCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">負けトレード</span>
              <span className="font-medium">{analysis.lossCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">平均利益</span>
              <span className="font-medium text-green-600">{formatCurrency(analysis.avgWin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">平均損失</span>
              <span className="font-medium text-red-600">{formatCurrency(analysis.avgLoss)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">最大利益</span>
              <span className="font-medium text-green-600">{formatCurrency(analysis.bestTrade)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">最大損失</span>
              <span className="font-medium text-red-600">{formatCurrency(analysis.worstTrade)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compatible Tags */}
      {analysis.compatibleTags.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">相性の良いタグ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.compatibleTags.map(tag => (
              <div key={tag.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900">{tag.name}</h3>
                  <span className={`text-sm font-medium ${tag.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(tag.winRate)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {tag.trades} 回の取引
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Performance */}
      {analysis.monthlyPerformance.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">月別パフォーマンス</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">月</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">取引数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">損益</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analysis.monthlyPerformance.map(month => (
                  <tr key={month.month}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(month.month + '-01').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {month.trades}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${month.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(month.pnl)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <StrategyEditModal
        isOpen={isEditModalOpen}
        strategyName={decodedStrategyName}
        initialDescription={strategyInfo}
        onSave={handleSaveDescription}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};