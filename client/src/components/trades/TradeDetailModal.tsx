import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trade } from '../../services/api';
import { formatPrice, formatSize, formatCurrency } from '../../utils/formatters';

export interface TradeDetailModalProps {
  isOpen: boolean;
  trade: Trade | null;
  onClose: () => void;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  isOpen,
  trade,
  onClose
}) => {
  const navigate = useNavigate();
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !trade) {
    return null;
  }

  const formatPnL = (pnl: number): string => {
    const prefix = pnl >= 0 ? '+' : '';
    return `${prefix}${formatCurrency(pnl)}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (): string => {
    if (!trade.exitDate) return 'Open';
    
    const entryTime = new Date(trade.tradeDate).getTime();
    const exitTime = new Date(trade.exitDate).getTime();
    const durationMs = exitTime - entryTime;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 1) {
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h ${minutes}m`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      data-testid="modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Trade Details
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Trade Overview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Symbol</span>
                      <p className="text-lg font-semibold text-gray-900">{trade.symbol}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Side</span>
                      <p className={`text-lg font-semibold ${trade.side === 'LONG' ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.side}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Entry Price</span>
                      <p className="text-lg font-semibold text-gray-900">${formatPrice(trade.entryPrice)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Position Size</span>
                      <p className="text-lg font-semibold text-gray-900">{formatSize(trade.positionSize)}</p>
                    </div>
                  </div>
                </div>

                {/* Trade Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Basic Info */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Entry Date:</span>
                        <span className="text-sm text-gray-900">{formatDate(trade.tradeDate)}</span>
                      </div>
                      {trade.exitDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Exit Date:</span>
                          <span className="text-sm text-gray-900">{formatDate(trade.exitDate)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Duration:</span>
                        <span className="text-sm text-gray-900">{calculateDuration()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Leverage:</span>
                        <span className="text-sm text-gray-900">{trade.leverage ? `${trade.leverage}x` : '1x'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Performance</h4>
                    <div className="space-y-3">
                      {trade.exitPrice && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Exit Price:</span>
                          <span className="text-sm text-gray-900">${formatPrice(trade.exitPrice)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">P&L:</span>
                        <span className={`text-sm font-medium ${(trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.pnl ? formatPnL(trade.pnl) : 'Open'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trade.exitPrice ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {trade.exitPrice ? 'Closed' : 'Open'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {trade.tags && trade.tags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Strategy Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {trade.tags.map((tradeTag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                          onClick={() => {
                            onClose();
                            navigate(`/strategies/${encodeURIComponent(tradeTag.tag.name)}`);
                          }}
                        >
                          {tradeTag.tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {trade.notes && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Notes</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{trade.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};