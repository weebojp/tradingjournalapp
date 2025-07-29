import React, { useState, useEffect } from 'react';
import { Trade, CreateTradeData } from '../../services/api';

export interface EditTradeModalProps {
  isOpen: boolean;
  trade: Trade | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  error?: string;
}

interface TradeFormData {
  tradeDate: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: string;
  exitPrice: string;
  exitDate: string;
  positionSize: string;
  leverage: string;
  notes: string;
}

interface TradeFormErrors {
  tradeDate?: string;
  symbol?: string;
  entryPrice?: string;
  exitPrice?: string;
  exitDate?: string;
  positionSize?: string;
  leverage?: string;
}

export const EditTradeModal: React.FC<EditTradeModalProps> = ({
  isOpen,
  trade,
  onClose,
  onSubmit,
  loading,
  error
}) => {
  const [formData, setFormData] = useState<TradeFormData>({
    tradeDate: '',
    symbol: '',
    side: 'LONG',
    entryPrice: '',
    exitPrice: '',
    exitDate: '',
    positionSize: '',
    leverage: '1',
    notes: ''
  });
  const [errors, setErrors] = useState<TradeFormErrors>({});

  // Populate form when trade data changes
  useEffect(() => {
    if (trade) {
      // Format datetime-local input value
      const formatDateForInput = (dateString: string) => {
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return '';
          
          // Format as YYYY-MM-DDTHH:mm for datetime-local input
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (error) {
          console.error('Error formatting date:', error);
          return '';
        }
      };

      setFormData({
        tradeDate: formatDateForInput(trade.tradeDate),
        symbol: trade.symbol || '',
        side: trade.side || 'LONG',
        entryPrice: trade.entryPrice?.toString() || '',
        exitPrice: trade.exitPrice?.toString() || '',
        exitDate: trade.exitDate ? formatDateForInput(trade.exitDate) : '',
        positionSize: trade.positionSize?.toString() || '',
        leverage: trade.leverage?.toString() || '1',
        notes: trade.notes || ''
      });
    }
  }, [trade]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof TradeFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: TradeFormErrors = {};

    if (!formData.tradeDate.trim()) {
      newErrors.tradeDate = 'Trade date is required';
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }

    if (!formData.entryPrice.trim()) {
      newErrors.entryPrice = 'Entry price is required';
    } else {
      const entryPrice = parseFloat(formData.entryPrice);
      if (isNaN(entryPrice) || entryPrice <= 0) {
        newErrors.entryPrice = 'Entry price must be positive';
      }
    }

    if (!formData.positionSize.trim()) {
      newErrors.positionSize = 'Position size is required';
    } else {
      const positionSize = parseFloat(formData.positionSize);
      if (isNaN(positionSize) || positionSize <= 0) {
        newErrors.positionSize = 'Position size must be positive';
      }
    }

    if (formData.leverage.trim()) {
      const leverage = parseFloat(formData.leverage);
      if (isNaN(leverage) || leverage < 1) {
        newErrors.leverage = 'Leverage must be at least 1';
      }
    }

    // Exit price validation (optional, but if provided must be valid)
    if (formData.exitPrice.trim()) {
      const exitPrice = parseFloat(formData.exitPrice);
      if (isNaN(exitPrice) || exitPrice <= 0) {
        newErrors.exitPrice = 'Exit price must be positive';
      }
    }

    // Exit date validation (optional, but if provided must be valid)
    if (formData.exitDate.trim() && !formData.exitPrice.trim()) {
      newErrors.exitDate = 'Exit date requires exit price';
    }
    if (formData.exitPrice.trim() && !formData.exitDate.trim()) {
      newErrors.exitDate = 'Exit price requires exit date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const tradeData: any = {
        tradeDate: formData.tradeDate,
        symbol: formData.symbol.trim(),
        side: formData.side,
        entryPrice: parseFloat(formData.entryPrice),
        positionSize: parseFloat(formData.positionSize),
        leverage: parseFloat(formData.leverage),
        notes: formData.notes.trim() || undefined
      };

      // Add exit fields if provided
      if (formData.exitPrice.trim() && formData.exitDate.trim()) {
        tradeData.exitPrice = parseFloat(formData.exitPrice);
        tradeData.exitDate = formData.exitDate;
      }

      onSubmit(tradeData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Edit Trade
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tradeDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Trade Date
                    </label>
                    <input
                      type="datetime-local"
                      id="tradeDate"
                      name="tradeDate"
                      value={formData.tradeDate}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    {errors.tradeDate && (
                      <p className="mt-1 text-sm text-danger-500">{errors.tradeDate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
                      Symbol
                    </label>
                    <input
                      type="text"
                      id="symbol"
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="e.g., BTC/USDT"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    {errors.symbol && (
                      <p className="mt-1 text-sm text-danger-500">{errors.symbol}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="side" className="block text-sm font-medium text-gray-700 mb-1">
                      Side
                    </label>
                    <select
                      id="side"
                      name="side"
                      value={formData.side}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="LONG">Long</option>
                      <option value="SHORT">Short</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="entryPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Entry Price
                    </label>
                    <input
                      type="number"
                      id="entryPrice"
                      name="entryPrice"
                      value={formData.entryPrice}
                      onChange={handleChange}
                      disabled={loading}
                      step="0.00000001"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    {errors.entryPrice && (
                      <p className="mt-1 text-sm text-danger-500">{errors.entryPrice}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="positionSize" className="block text-sm font-medium text-gray-700 mb-1">
                      Position Size
                    </label>
                    <input
                      type="number"
                      id="positionSize"
                      name="positionSize"
                      value={formData.positionSize}
                      onChange={handleChange}
                      disabled={loading}
                      step="0.00000001"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    {errors.positionSize && (
                      <p className="mt-1 text-sm text-danger-500">{errors.positionSize}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="leverage" className="block text-sm font-medium text-gray-700 mb-1">
                      Leverage
                    </label>
                    <input
                      type="number"
                      id="leverage"
                      name="leverage"
                      value={formData.leverage}
                      onChange={handleChange}
                      disabled={loading}
                      step="0.01"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    {errors.leverage && (
                      <p className="mt-1 text-sm text-danger-500">{errors.leverage}</p>
                    )}
                  </div>
                </div>

                {/* Exit Information Section */}
                <div className="col-span-full">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Exit Information (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="exitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Exit Price
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
                        Exit Date
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
                  </div>
                </div>

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
                    placeholder="Optional notes about this trade..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-danger-500">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Trade'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};