import React, { useState, useEffect } from 'react';
import { apiClient, Trade, TradeStats } from '../../services/api';
import { formatPrice, formatSize, formatCurrency } from '../../utils/formatters';
import { DetailedAnalytics } from './DetailedAnalytics';
// import { PnLChart } from './PnLChart';
import { PnLChart } from './PnLChartV2';
// import { TradingCharts } from './TradingCharts';

export const AnalyticsPage: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tradesResponse, statsResponse] = await Promise.all([
        apiClient.getTrades({ limit: 1000, offset: 0 }), // 全取引を取得
        apiClient.getTradeStats()
      ]);

      setTrades(tradesResponse.trades);
      setStats(statsResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
      setError(errorMessage);
      console.error('Analytics loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No statistics available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trading Analytics</h1>
        <p className="text-gray-600 mt-1">Detailed analysis of your trading performance</p>
      </div>

      {/* P&L Chart - First View */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Cumulative P&L Performance</h2>
        <PnLChart trades={trades} />
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Trades</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalTrades}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Win Rate</div>
          <div className={`text-2xl font-bold ${stats.winRate >= 0.5 ? 'text-green-600' : 'text-red-600'}`}>
            {(stats.winRate * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Average Trade</div>
          <div className="text-2xl font-bold text-gray-900">
            ${trades.length > 0 ? (stats.totalPnL / stats.totalTrades).toFixed(2) : '0.00'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Profit Factor</div>
          <div className={`text-2xl font-bold ${stats.avgWin > Math.abs(stats.avgLoss) ? 'text-green-600' : 'text-red-600'}`}>
            {stats.avgLoss !== 0 ? (stats.avgWin / Math.abs(stats.avgLoss)).toFixed(2) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <DetailedAnalytics trades={trades} />
    </div>
  );
};