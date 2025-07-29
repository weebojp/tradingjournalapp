import React, { useState } from 'react';
import { CreateTradeData } from '../../services/api';

export interface TradeFormProps {
  onSubmit: (data: CreateTradeData) => void;
  loading: boolean;
  error?: string;
}

interface TradeFormData {
  tradeDate: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: string;
  positionSize: string;
  leverage: string;
  notes: string;
}

interface TradeFormErrors {
  tradeDate?: string;
  symbol?: string;
  entryPrice?: string;
  positionSize?: string;
  leverage?: string;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState<TradeFormData>({
    tradeDate: '',
    symbol: '',
    side: 'LONG',
    entryPrice: '',
    positionSize: '',
    leverage: '1',
    notes: ''
  });
  const [errors, setErrors] = useState<TradeFormErrors>({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const tradeData: CreateTradeData = {
        tradeDate: formData.tradeDate,
        symbol: formData.symbol.trim(),
        side: formData.side,
        entryPrice: parseFloat(formData.entryPrice),
        positionSize: parseFloat(formData.positionSize),
        leverage: parseFloat(formData.leverage),
        notes: formData.notes.trim() || undefined
      };
      onSubmit(tradeData);
    }
  };

  return (
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

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : 'Create Trade'}
      </button>
    </form>
  );
};