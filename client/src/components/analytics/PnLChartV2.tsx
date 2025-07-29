import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
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

interface ChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  chartWidth: number;
  chartHeight: number;
}

// ツールチップコンポーネント（Portal使用）
const Tooltip: React.FC<{
  data: DailyData | null;
  position: { x: number; y: number };
  visible: boolean;
}> = ({ data, position, visible }) => {
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tooltipRef.current || !visible) return;

    const tooltip = tooltipRef.current;
    const rect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newX = position.x;
    let newY = position.y;

    // 右端チェック
    if (position.x + rect.width > viewportWidth - 20) {
      newX = position.x - rect.width - 20;
    }

    // 左端チェック
    if (newX < 20) {
      newX = 20;
    }

    // 上端チェック
    if (position.y - rect.height < 20) {
      newY = position.y + 20;
    } else {
      newY = position.y - rect.height - 10;
    }

    // 下端チェック
    if (newY + rect.height > viewportHeight - 20) {
      newY = viewportHeight - rect.height - 20;
    }

    setAdjustedPosition({ x: newX, y: newY });
  }, [position, visible]);

  if (!visible || !data) return null;

  return ReactDOM.createPortal(
    <div
      ref={tooltipRef}
      className="fixed pointer-events-none z-50 bg-gray-900 text-white text-xs rounded-lg shadow-2xl border border-gray-700 animate-fadeIn"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        minWidth: '200px',
        maxWidth: '250px',
      }}
    >
      <div className="p-3">
        <div className="font-semibold mb-2 text-center border-b border-gray-700 pb-2">
          {data.date.toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'short', 
            day: 'numeric',
            weekday: 'short'
          })}
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Daily P&L:</span>
            <span className={`font-medium ${data.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(data.dailyPnL)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Cumulative:</span>
            <span className={`font-medium ${data.cumulativePnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(data.cumulativePnL)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Trades:</span>
            <span className="font-medium">{data.tradeCount}</span>
          </div>
        </div>
      </div>
      {/* Arrow pointing down */}
      <div 
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gray-900"
      />
    </div>,
    document.body
  );
};

