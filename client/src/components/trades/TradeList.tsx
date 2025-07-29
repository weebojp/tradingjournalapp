import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trade } from '../../services/api';
import { formatPrice, formatSize, formatCurrency } from '../../utils/formatters';

export interface TradeListProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (trade: Trade) => void;
  onClose?: (trade: Trade) => void;
  onView?: (trade: Trade) => void;
  loading: boolean;
}

export const TradeList: React.FC<TradeListProps> = ({ trades, onEdit, onDelete, onClose, onView, loading }) => {
  const navigate = useNavigate();

  const formatPnL = (pnl: number): string => {
    const prefix = pnl >= 0 ? '+' : '';
    return `${prefix}${formatCurrency(pnl)}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTradeStatus = (trade: Trade): string => {
    return trade.exitPrice ? 'Closed' : 'Open';
  };

  const getPnLColor = (pnl?: number): string => {
    if (!pnl) return 'text-gray-500';
    return pnl >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getSideColor = (side: string): string => {
    return side === 'LONG' ? 'text-green-600' : 'text-red-600';
  };

  const getSideBadgeColor = (side: string): string => {
    return side === 'LONG' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusBadgeColor = (trade: Trade): string => {
    return trade.exitPrice 
      ? 'bg-gray-100 text-gray-800' 
      : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading trades...</div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-2">No trades found</div>
        <div className="text-sm text-gray-400">Create your first trade to get started</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Symbol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Side
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entry Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Exit Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Leverage
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tags
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PnL
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {trades.map((trade) => (
            <tr 
              key={trade.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onView && onView(trade)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(trade.tradeDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{trade.symbol}</div>
                {trade.notes && (
                  <div className="text-sm text-gray-500 truncate max-w-xs" title={trade.notes}>
                    {trade.notes}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSideBadgeColor(trade.side)}`}>
                  {trade.side}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${formatPrice(trade.entryPrice)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {trade.exitPrice ? `$${formatPrice(trade.exitPrice)}` : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatSize(trade.positionSize)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {trade.leverage ? `${trade.leverage}x` : '1x'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-wrap gap-1">
                  {trade.tags && trade.tags.length > 0 ? (
                    trade.tags.slice(0, 2).map((tradeTag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                        onClick={() => navigate(`/strategies/${encodeURIComponent(tradeTag.tag.name)}`)}
                      >
                        {tradeTag.tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">No tags</span>
                  )}
                  {trade.tags && trade.tags.length > 2 && (
                    <span className="text-xs text-gray-500">+{trade.tags.length - 2}</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {trade.pnl ? (
                  <span className={getPnLColor(trade.pnl)}>
                    {formatPnL(trade.pnl)}
                  </span>
                ) : (
                  <span className="text-gray-500">Open</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(trade)}`}>
                  {getTradeStatus(trade)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {!trade.exitPrice && onClose && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose(trade);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Close
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(trade);
                  }}
                  className="text-primary-600 hover:text-primary-900 mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(trade);
                  }}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};