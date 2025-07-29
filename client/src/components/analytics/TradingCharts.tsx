import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Trade, TradeStats } from '../../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export interface TradingChartsProps {
  trades: Trade[];
  stats: TradeStats;
}

export const TradingCharts: React.FC<TradingChartsProps> = ({ trades, stats }) => {
  // P&L推移チャート用データ
  const getPnLChartData = () => {
    const sortedTrades = [...trades].sort((a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime());
    let cumulativePnL = 0;
    const pnlData = sortedTrades.map((trade, index) => {
      cumulativePnL += trade.pnl || 0;
      return {
        x: index + 1,
        y: cumulativePnL
      };
    });

    return {
      labels: pnlData.map((_, index) => `Trade ${index + 1}`),
      datasets: [
        {
          label: 'Cumulative P&L ($)',
          data: pnlData.map(p => p.y),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          fill: true,
        },
      ],
    };
  };

  // 戦略別統計データ
  const getStrategyStats = () => {
    const strategyMap = new Map<string, { wins: number; total: number; totalPnL: number }>();
    
    trades.forEach(trade => {
      trade.tags?.forEach(tradeTag => {
        const tagName = tradeTag.tag.name;
        if (!strategyMap.has(tagName)) {
          strategyMap.set(tagName, { wins: 0, total: 0, totalPnL: 0 });
        }
        const stat = strategyMap.get(tagName)!;
        stat.total += 1;
        stat.totalPnL += Number(trade.pnl || 0);
        if (Number(trade.pnl || 0) > 0) {
          stat.wins += 1;
        }
      });
    });

    return Array.from(strategyMap.entries()).map(([strategy, stat]) => ({
      strategy,
      winRate: Number(((stat.wins / stat.total) * 100) || 0),
      totalTrades: stat.total,
      avgPnL: Number((stat.totalPnL / stat.total) || 0),
      totalPnL: Number(stat.totalPnL || 0)
    }));
  };

  // 戦略別勝率チャート
  const getStrategyWinRateChart = () => {
    const strategyStats = getStrategyStats();
    
    return {
      labels: strategyStats.map(s => s.strategy),
      datasets: [
        {
          label: 'Win Rate (%)',
          data: strategyStats.map(s => s.winRate),
          backgroundColor: strategyStats.map(s => 
            s.winRate >= 50 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
          ),
          borderColor: strategyStats.map(s => 
            s.winRate >= 50 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  // 月別取引数チャート
  const getMonthlyTradesChart = () => {
    const monthlyData = new Map<string, number>();
    
    trades.forEach(trade => {
      const date = new Date(trade.tradeDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
    });

    const sortedMonths = Array.from(monthlyData.entries()).sort(([a], [b]) => a.localeCompare(b));

    return {
      labels: sortedMonths.map(([month]) => month),
      datasets: [
        {
          label: 'Number of Trades',
          data: sortedMonths.map(([, count]) => count),
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
        },
      ],
    };
  };

  // 保有期間分布チャート
  const getHoldingPeriodChart = () => {
    const periods = ['< 1h', '1-4h', '4-12h', '12-24h', '1-3d', '3-7d', '> 7d'];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    trades.forEach(trade => {
      if (trade.durationSec) {
        const hours = trade.durationSec / 3600;
        if (hours < 1) counts[0]++;
        else if (hours < 4) counts[1]++;
        else if (hours < 12) counts[2]++;
        else if (hours < 24) counts[3]++;
        else if (hours < 72) counts[4]++;
        else if (hours < 168) counts[5]++;
        else counts[6]++;
      }
    });

    return {
      labels: periods,
      datasets: [
        {
          data: counts,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384'
          ],
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* P&L推移チャート */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">P&L推移</h3>
        <div className="h-64">
          <Line data={getPnLChartData()} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 戦略別勝率 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">戦略別勝率</h3>
          <div className="h-64">
            <Bar data={getStrategyWinRateChart()} options={chartOptions} />
          </div>
        </div>

        {/* 月別取引数 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">月別取引数</h3>
          <div className="h-64">
            <Bar data={getMonthlyTradesChart()} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* 保有期間分布 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">保有期間分布</h3>
        <div className="h-64 flex justify-center">
          <Doughnut data={getHoldingPeriodChart()} options={pieOptions} />
        </div>
      </div>

      {/* 戦略別詳細統計 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">戦略別詳細統計</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  戦略
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  取引数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  勝率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  平均損益
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  総損益
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getStrategyStats().map((stat) => (
                <tr key={stat.strategy}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stat.strategy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stat.totalTrades}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${Number(stat.winRate || 0) >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(stat.winRate || 0).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${Number(stat.avgPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Number(stat.avgPnL || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${Number(stat.totalPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Number(stat.totalPnL || 0).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};