export const PnLChart: React.FC<PnLChartProps> = ({ trades }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showDebug] = useState(process.env.NODE_ENV === 'development');

  // Chart dimensions - memoized to prevent re-renders
  const dimensions = useMemo<ChartDimensions>(() => ({
    width: 800,
    height: 350,
    margin: { top: 20, right: 20, bottom: 30, left: 20 },
    get chartWidth() {
      return this.width - this.margin.left - this.margin.right;
    },
    get chartHeight() {
      return this.height - this.margin.top - this.margin.bottom;
    }
  }), []);

  // Process trade data
  const chartData = useMemo(() => {
    const validTrades = trades.filter(trade => 
      trade.pnl !== null && trade.pnl !== undefined && !isNaN(Number(trade.pnl))
    );

    if (validTrades.length === 0) {
      return { hasData: false, dataPoints: [], minValue: 0, maxValue: 0, range: 1 };
    }

    // Group by date
    const dailyMap = new Map<string, { pnl: number; count: number }>();
    
    validTrades.forEach(trade => {
      const dateString = new Date(trade.tradeDate).toISOString().split('T')[0];
      const existing = dailyMap.get(dateString) || { pnl: 0, count: 0 };
      dailyMap.set(dateString, {
        pnl: existing.pnl + Number(trade.pnl),
        count: existing.count + 1
      });
    });

    // Create sorted data points with baseline
    const sortedDates = Array.from(dailyMap.keys()).sort();
    const dataPoints: DailyData[] = [];
    let cumulative = 0;
    
    // Add baseline point
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
    
    // Add actual data
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

    // Calculate range ensuring 0 is always visible and properly positioned
    const values = dataPoints.map(d => d.cumulativePnL);
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    
    // Ensure 0 is always included in the visible range
    const minValue = Math.min(0, dataMin);
    const maxValue = Math.max(0, dataMax);
    
    // Calculate padding as percentage of data range, but ensure 0 remains visible
    const dataRange = maxValue - minValue;
    const paddingPercent = 0.1; // 10% padding
    const minPadding = 50; // Minimum padding in currency units
    
    let adjustedMin: number;
    let adjustedMax: number;
    
    if (dataRange === 0) {
      // If all values are 0, create a small symmetric range around 0
      adjustedMin = -100;
      adjustedMax = 100;
    } else {
      // Add padding while keeping 0 in view
      const padding = Math.max(dataRange * paddingPercent, minPadding);
      
      // If data is mostly positive, keep 0 near bottom
      if (minValue >= 0) {
        adjustedMin = -padding * 0.2; // Small negative padding to show 0 line clearly
        adjustedMax = maxValue + padding;
      }
      // If data is mostly negative, keep 0 near top
      else if (maxValue <= 0) {
        adjustedMin = minValue - padding;
        adjustedMax = padding * 0.2; // Small positive padding to show 0 line clearly
      }
      // If data crosses 0, add balanced padding
      else {
        adjustedMin = minValue - padding;
        adjustedMax = maxValue + padding;
      }
    }

    return {
      hasData: true,
      dataPoints,
      minValue: adjustedMin,
      maxValue: adjustedMax,
      range: adjustedMax - adjustedMin
    };
  }, [trades]);

  // Scale functions
  const xScale = useCallback((index: number) => {
    const { margin, chartWidth } = dimensions;
    return margin.left + (index / Math.max(chartData.dataPoints.length - 1, 1)) * chartWidth;
  }, [chartData.dataPoints.length, dimensions]);

  const yScale = useCallback((value: number) => {
    const { margin, chartHeight } = dimensions;
    const { minValue, range } = chartData;
    return margin.top + (1 - (value - minValue) / range) * chartHeight;
  }, [chartData, dimensions]);

  // Enhanced mouse handling with proper coordinate transformation
  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || chartData.dataPoints.length === 0) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;

    // Transform to SVG coordinates
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    const { margin, chartWidth } = dimensions;
    
    // Check if within chart area
    if (svgP.x < margin.left || svgP.x > margin.left + chartWidth || 
        svgP.y < margin.top || svgP.y > margin.top + dimensions.chartHeight) {
      setHoveredIndex(null);
      return;
    }
    
    // Calculate closest data point
    const relativeX = svgP.x - margin.left;
    const dataIndex = Math.round((relativeX / chartWidth) * (chartData.dataPoints.length - 1));
    const clampedIndex = Math.max(0, Math.min(chartData.dataPoints.length - 1, dataIndex));
    
    setHoveredIndex(clampedIndex);
    setMousePosition({ x: event.clientX, y: event.clientY });
  }, [chartData.dataPoints, dimensions]);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  // X-axis labels removed for minimal design

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

  const { dataPoints } = chartData;
  const { width, height, margin, chartHeight } = dimensions;

  // Generate paths
  const linePath = dataPoints
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(point.cumulativePnL)}`)
    .join(' ');

  const zeroY = yScale(0);
  const areaPath = `${linePath} L ${xScale(dataPoints.length - 1)} ${zeroY} L ${xScale(0)} ${zeroY} Z`;

  return (
    <div className="w-full relative">
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-auto max-h-96"
        style={{ backgroundColor: '#f9fafb', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid lines - minimal design with only zero line */}
        <g>
          {/* Zero line only */}
          {(() => {
            const zeroY = yScale(0);
            // Only show zero line if it's within the visible chart area
            if (zeroY >= margin.top && zeroY <= margin.top + chartHeight) {
              return (
                <line
                  x1={margin.left}
                  y1={zeroY}
                  x2={width - margin.right}
                  y2={zeroY}
                  stroke="#374151"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />
              );
            }
            return null;
          })()}
        </g>

        {/* Gradients and clip paths */}
        <defs>
          {/* Green gradient for positive area */}
          <linearGradient id="positiveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#15803d" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#15803d" stopOpacity="0.05" />
          </linearGradient>
          
          {/* Red gradient for negative area */}
          <linearGradient id="negativeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.3" />
          </linearGradient>
          
          <clipPath id="clip-positive-v2">
            <rect 
              x={margin.left} 
              y={margin.top} 
              width={dimensions.chartWidth} 
              height={Math.max(0, zeroY - margin.top)} 
            />
          </clipPath>
          <clipPath id="clip-negative-v2">
            <rect 
              x={margin.left} 
              y={zeroY} 
              width={dimensions.chartWidth} 
              height={Math.max(0, margin.top + chartHeight - zeroY)} 
            />
          </clipPath>
        </defs>

        {/* Positive area with green gradient */}
        <path
          d={areaPath}
          fill="url(#positiveGradient)"
          clipPath="url(#clip-positive-v2)"
        />
        
        {/* Negative area with red gradient */}
        <path
          d={areaPath}
          fill="url(#negativeGradient)"
          clipPath="url(#clip-negative-v2)"
        />

        {/* Dynamic colored main line based on final value */}
        {(() => {
          const finalValue = dataPoints[dataPoints.length - 1]?.cumulativePnL || 0;
          const lineColor = finalValue >= 0 ? '#15803d' : '#dc2626'; // Dark green or dark red
          
          return (
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
            />
          );
        })()}

        {/* Interactive areas for hover detection */}
        {dataPoints.map((point, i) => (
          <g key={i}>
            {/* Invisible rect for hover detection */}
            <rect
              x={xScale(i) - 20}
              y={margin.top}
              width={40}
              height={chartHeight}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
            />
            
            {/* Only show data point when hovered */}
            {hoveredIndex === i && (
              <>
                <circle
                  cx={xScale(i)}
                  cy={yScale(point.cumulativePnL)}
                  r="6"
                  fill="#3b82f6"
                  stroke="#fff"
                  strokeWidth="3"
                  style={{ 
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))'
                  }}
                />
                
                {/* Pulsing outer ring */}
                <circle
                  cx={xScale(i)}
                  cy={yScale(point.cumulativePnL)}
                  r="12"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeOpacity="0.4"
                  className="animate-ping"
                  style={{ pointerEvents: 'none' }}
                />
              </>
            )}
          </g>
        ))}

        {/* X-axis labels removed for cleaner design */}

        {/* Hover indicator line */}
        {hoveredIndex !== null && (
          <g className="pointer-events-none">
            {/* Main hover line */}
            <line
              x1={xScale(hoveredIndex)}
              y1={margin.top}
              x2={xScale(hoveredIndex)}
              y2={margin.top + chartHeight}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeOpacity="0.8"
              strokeDasharray="4 4"
              className="transition-opacity duration-200"
            />
            
            {/* Date label at bottom */}
            <g>
              {/* Background rectangle for date label */}
              <rect
                x={xScale(hoveredIndex) - 35}
                y={height - 25}
                width="70"
                height="20"
                fill="#3b82f6"
                fillOpacity="0.9"
                rx="4"
                ry="4"
              />
              {/* Date text */}
              <text
                x={xScale(hoveredIndex)}
                y={height - 13}
                textAnchor="middle"
                fontSize="11"
                fill="white"
                fontWeight="bold"
              >
                {dataPoints[hoveredIndex]?.date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric'
                })}
              </text>
            </g>
            
            {/* Value indicator on left side */}
            <g>
              {(() => {
                const value = dataPoints[hoveredIndex]?.cumulativePnL || 0;
                const formattedValue = Math.abs(value) >= 1000 
                  ? `${(value / 1000).toFixed(1)}K`
                  : value.toFixed(0);
                const textWidth = formattedValue.length * 6 + 10;
                
                return (
                  <>
                    {/* Background rectangle for value */}
                    <rect
                      x={5}
                      y={yScale(value) - 10}
                      width={textWidth}
                      height="20"
                      fill="#3b82f6"
                      fillOpacity="0.95"
                      rx="10"
                      ry="10"
                    />
                    {/* Value text */}
                    <text
                      x={5 + textWidth/2}
                      y={yScale(value) + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fill="white"
                      fontWeight="bold"
                    >
                      {value >= 0 ? '+' : ''}{formattedValue}
                    </text>
                  </>
                );
              })()}
            </g>
          </g>
        )}

        {/* Debug info */}
        {showDebug && hoveredIndex !== null && (
          <g>
            <text x={10} y={15} fontSize="10" fill="red">
              Debug: Index={hoveredIndex}, Date={dataPoints[hoveredIndex]?.dateString}
            </text>
          </g>
        )}
      </svg>

      {/* Tooltip */}
      <Tooltip
        data={hoveredIndex !== null ? dataPoints[hoveredIndex] : null}
        position={mousePosition}
        visible={hoveredIndex !== null}
      />

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-500 text-xs">Period</div>
          <div className="font-semibold">
            {dataPoints.length > 1 
              ? `${dataPoints[1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dataPoints[dataPoints.length - 1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : '-'
            }
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-500 text-xs">Trading Days</div>
          <div className="font-semibold">{Math.max(0, dataPoints.length - 1)}</div>
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