import React from 'react';
import { useUndo } from '../../contexts/UndoContext';
import { STRINGS } from '../../constants/strings';

export const UndoNotification: React.FC = () => {
  const { currentNotification, executeUndo, clearUndo, isUndoInProgress } = useUndo();

  if (!currentNotification?.isVisible) {
    return null;
  }

  const { action, timeLeft } = currentNotification;
  const secondsLeft = Math.ceil(timeLeft / 1000);
  const progressPercentage = (timeLeft / (action.ttl || 10000)) * 100;

  const handleUndo = () => {
    executeUndo(action.id);
  };

  const handleDismiss = () => {
    clearUndo(action.id);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-gray-900 text-white rounded-lg shadow-xl px-4 py-3 max-w-md mx-auto">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 h-1 bg-primary-500 rounded-t-lg transition-all duration-100 ease-linear"
             style={{ width: `${progressPercentage}%` }} />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Success icon */}
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {action.description}
              </p>
              <p className="text-xs text-gray-300">
                Undo in {secondsLeft}s
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleUndo}
              disabled={isUndoInProgress}
              className="px-3 py-1 text-xs font-medium text-primary-400 hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUndoInProgress ? 'Undoing...' : 'UNDO'}
            </button>
            
            <button
              onClick={handleDismiss}
              disabled={isUndoInProgress}
              className="p-1 text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper hook for creating common undo actions
export const useUndoHelpers = () => {
  const { addUndoAction } = useUndo();

  const createTradeDeleteUndo = (
    trade: any, 
    restoreFn: (trade: any) => Promise<void>
  ) => {
    addUndoAction({
      type: 'delete_trade',
      description: `Deleted ${trade.symbol} trade`,
      undoFn: () => restoreFn(trade),
      data: trade,
      ttl: 10000 // 10 seconds
    });
  };

  const createMultipleTradesDeleteUndo = (
    trades: any[], 
    restoreFn: (trades: any[]) => Promise<void>
  ) => {
    addUndoAction({
      type: 'delete_multiple_trades',
      description: `Deleted ${trades.length} trades`,
      undoFn: () => restoreFn(trades),
      data: trades,
      ttl: 15000 // 15 seconds for multiple items
    });
  };

  const createBulkUpdateUndo = (
    description: string,
    originalData: any,
    restoreFn: (data: any) => Promise<void>
  ) => {
    addUndoAction({
      type: 'bulk_update',
      description,
      undoFn: () => restoreFn(originalData),
      data: originalData,
      ttl: 12000 // 12 seconds
    });
  };

  const createCustomUndo = (
    description: string,
    undoFn: () => Promise<void> | void,
    data?: any,
    ttl = 10000
  ) => {
    addUndoAction({
      type: 'custom',
      description,
      undoFn,
      data,
      ttl
    });
  };

  return {
    createTradeDeleteUndo,
    createMultipleTradesDeleteUndo,
    createBulkUpdateUndo,
    createCustomUndo
  };
};