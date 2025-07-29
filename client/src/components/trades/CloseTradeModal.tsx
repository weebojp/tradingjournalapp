import React, { useState, useEffect } from 'react';
import { Trade, UpdateTradeData } from '../../services/api';
import { formatPrice, formatSize, formatCurrency } from '../../utils/formatters';

export interface CloseTradeModalProps {
  isOpen: boolean;
  trade: Trade;
  onClose: () => void;
  onSubmit: (data: UpdateTradeData) => void;
  loading: boolean;
  error?: string;
}

interface CloseTradeFormData {
  exitPrice: string;
  exitDate: string;
  notes: string;
}

interface CloseTradeFormErrors {
  exitPrice?: string;
  exitDate?: string;
}

export const CloseTradeModal: React.FC<CloseTradeModalProps> = ({
  isOpen,
  trade,
  onClose,
  onSubmit,
  loading,
  error
}) => {
  const [formData, setFormData] = useState<CloseTradeFormData>({
    exitPrice: '',
    exitDate: new Date().toISOString().slice(0, 16),
    notes: trade.notes || ''
  });
  const [errors, setErrors] = useState<CloseTradeFormErrors>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        exitPrice: '',
        exitDate: new Date().toISOString().slice(0, 16),
        notes: trade.notes || ''
      });
      setErrors({});
    }
  }, [isOpen, trade]);

  const calculatePnL = (exitPrice: number): number => {
    // ポジションサイズは既にレバレッジ適用後の数値なので、レバレッジを重複適用しない
    if (trade.side === 'LONG') {
      return (exitPrice - trade.entryPrice) * trade.positionSize;
    } else {
      return (trade.entryPrice - exitPrice) * trade.positionSize;
    }
  };

  const formatPnL = (pnl: number): string => {
    const prefix = pnl >= 0 ? '+' : '';
    return `${prefix}${formatCurrency(pnl)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof CloseTradeFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: CloseTradeFormErrors = {};

    if (!formData.exitPrice.trim()) {
      newErrors.exitPrice = 'Exit price is required';
    } else {
      const exitPrice = parseFloat(formData.exitPrice);
      if (isNaN(exitPrice) || exitPrice <= 0) {
        newErrors.exitPrice = 'Exit price must be positive';
      }
    }

    if (!formData.exitDate.trim()) {
      newErrors.exitDate = 'Exit date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const exitPrice = parseFloat(formData.exitPrice);
      const pnl = calculatePnL(exitPrice);
      
      const updateData: UpdateTradeData = {
        exitPrice,
        exitDate: formData.exitDate,
        pnl,
        notes: formData.notes.trim() || undefined
      };
      
      onSubmit(updateData);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  const exitPrice = parseFloat(formData.exitPrice);
  const estimatedPnL = !isNaN(exitPrice) ? calculatePnL(exitPrice) : null;

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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Close Trade
                </h3>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Symbol:</span> {trade.symbol}</div>
                    <div><span className="font-medium">Side:</span> <span className={trade.side === 'LONG' ? 'text-green-600' : 'text-red-600'}>{trade.side}</span></div>
                    <div><span className="font-medium">Entry:</span> ${formatPrice(trade.entryPrice)}</div>
                    <div><span className="font-medium">Size:</span> {formatSize(trade.positionSize)}</div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="exitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Exit Price *
                    </label>
                    <input
                      type="number"
                      id="exitPrice"
                      name="exitPrice"
                      value={formData.exitPrice}
                      onChange={handleChange}
                      disabled={loading}
                      step="0.00000001"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    {errors.exitPrice && (
                      <p className="mt-1 text-sm text-danger-500">{errors.exitPrice}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="exitDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Exit Date *
                    </label>
                    <input
                      type="datetime-local"
                      id="exitDate"
                      name="exitDate"
                      value={formData.exitDate}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    {errors.exitDate && (
                      <p className="mt-1 text-sm text-danger-500">{errors.exitDate}</p>
                    )}
                  </div>

                  {estimatedPnL !== null && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-sm">
                        <span className="font-medium">Estimated PnL: </span>
                        <span className={estimatedPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatPnL(estimatedPnL)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      disabled={loading}
                      rows={3}
                      placeholder="Optional closing notes..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-danger-500">{error}</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Closing...' : 'Close Trade'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};