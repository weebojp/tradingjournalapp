import React, { useMemo, useState, useCallback } from 'react';
import { Trade } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

interface PnLChartProps {
  trades: Trade[];
}

interface DailyData {
  date: Date;
  dateString: string;
  dailyPnL: number;
  cumulativePnL: number;
  tradeCount: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  data: DailyData | null;
}

export const PnLChart: React.FC<PnLChartProps> = ({ trades }) => {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, data: null });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // マウスハンドラー（先に定義）
  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>, dataPoints: DailyData[], chartWidth: number, margin: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // チャート領域内かどうかを確認
    if (mouseX < margin.left || mouseX > margin.left + chartWidth) {
      setTooltip({ visible: false, x: 0, y: 0, data: null });
      setHoveredIndex(null);
      return;
    }
    
    // 最も近いデータポイントを見つける
    const relativeX = mouseX - margin.left;
    const scaledX = relativeX / chartWidth;
    const index = Math.round(scaledX * (dataPoints.length - 1));
    const clampedIndex = Math.max(0, Math.min(dataPoints.length - 1, index));
    
    setHoveredIndex(clampedIndex);
    setTooltip({
      visible: true,
      x: mouseX,
      y: mouseY,
      data: dataPoints[clampedIndex]
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip({ visible: false, x: 0, y: 0, data: null });
    setHoveredIndex(null);
  }, []);

  // データ処理 - 日別に集計
  const chartData = useMemo(() => {
    console.log('PnLChart - 受信した取引数:', trades.length);
    
    // 有効な取引のみフィルタリング
    const validTrades = trades.filter(trade => {
      const hasValidPnL = trade.pnl !== null && trade.pnl !== undefined;
      const pnlNumber = Number(trade.pnl);
      const isValidNumber = !isNaN(pnlNumber);
      return hasValidPnL && isValidNumber;
    });

    console.log('有効な取引数:', validTrades.length);

    if (validTrades.length === 0) {
      return { hasData: false, dataPoints: [] };
    }

    // 日付でグループ化
    const dailyMap = new Map<string, { pnl: number; count: number }>();
    
    validTrades.forEach(trade => {
      const date = new Date(trade.tradeDate);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD形式
      
      if (!dailyMap.has(dateString)) {
        dailyMap.set(dateString, { pnl: 0, count: 0 });
      }
      
      const dayData = dailyMap.get(dateString)!;
      dayData.pnl += Number(trade.pnl);
      dayData.count += 1;
    });

    // 日付順にソートして累積値を計算
    const sortedDates = Array.from(dailyMap.keys()).sort();
    
    // 0から始まるベースラインを追加
    const dataPoints: DailyData[] = [];
    let cumulative = 0;
    
    // 最初のデータポイントの前日に0のポイントを追加（ベースライン）
    if (sortedDates.length > 0) {
      const firstDate = new Date(sortedDates[0]);
      firstDate.setDate(firstDate.getDate() - 1);
      dataPoints.push({
        date: firstDate,
        dateString: firstDate.toISOString().split('T')[0],
        dailyPnL: 0,
        cumulativePnL: 0,
        tradeCount: 0
      });
    }
    
    // 実際のデータを追加
    sortedDates.forEach(dateString => {
      const dayData = dailyMap.get(dateString)!;
      cumulative += dayData.pnl;
      
      dataPoints.push({
        date: new Date(dateString),
        dateString,
        dailyPnL: dayData.pnl,
        cumulativePnL: cumulative,
        tradeCount: dayData.count
      });
    });

    // 最小値・最大値を計算（0を含む）
    const cumulativeValues = dataPoints.map(d => d.cumulativePnL);
    const minCumulative = Math.min(...cumulativeValues);
    const maxCumulative = Math.max(...cumulativeValues);
    
    // 0を基準にした範囲を計算
    const minValue = Math.min(0, minCumulative);
    const maxValue = Math.max(0, maxCumulative);
    
    // パディングを追加（データ範囲の10%、最低100）
    const dataRange = maxValue - minValue;
    const padding = Math.max(dataRange * 0.1, 100);
    
    const adjustedMin = minValue - padding;
    const adjustedMax = maxValue + padding;
    const range = adjustedMax - adjustedMin;

    console.log('チャートデータ:', {
      日数: dataPoints.length,
      最小値: adjustedMin,
      最大値: adjustedMax,
      範囲: range
    });

    return {
      hasData: true,
      dataPoints,
      minValue: adjustedMin,
      maxValue: adjustedMax,
      range
    };
  }, [trades]);

  // X軸ラベルの生成（日付を間引いて表示）
  const xAxisLabels = useMemo(() => {
    const dataPoints = chartData.dataPoints || [];
    if (dataPoints.length <= 7) {
      // 7日以下なら全て表示
      return dataPoints.map((point, index) => ({ point, index }));
    } else if (dataPoints.length <= 30) {
      // 30日以下なら週ごと
      return dataPoints
        .map((point, index) => ({ point, index }))
        .filter(({ index }) => index % 7 === 0 || index === dataPoints.length - 1);
    } else {
      // それ以上なら月ごと
      const labels: { point: DailyData; index: number }[] = [];
      let lastMonth = -1;
      dataPoints.forEach((point, index) => {
        const month = point.date.getMonth();
        if (month !== lastMonth || index === dataPoints.length - 1) {
          labels.push({ point, index });
          lastMonth = month;
        }
      });
      return labels;
    }
  }, [chartData.dataPoints]);

  // データがない場合
  if (!chartData.hasData) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">
          No valid P&L data available.
          <br />
          <span className="text-sm text-gray-500">
            ({trades.length} trades found, but P&L not calculated)
          </span>
        </p>
      </div>
    );
  }

  const { dataPoints, minValue = 0, maxValue = 0, range = 1 } = chartData;

  // SVGのサイズ
  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 60, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // 座標変換関数
  const xScale = (index: number) => margin.left + (index / Math.max(dataPoints.length - 1, 1)) * chartWidth;
  const yScale = (value: number) => margin.top + (1 - (value - minValue) / range) * chartHeight;

  // パスの生成
  const linePath = dataPoints
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(point.cumulativePnL)}`)
    .join(' ');

  // ゼロラインのY座標
  const zeroY = yScale(0);

  // エリアパス（ゼロラインまで）
  const areaPath = `${linePath} L ${xScale(dataPoints.length - 1)} ${zeroY} L ${xScale(0)} ${zeroY} Z`;

  return (
    <div className="w-full">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-auto max-h-96"
        style={{ backgroundColor: '#f9fafb' }}
        onMouseMove={(e) => handleMouseMove(e, dataPoints, chartWidth, margin)}
        onMouseLeave={handleMouseLeave}
      >
        {/* グリッドライン */}
        <g>
          {/* 横線 */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const y = margin.top + ratio * chartHeight;
            const value = maxValue - ratio * range;
            const isZeroLine = Math.abs(value) < range * 0.01;
            
            return (
              <g key={ratio}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke={isZeroLine ? '#000' : '#e5e7eb'}
                  strokeWidth={isZeroLine ? 2 : 1}
                  strokeDasharray={isZeroLine ? 'none' : '3 3'}
                />
                <text
                  x={margin.left - 10}
                  y={y + 5}
                  textAnchor="end"
                  fontSize="12"
                  fill={isZeroLine ? '#000' : '#6b7280'}
                  fontWeight={isZeroLine ? 'bold' : 'normal'}
                >
                  {formatCurrency(value)}
                </text>
              </g>
            );
          })}

          {/* 縦線（月初め） */}
          {dataPoints.map((point, i) => {
            if (point.date.getDate() === 1) {
              const x = xScale(i);
              return (
                <line
                  key={i}
                  x1={x}
                  y1={margin.top}
                  x2={x}
                  y2={height - margin.bottom}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
              );
            }
            return null;
          })}
        </g>

        {/* エリア（プラス部分） */}
        <defs>
          <clipPath id="clip-positive">
            <rect 
              x={margin.left} 
              y={margin.top} 
              width={chartWidth} 
              height={Math.max(0, zeroY - margin.top)} 
            />
          </clipPath>
          <clipPath id="clip-negative">
            <rect 
              x={margin.left} 
              y={zeroY} 
              width={chartWidth} 
              height={Math.max(0, margin.top + chartHeight - zeroY)} 
            />
          </clipPath>
        </defs>

        <path
          d={areaPath}
          fill="#22c55e"
          fillOpacity="0.2"
          clipPath="url(#clip-positive)"
        />
        
        <path
          d={areaPath}
          fill="#ef4444"
          fillOpacity="0.2"
          clipPath="url(#clip-negative)"
        />

        {/* メインライン */}
        <path
          d={linePath}
          fill="none"
          stroke="#374151"
          strokeWidth="2"
        />

        {/* データポイント */}
        {dataPoints.map((point, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(point.cumulativePnL)}
            r={hoveredIndex === i ? "5" : "3"}
            fill={point.dailyPnL >= 0 ? '#22c55e' : '#ef4444'}
            stroke="#fff"
            strokeWidth="2"
            className="transition-all duration-200"
          />
        ))}

        {/* X軸ラベル */}
        {xAxisLabels.map((item, i) => {
          return (
            <text
              key={i}
              x={xScale(item.index)}
              y={height - margin.bottom + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
              transform={`rotate(-45, ${xScale(item.index)}, ${height - margin.bottom + 20})`}
            >
              {item.point.date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                ...(dataPoints.length > 30 ? { year: '2-digit' } : {})
              })}
            </text>
          );
        })}
      </svg>

      {/* ツールチップ */}
      {tooltip.visible && tooltip.data && (
        <div
          className="absolute pointer-events-none z-10 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 border border-gray-700"
          style={{
            left: `${Math.min(Math.max(tooltip.x - 90, 10), 600)}px`,
            top: `${Math.max(tooltip.y - 120, 10)}px`,
            maxWidth: '200px'
          }}
        >
          <div className="font-semibold mb-2 text-center">
            {tooltip.data.date.toLocaleDateString('en-US', { 
              year: 'numeric',
              month: 'short', 
              day: 'numeric',
              weekday: 'short'
            })}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-3">
              <span className="text-gray-300">Daily P&L:</span>
              <span className={tooltip.data.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}>
                {formatCurrency(tooltip.data.dailyPnL)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-300">Cumulative:</span>
              <span className={tooltip.data.cumulativePnL >= 0 ? 'text-green-400' : 'text-red-400'}>
                {formatCurrency(tooltip.data.cumulativePnL)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-300">Trades:</span>
              <span>{tooltip.data.tradeCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* サマリー */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-500 text-xs">Period</div>
          <div className="font-semibold">
            {dataPoints.length > 0 
              ? `${dataPoints[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dataPoints[dataPoints.length - 1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : '-'
            }
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-500 text-xs">Trading Days</div>
          <div className="font-semibold">{dataPoints.length}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-500 text-xs">Best Daily P&L</div>
          <div className="font-semibold text-green-600">
            {dataPoints.length > 0 
              ? formatCurrency(Math.max(...dataPoints.map(d => d.dailyPnL)))
              : '-'
            }
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-500 text-xs">Total P&L</div>
          <div className={`font-semibold text-lg ${dataPoints.length > 0 && dataPoints[dataPoints.length - 1].cumulativePnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dataPoints.length > 0 
              ? formatCurrency(dataPoints[dataPoints.length - 1].cumulativePnL)
              : formatCurrency(0)
            }
          </div>
        </div>
      </div>
    </div>
  );
};