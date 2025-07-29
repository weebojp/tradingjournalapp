import React, { useState, useMemo } from 'react';
import { Trade } from '../../services/api';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface DetailedAnalyticsProps {
  trades: Trade[];
}

type PeriodFilter = '1M' | '3M' | '12M' | 'ALL';

export const DetailedAnalytics: React.FC<DetailedAnalyticsProps> = ({ trades }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('3M');

  // Filter trades by period
  const filteredTrades = useMemo(() => {
    if (selectedPeriod === 'ALL') return trades;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '12M':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return trades.filter(trade => new Date(trade.tradeDate) >= cutoffDate);
  }, [trades, selectedPeriod]);

  // Daily P&L calculation
  const dailyPnL = useMemo(() => {
    const dailyMap = new Map<string, { pnl: number; trades: number }>();
    
    filteredTrades.forEach(trade => {
      if (trade.pnl !== undefined && trade.pnl !== null) {
        const date = new Date(trade.tradeDate).toISOString().split('T')[0]; // YYYY-MM-DD format
        const existing = dailyMap.get(date) || { pnl: 0, trades: 0 };
        dailyMap.set(date, {
          pnl: existing.pnl + Number(trade.pnl),
          trades: existing.trades + 1
        });
      }
    });
    
    // Convert to array and sort by date
    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ 
        date, 
        pnl: data.pnl, 
        trades: data.trades 
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredTrades]);

  // Entry frequency by day of week
  const entryFrequency = useMemo(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCount = new Array(7).fill(0);
    
    filteredTrades.forEach(trade => {
      const dayOfWeek = new Date(trade.tradeDate).getDay();
      dayCount[dayOfWeek]++;
    });
    
    return dayNames.map((name, index) => ({
      day: name,
      count: dayCount[index]
    }));
  }, [filteredTrades]);

  // Trading hours analysis
  const tradingHours = useMemo(() => {
    const hourCount = new Array(24).fill(0);
    
    filteredTrades.forEach(trade => {
      const hour = new Date(trade.tradeDate).getHours();
      hourCount[hour]++;
    });
    
    const totalTrades = filteredTrades.length;
    
    return hourCount.map((count, hour) => ({
      hour,
      count,
      percentage: totalTrades > 0 ? (count / totalTrades) * 100 : 0
    }));
  }, [filteredTrades]);

  // Tag performance analysis
  const tagPerformance = useMemo(() => {
    const tagMap = new Map<string, { wins: number; total: number; totalPnL: number }>();
    
    filteredTrades.forEach(trade => {
      trade.tags?.forEach(tradeTag => {
        const tagName = tradeTag.tag.name;
        if (!tagMap.has(tagName)) {
          tagMap.set(tagName, { wins: 0, total: 0, totalPnL: 0 });
        }
        const stat = tagMap.get(tagName)!;
        stat.total += 1;
        stat.totalPnL += trade.pnl || 0;
        if ((trade.pnl || 0) > 0) {
          stat.wins += 1;
        }
      });
    });

    return Array.from(tagMap.entries())
      .map(([tag, stat]) => ({
        tag,
        winRate: (stat.wins / stat.total) * 100,
        totalTrades: stat.total,
        totalPnL: stat.totalPnL,
        avgPnL: stat.totalPnL / stat.total
      }))
      .filter(item => item.totalTrades >= 3) // Only show tags with at least 3 trades
      .sort((a, b) => b.winRate - a.winRate);
  }, [filteredTrades]);

  const topPerformingTags = tagPerformance.slice(0, 3);
  const worstPerformingTags = tagPerformance.slice(-3).reverse();

  // Enhanced bar chart component with dynamic sizing
  const SimpleBarChart: React.FC<{ data: { label: string; value: number; color?: string }[]; title: string }> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => Math.abs(d.value)));
    const hasData = maxValue > 0;
    
    // Dynamic bar height based on data range
    const getBarHeight = () => {
      if (maxValue >= 100) return 'h-8 sm:h-10'; // High values
      if (maxValue >= 20) return 'h-6 sm:h-8';   // Medium values
      return 'h-4 sm:h-6'; // Low values
    };
    
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">📈</span>{title}
        </h3>
        <div className="space-y-3">
          {data.map((item, index) => {
            const isMaxValue = Math.abs(item.value) === maxValue && maxValue > 0;
            const percentage = hasData ? (Math.abs(item.value) / maxValue) * 100 : 0;
            
            return (
              <div key={index} className="group">
                <div className="flex items-center hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200">
                  <div className="w-12 sm:w-16 text-xs text-gray-600 flex-shrink-0 truncate font-medium">
                    {item.label}
                  </div>
                  <div className="flex-1 mx-2 relative">
                    <div className={`relative bg-gray-200 rounded-lg ${getBarHeight()} overflow-hidden`}>
                      {/* Background pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="h-full w-full" style={{
                          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 11px)`
                        }}></div>
                      </div>
                      
                      {/* Animated bar */}
                      <div
                        className={`absolute top-0 left-0 h-full rounded-lg transition-all duration-700 ease-out ${
                          item.color || (item.value >= 0 ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 'bg-gradient-to-r from-red-500 to-red-400')
                        } ${isMaxValue ? 'shadow-lg animate-pulse' : 'shadow-sm'} hover:brightness-110`}
                        style={{
                          width: `${percentage}%`,
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        {/* Shine effect for high values */}
                        {percentage >= 80 && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 rounded-lg"></div>
                        )}
                      </div>
                      
                      {/* Value overlay */}
                      {percentage >= 30 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-bold drop-shadow-sm">
                            {typeof item.value === 'number' ? 
                              (item.value >= 1000 ? formatCurrency(item.value) : item.value.toString()) 
                              : item.value}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-20 shadow-lg">
                      {item.label}: {typeof item.value === 'number' ? 
                        (item.value >= 1000 ? formatCurrency(item.value) : item.value.toString()) 
                        : item.value}
                      {hasData && ` (${percentage.toFixed(1)}%)`}
                    </div>
                  </div>
                  
                  {/* Value display for smaller bars */}
                  {percentage < 30 && (
                    <div className="w-10 sm:w-16 text-xs text-gray-900 text-right truncate font-medium">
                      {typeof item.value === 'number' ? 
                        (item.value >= 1000 ? formatCurrency(item.value) : item.value.toString()) 
                        : item.value}
                    </div>
                  )}
                  
                  {/* Peak indicator */}
                  {isMaxValue && maxValue > 0 && (
                    <div className="ml-2 text-emerald-500 text-xs">
                      🏆
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary stats */}
        {hasData && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-xs text-center">
              <div>
                <div className="font-bold text-gray-900">{data.length}</div>
                <div className="text-gray-600">Items</div>
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {typeof maxValue === 'number' ? 
                    (maxValue >= 1000 ? formatCurrency(maxValue) : maxValue.toString()) 
                    : maxValue}
                </div>
                <div className="text-gray-600">Max</div>
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {typeof data.reduce((sum, item) => sum + item.value, 0) === 'number' ? 
                    (data.reduce((sum, item) => sum + item.value, 0) >= 1000 ? 
                      formatCurrency(data.reduce((sum, item) => sum + item.value, 0)) : 
                      data.reduce((sum, item) => sum + item.value, 0).toString()) 
                    : 'N/A'}
                </div>
                <div className="text-gray-600">Total</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Period Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Analysis Period</h3>
        <div className="flex space-x-2">
          {(['1M', '3M', '12M', 'ALL'] as PeriodFilter[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Showing data for {filteredTrades.length} trades in the selected period
          {filteredTrades.length > 0 && (
            <span className="ml-2 text-gray-500">
              (Latest: {new Date(filteredTrades[filteredTrades.length - 1]?.tradeDate).toLocaleDateString()})
            </span>
          )}
        </p>
      </div>

      {/* Daily P&L Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Daily P&L Progression</h3>
        {dailyPnL.length > 0 ? (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {dailyPnL.map((item, index) => {
              const cumulativePnL = dailyPnL.slice(0, index + 1).reduce((sum, d) => sum + d.pnl, 0);
              return (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm text-gray-900 font-medium truncate">
                      {new Date(item.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: window.innerWidth < 640 ? undefined : 'numeric'
                      })}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.trades} trade{item.trades !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-col items-end space-y-1 min-w-0 flex-shrink-0 ml-2">
                    <span className={`text-sm font-medium ${item.pnl >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                      {item.pnl >= 0 ? '+' : ''}{formatCurrency(item.pnl)}
                    </span>
                    <span className={`text-xs ${cumulativePnL >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                      Total: {formatCurrency(cumulativePnL)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No trading data available for the selected period</p>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Entry Frequency by Day */}
        <SimpleBarChart
          title="Trading Frequency by Day of Week"
          data={entryFrequency.map(item => ({
            label: item.day.substring(0, 3),
            value: item.count,
            color: 'bg-blue-500'
          }))}
        />

        {/* Trading Hours - Bar Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            📊 <span className="ml-2">Most Active Trading Hours</span>
          </h3>
          
          {/* Responsive container with proper overflow handling */}
          <div className="w-full overflow-x-auto">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 rounded-lg min-w-[600px] lg:min-w-0">
              {(() => {
                const maxPercentage = Math.max(...tradingHours.map(h => h.percentage));
                const hasData = maxPercentage > 0;
                
                // Dynamic height optimized for MacBook Air and other displays
                const getChartHeight = () => {
                  if (maxPercentage >= 15) return 'h-56 lg:h-64 xl:h-72'; // Very active
                  if (maxPercentage >= 8) return 'h-48 lg:h-52 xl:h-64';  // Active
                  if (maxPercentage >= 3) return 'h-40 lg:h-44 xl:h-52';  // Moderate
                  return 'h-32 lg:h-36 xl:h-40'; // Low activity
                };
                
                return (
                  <>
                    {/* Chart Container with Y-axis */}
                    <div className="flex w-full max-w-full">
                      {/* Y-axis labels - improved spacing */}
                      <div className={`flex flex-col justify-between ${getChartHeight()} mr-2 lg:mr-3 xl:mr-4 text-[10px] lg:text-xs xl:text-sm text-gray-400 font-mono min-w-[28px] lg:min-w-[32px] xl:min-w-[40px] flex-shrink-0`}>
                        {[...Array(6)].map((_, i) => {
                          const percentage = maxPercentage * (1 - i / 5);
                          return (
                            <div key={i} className="text-right leading-none">
                              {percentage >= 1 ? Math.round(percentage) : percentage.toFixed(1)}%
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Bar Chart Container - Fixed height with bottom alignment */}
                      <div className={`relative ${getChartHeight()} flex-1 min-w-0 mb-8`}>
                        {/* Background grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="border-t border-gray-300"></div>
                          ))}
                        </div>
                        
                        {/* Chart bars container - align from bottom */}
                        <div className="absolute inset-x-0 bottom-0 top-0 flex">
                          {tradingHours.map((item, index) => {
                            // Get the actual container height in viewport
                            const getContainerHeightPx = () => {
                              if (maxPercentage >= 15) return 224; // h-56
                              if (maxPercentage >= 8) return 192;  // h-48
                              if (maxPercentage >= 3) return 160;  // h-40
                              return 128; // h-32
                            };
                            const containerHeight = getContainerHeightPx();
                            
                            // Calculate exact bar height in pixels
                            const barHeightRatio = hasData && maxPercentage > 0 
                              ? item.percentage / maxPercentage 
                              : 0;
                            const barHeightPx = Math.max(barHeightRatio * containerHeight, item.percentage > 0 ? 2 : 0);
                            
                            // Debug: Log data for verification
                            if (index === 0) {
                              console.log('=== ULTRATHINK Bar Chart Debug ===');
                              console.log('Container Height:', containerHeight, 'px');
                              console.log('Max Percentage:', maxPercentage.toFixed(3), '%');
                              console.log('Has Data:', hasData);
                              console.log('Bar calculations:');
                              tradingHours.forEach((h, i) => {
                                const ratio = hasData && maxPercentage > 0 ? h.percentage / maxPercentage : 0;
                                const heightPx = Math.max(ratio * containerHeight, h.percentage > 0 ? 2 : 0);
                                console.log(`  ${h.hour}h: ${h.percentage.toFixed(3)}% → ratio: ${ratio.toFixed(3)} → ${heightPx.toFixed(1)}px`);
                              });
                            }
                            
                            // Enhanced color scheme
                            const getBarColorClass = (percentage: number): string => {
                              if (percentage >= 12) return 'bg-gradient-to-t from-emerald-400 to-emerald-300 shadow-md';
                              if (percentage >= 8) return 'bg-gradient-to-t from-green-400 to-green-300 shadow-sm';
                              if (percentage >= 5) return 'bg-gradient-to-t from-yellow-400 to-yellow-300';
                              if (percentage >= 2) return 'bg-gradient-to-t from-orange-400 to-orange-300';
                              if (percentage > 0) return 'bg-gradient-to-t from-gray-400 to-gray-300';
                              return 'bg-gray-200 opacity-20';
                            };
                            
                            const getPulseEffect = (percentage: number): string => {
                              if (percentage >= maxPercentage && percentage >= 8) return 'animate-pulse';
                              return '';
                            };
                            
                            return (
                              <div 
                                key={index} 
                                className="flex-1 relative flex flex-col justify-end group"
                              >
                                {/* Bar with exact height - aligned from bottom */}
                                <div 
                                  className={`mx-1 ${getBarColorClass(item.percentage)} ${getPulseEffect(item.percentage)} rounded-t-lg transition-all duration-300 hover:brightness-110 relative group-hover:shadow-lg`}
                                  style={{ 
                                    height: `${barHeightPx}px`,
                                    minHeight: item.percentage > 0 ? '2px' : '0px'
                                  }}
                                >
                                  {/* Shine effect for high values */}
                                  {item.percentage >= 8 && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 rounded-t-lg"></div>
                                  )}
                                  
                                  {/* Enhanced Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-30 shadow-lg border">
                                    <div className="font-semibold">{item.hour.toString().padStart(2, '0')}:00</div>
                                    <div className="text-gray-300">{item.percentage.toFixed(3)}% • {item.count} trades</div>
                                    <div className="text-gray-400 text-[10px]">Height: {barHeightPx.toFixed(1)}px ({(barHeightRatio * 100).toFixed(1)}%)</div>
                                    {item.percentage >= maxPercentage && maxPercentage >= 8 && (
                                      <div className="text-emerald-400 text-[10px]">🔥 Peak Hour</div>
                                    )}
                                    {/* Arrow */}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </div>
                                
                                {/* Hour Label - placed below the container */}
                                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-[9px] lg:text-[10px] xl:text-xs font-mono text-gray-400 text-center">
                                  {item.hour}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Legend with statistics - improved for PC */}
                    <div className="space-y-3 lg:space-y-4 mt-4 lg:mt-6">
                      <div className="flex flex-wrap justify-center gap-1 lg:gap-2 xl:gap-4 text-[10px] lg:text-xs xl:text-sm">
                        <div className="flex items-center bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-200">
                          <div className="w-3 h-3 xl:w-4 xl:h-4 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full mr-2"></div>
                          <span className="text-emerald-700 font-medium">Peak (≥12%)</span>
                        </div>
                        <div className="flex items-center bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-200">
                          <div className="w-3 h-3 xl:w-4 xl:h-4 bg-gradient-to-t from-green-600 to-green-400 rounded-full mr-2"></div>
                          <span className="text-green-700 font-medium">High (8-12%)</span>
                        </div>
                        <div className="flex items-center bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-200">
                          <div className="w-3 h-3 xl:w-4 xl:h-4 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-full mr-2"></div>
                          <span className="text-yellow-700 font-medium">Medium (5-8%)</span>
                        </div>
                        <div className="flex items-center bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-200">
                          <div className="w-3 h-3 xl:w-4 xl:h-4 bg-gradient-to-t from-orange-500 to-orange-300 rounded-full mr-2"></div>
                          <span className="text-orange-700 font-medium">Low (2-5%)</span>
                        </div>
                      </div>
                      
                      {/* Enhanced Summary with insights - better grid for PC */}
                      <div className="bg-white rounded-lg p-3 lg:p-4 xl:p-6 border border-gray-200 shadow-sm">
                        <div className="grid grid-cols-3 gap-3 lg:gap-6 xl:gap-8 text-xs lg:text-sm xl:text-base">
                          <div className="text-center">
                            <div className="font-bold text-lg lg:text-2xl xl:text-3xl text-gray-900 mb-1">
                              {tradingHours.filter(h => h.percentage >= 8).length}
                            </div>
                            <div className="text-gray-600 text-[10px] lg:text-sm xl:text-base">Peak Hours</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg lg:text-2xl xl:text-3xl text-gray-900 mb-1">
                              {maxPercentage.toFixed(1)}%
                            </div>
                            <div className="text-gray-600 text-[10px] lg:text-sm xl:text-base">Max Activity</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg lg:text-2xl xl:text-3xl text-gray-900 mb-1">
                              {tradingHours.filter(h => h.percentage > 0).length}
                            </div>
                            <div className="text-gray-600 text-[10px] lg:text-sm xl:text-base">Active Hours</div>
                          </div>
                        </div>
                        
                        {maxPercentage >= 8 && (
                          <div className="mt-3 lg:mt-4 text-center">
                            <span className="inline-flex items-center px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-emerald-700 bg-emerald-100 text-xs lg:text-sm xl:text-base font-medium">
                              🔥 Peak Hours: {tradingHours
                                .filter(h => h.percentage >= Math.max(8, maxPercentage * 0.8))
                                .map(h => `${h.hour.toString().padStart(2, '0')}h`)
                                .join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Tag Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Tags */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">🏆 Top Performing Strategies</h3>
          {topPerformingTags.length > 0 ? (
            <div className="space-y-3">
              {topPerformingTags.map((tag, index) => (
                <div key={index} className="border border-green-200 rounded-lg p-3 bg-green-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-green-800">{tag.tag}</span>
                    <span className="text-sm text-green-600">{formatPercentage(tag.winRate)}</span>
                  </div>
                  <div className="text-xs text-green-600 space-x-4">
                    <span>Trades: {tag.totalTrades}</span>
                    <span>Avg: {formatCurrency(tag.avgPnL)}</span>
                    <span>Total: {formatCurrency(tag.totalPnL)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No strategy data available</p>
          )}
        </div>

        {/* Worst Performing Tags */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">⚠️ Strategies to Review</h3>
          {worstPerformingTags.length > 0 ? (
            <div className="space-y-3">
              {worstPerformingTags.map((tag, index) => (
                <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-red-800">{tag.tag}</span>
                    <span className="text-sm text-red-600">{formatPercentage(tag.winRate)}</span>
                  </div>
                  <div className="text-xs text-red-600 space-x-4">
                    <span>Trades: {tag.totalTrades}</span>
                    <span>Avg: {formatCurrency(tag.avgPnL)}</span>
                    <span>Total: {formatCurrency(tag.totalPnL)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No strategy data available</p>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Period Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredTrades.length}</div>
            <div className="text-sm text-gray-500">Total Trades</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {filteredTrades.length > 0 ? Math.round(dailyPnL.length / (filteredTrades.length / 30)) : 0}
            </div>
            <div className="text-sm text-gray-500">Active Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {filteredTrades.length > 0 ? (filteredTrades.length / Math.max(dailyPnL.length, 1)).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-500">Trades/Day</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{tagPerformance.length}</div>
            <div className="text-sm text-gray-500">Strategies Used</div>
          </div>
        </div>
      </div>
    </div>
  );
};