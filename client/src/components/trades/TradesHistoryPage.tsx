import React, { useState, useEffect, useCallback } from 'react';
import { apiClient, Trade, TradeStats, CreateTradeData } from '../../services/api';
import { TradeList } from './TradeList';
import { TradeDetailModal } from './TradeDetailModal';
import { CloseTradeModal } from './CloseTradeModal';
import { EditTradeModal } from './EditTradeModal';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import { ErrorDisplay } from '../common/ErrorDisplay';
import { useUndo } from '../../contexts/UndoContext';
import { STRINGS } from '../../constants/strings';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalTrades: number;
  tradesPerPage: number;
}

interface Filters {
  symbol: string;
  side: 'ALL' | 'LONG' | 'SHORT';
  dateFrom: string;
  dateTo: string;
}

export const TradesHistoryPage: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [tradeToClose, setTradeToClose] = useState<Trade | null>(null);
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);
  const [showTradeDetail, setShowTradeDetail] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [closeTradeLoading, setCloseTradeLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [editTradeLoading, setEditTradeLoading] = useState(false);
  const [editTradeError, setEditTradeError] = useState<string | null>(null);

  const { addUndoAction } = useUndo();

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalTrades: 0,
    tradesPerPage: 20
  });

  // Filters state
  const [filters, setFilters] = useState<Filters>({
    symbol: '',
    side: 'ALL',
    dateFrom: '',
    dateTo: ''
  });

  const [jumpToPage, setJumpToPage] = useState('');

  const loadTrades = useCallback(async (page: number = 1, currentFilters: Filters = filters) => {
    try {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * pagination.tradesPerPage;
      
      // Build filter parameters
      const filterParams: any = {
        limit: pagination.tradesPerPage,
        offset
      };

      if (currentFilters.symbol.trim()) {
        filterParams.symbol = currentFilters.symbol.trim().toUpperCase();
      }
      
      if (currentFilters.side !== 'ALL') {
        filterParams.side = currentFilters.side;
      }
      
      if (currentFilters.dateFrom) {
        filterParams.startDate = currentFilters.dateFrom;
      }
      
      if (currentFilters.dateTo) {
        filterParams.endDate = currentFilters.dateTo;
      }

      const [tradesResponse, statsResponse] = await Promise.all([
        apiClient.getTrades(filterParams),
        apiClient.getTradeStats()
      ]);

      setTrades(tradesResponse.trades);
      setStats(statsResponse);
      
      // Update pagination info
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalTrades: tradesResponse.pagination.total,
        totalPages: Math.ceil(tradesResponse.pagination.total / prev.tradesPerPage)
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trades';
      setError(errorMessage);
      console.error('Trades loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.tradesPerPage, filters]);

  useEffect(() => {
    loadTrades(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (page: number) => {
    loadTrades(page);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    loadTrades(1, newFilters);
  };

  const handleViewTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setShowTradeDetail(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setTradeToEdit(trade);
    setShowEditModal(true);
    setEditTradeError(null);
  };

  const handleEditTradeSubmit = async (tradeData: any) => {
    if (!tradeToEdit) return;
    
    try {
      setEditTradeLoading(true);
      setEditTradeError(null);
      
      // Pass all the trade data fields for a complete update
      const updateData: any = {
        tradeDate: tradeData.tradeDate,
        symbol: tradeData.symbol,
        side: tradeData.side,
        entryPrice: tradeData.entryPrice,
        positionSize: tradeData.positionSize,
        leverage: tradeData.leverage,
        notes: tradeData.notes
      };

      // Include exit fields if provided
      if (tradeData.exitPrice !== undefined) {
        updateData.exitPrice = tradeData.exitPrice;
      }
      if (tradeData.exitDate !== undefined) {
        updateData.exitDate = tradeData.exitDate;
      }

      await apiClient.updateTrade(tradeToEdit.id, updateData);
      
      // Close modal and reload trades
      setShowEditModal(false);
      setTradeToEdit(null);
      await loadTrades(pagination.currentPage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update trade';
      setEditTradeError(errorMessage);
    } finally {
      setEditTradeLoading(false);
    }
  };

  const handleCloseTrade = (trade: Trade) => {
    setTradeToClose(trade);
    setShowCloseModal(true);
  };

  const handleDeleteTrade = (trade: Trade) => {
    setTradeToDelete(trade);
    setShowDeleteConfirm(true);
  };

  const handleCloseTradeSubmit = async (closeData: any) => {
    if (!tradeToClose) return;

    try {
      setCloseTradeLoading(true);
      await apiClient.updateTrade(tradeToClose.id, {
        ...tradeToClose,
        exitPrice: closeData.exitPrice,
        exitDate: closeData.exitDate,
        pnl: closeData.pnl,
        notes: closeData.notes || tradeToClose.notes
      });

      setShowCloseModal(false);
      setTradeToClose(null);
      await loadTrades(pagination.currentPage);
    } catch (err) {
      console.error('Failed to close trade:', err);
    } finally {
      setCloseTradeLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!tradeToDelete) return;

    try {
      await apiClient.deleteTrade(tradeToDelete.id);
      
      // Add undo action
      addUndoAction({
        type: 'delete_trade',
        data: tradeToDelete,
        description: `Deleted trade ${tradeToDelete.symbol}`,
        undoFn: async () => {
          // Would need to implement trade restoration
          console.log('Undo delete trade:', tradeToDelete.id);
        }
      });

      setShowDeleteConfirm(false);
      setTradeToDelete(null);
      await loadTrades(pagination.currentPage);
    } catch (err) {
      console.error('Failed to delete trade:', err);
    }
  };

  const clearFilters = () => {
    const resetFilters: Filters = {
      symbol: '',
      side: 'ALL',
      dateFrom: '',
      dateTo: ''
    };
    handleFiltersChange(resetFilters);
  };

  const handleJumpToPage = () => {
    const pageNumber = parseInt(jumpToPage);
    if (pageNumber >= 1 && pageNumber <= pagination.totalPages) {
      handlePageChange(pageNumber);
      setJumpToPage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{STRINGS.TRADES_HISTORY}</h1>
        <p className="text-gray-600 mt-1">View, filter, and manage all your trades</p>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total Trades</div>
            <div className="text-2xl font-bold text-gray-900">{pagination.totalTrades}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Win Rate</div>
            <div className={`text-2xl font-bold ${stats.winRate >= 0.5 ? 'text-green-600' : 'text-red-600'}`}>
              {(stats.winRate * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total P&L</div>
            <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${stats.totalPnL.toFixed(2)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Avg Trade</div>
            <div className="text-2xl font-bold text-gray-900">
              ${stats.totalTrades > 0 ? (stats.totalPnL / stats.totalTrades).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
            <input
              type="text"
              value={filters.symbol}
              onChange={(e) => setFilters(prev => ({ ...prev, symbol: e.target.value }))}
              placeholder="e.g. BTCUSD"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Side</label>
            <select
              value={filters.side}
              onChange={(e) => setFilters(prev => ({ ...prev, side: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Sides</option>
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={() => handleFiltersChange(filters)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Apply
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <ErrorDisplay 
            error={error} 
            onRetry={() => loadTrades(pagination.currentPage)}
          />
        </div>
      )}

      {/* Trades List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Trade History ({pagination.totalTrades} total)
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Show:</label>
                <select
                  value={pagination.tradesPerPage}
                  onChange={(e) => {
                    const newPerPage = parseInt(e.target.value);
                    setPagination(prev => ({ ...prev, tradesPerPage: newPerPage }));
                    loadTrades(1, filters);
                  }}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
              <div className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
            </div>
          </div>
        </div>

        <TradeList
          trades={trades}
          onView={handleViewTrade}
          onEdit={handleEditTrade}
          onClose={handleCloseTrade}
          onDelete={handleDeleteTrade}
          loading={loading}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing {Math.min((pagination.currentPage - 1) * pagination.tradesPerPage + 1, pagination.totalTrades)} to{' '}
                {Math.min(pagination.currentPage * pagination.tradesPerPage, pagination.totalTrades)} of{' '}
                {pagination.totalTrades} results
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers with dynamic range */}
                {(() => {
                  const pageNumbers = [];
                  const maxButtons = 7; // Maximum number of page buttons to show
                  const halfRange = Math.floor(maxButtons / 2);
                  
                  let startPage = Math.max(1, pagination.currentPage - halfRange);
                  let endPage = Math.min(pagination.totalPages, pagination.currentPage + halfRange);
                  
                  // Adjust if we're near the beginning or end
                  if (pagination.currentPage <= halfRange) {
                    endPage = Math.min(maxButtons, pagination.totalPages);
                  } else if (pagination.currentPage + halfRange >= pagination.totalPages) {
                    startPage = Math.max(1, pagination.totalPages - maxButtons + 1);
                  }
                  
                  // First page
                  if (startPage > 1) {
                    pageNumbers.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        1
                      </button>
                    );
                    
                    if (startPage > 2) {
                      pageNumbers.push(
                        <span key="ellipsis1" className="px-2 py-2 text-gray-500">...</span>
                      );
                    }
                  }
                  
                  // Page range
                  for (let page = startPage; page <= endPage; page++) {
                    pageNumbers.push(
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm rounded-md ${
                          pagination.currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  
                  // Last page
                  if (endPage < pagination.totalPages) {
                    if (endPage < pagination.totalPages - 1) {
                      pageNumbers.push(
                        <span key="ellipsis2" className="px-2 py-2 text-gray-500">...</span>
                      );
                    }
                    
                    pageNumbers.push(
                      <button
                        key={pagination.totalPages}
                        onClick={() => handlePageChange(pagination.totalPages)}
                        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        {pagination.totalPages}
                      </button>
                    );
                  }
                  
                  return pageNumbers;
                })()}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              
              {/* Jump to page */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Go to page:</span>
                <input
                  type="number"
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
                  min="1"
                  max={pagination.totalPages}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleJumpToPage}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!jumpToPage || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > pagination.totalPages}
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TradeDetailModal
        isOpen={showTradeDetail}
        trade={selectedTrade}
        onClose={() => {
          setShowTradeDetail(false);
          setSelectedTrade(null);
        }}
      />

      {tradeToClose && (
        <CloseTradeModal
          isOpen={showCloseModal}
          trade={tradeToClose}
          onClose={() => {
            setShowCloseModal(false);
            setTradeToClose(null);
          }}
          onSubmit={handleCloseTradeSubmit}
          loading={closeTradeLoading}
        />
      )}

      <EditTradeModal
        isOpen={showEditModal}
        trade={tradeToEdit}
        onClose={() => {
          setShowEditModal(false);
          setTradeToEdit(null);
          setEditTradeError(null);
        }}
        onSubmit={handleEditTradeSubmit}
        loading={editTradeLoading}
        error={editTradeError || undefined}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Trade"
        message={`Are you sure you want to delete this ${tradeToDelete?.symbol} trade? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setTradeToDelete(null);
        }}
      />
    </div>
  );
};