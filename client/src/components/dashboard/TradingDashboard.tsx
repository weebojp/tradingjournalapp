import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, Trade, TradeStats, CreateTradeData, UpdateTradeData } from '../../services/api';
import { StatsCard } from './StatsCard';
import { TradeList } from '../trades/TradeList';
import { AddTradeModal } from '../trades/AddTradeModal';
import { CloseTradeModal } from '../trades/CloseTradeModal';
import { TradeDetailModal } from '../trades/TradeDetailModal';
import { EditTradeModal } from '../trades/EditTradeModal';
import { HelpButton } from '../help/HelpButton';
import { HelpTooltip } from '../help/HelpTooltip';
import { OnboardingTour } from '../help/OnboardingTour';
import { useConfirmationDialog } from '../common/ConfirmationDialog';
import { ErrorDisplay, useErrorState } from '../common/ErrorDisplay';
import { STRINGS } from '../../constants/strings';
import { useKeyboardShortcuts, createCommonShortcuts } from '../../hooks/useKeyboardShortcuts';
import { KeyboardShortcutsPanel, useKeyboardShortcutsPanel } from '../help/KeyboardShortcutsPanel';
import { useHelp } from '../../contexts/HelpContext';
import { useUndoHelpers } from '../common/UndoNotification';
import { useLoadingState } from '../../hooks/useLoadingState';
import { EnhancedLoading } from '../common/EnhancedLoading';

export const TradingDashboard: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { error, handleError, clearError, retry } = useErrorState();
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();
  const { toggleHelpMode } = useHelp();
  const { isOpen: isShortcutsOpen, showShortcuts, hideShortcuts } = useKeyboardShortcutsPanel();
  const { createTradeDeleteUndo } = useUndoHelpers();
  const { loadingState, startLoading, updateStepProgress, completeLoading, resetLoading } = useLoadingState();
  const [isAddTradeModalOpen, setIsAddTradeModalOpen] = useState(false);
  const [addTradeLoading, setAddTradeLoading] = useState(false);
  const [addTradeError, setAddTradeError] = useState<string | null>(null);
  
  const [isCloseTradeModalOpen, setIsCloseTradeModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [closeTradeLoading, setCloseTradeLoading] = useState(false);
  const [closeTradeError, setCloseTradeError] = useState<string | null>(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewTrade, setViewTrade] = useState<Trade | null>(null);
  
  const [isEditTradeModalOpen, setIsEditTradeModalOpen] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);
  const [editTradeLoading, setEditTradeLoading] = useState(false);
  const [editTradeError, setEditTradeError] = useState<string | null>(null);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendForPnL = (pnl: number): 'positive' | 'negative' | 'neutral' => {
    if (pnl > 0) return 'positive';
    if (pnl < 0) return 'negative';
    return 'neutral';
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      clearError();

      // Start enhanced loading with steps
      startLoading([
        { id: 'init', label: 'Initializing dashboard...' },
        { id: 'trades', label: 'Loading recent trades...' },
        { id: 'stats', label: 'Calculating statistics...' },
        { id: 'finalize', label: 'Finalizing dashboard...' }
      ]);

      // Step 1: Initialize
      updateStepProgress('init', 100);
      await new Promise(resolve => setTimeout(resolve, 200)); // Brief pause for UX

      // Step 2: Load trades
      updateStepProgress('trades', 30);
      const tradesPromise = apiClient.getTrades({ limit: 5, offset: 0 });
      updateStepProgress('trades', 70);

      // Step 3: Load stats (parallel)
      updateStepProgress('stats', 30);
      const statsPromise = apiClient.getTradeStats();
      updateStepProgress('stats', 70);

      // Wait for both to complete
      const [tradesResponse, statsResponse] = await Promise.all([
        tradesPromise,
        statsPromise
      ]);

      updateStepProgress('trades', 100);
      updateStepProgress('stats', 100);

      // Step 4: Finalize
      updateStepProgress('finalize', 50);
      setTrades(tradesResponse.trades);
      setStats(statsResponse);
      updateStepProgress('finalize', 100);

      // Complete loading
      await new Promise(resolve => setTimeout(resolve, 100)); // Brief pause to show completion
      completeLoading();
    } catch (err) {
      handleError(err, { action: 'load_dashboard' });
      resetLoading();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    clearError();
    loadDashboardData();
  };

  const handleEditTrade = (trade: Trade) => {
    setEditTrade(trade);
    setIsEditTradeModalOpen(true);
    setEditTradeError(null);
  };

  const handleEditTradeSubmit = async (tradeData: any) => {
    if (!editTrade) return;
    
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

      await apiClient.updateTrade(editTrade.id, updateData);
      
      // Close modal and reload dashboard data
      setIsEditTradeModalOpen(false);
      setEditTrade(null);
      await loadDashboardData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update trade';
      setEditTradeError(errorMessage);
    } finally {
      setEditTradeLoading(false);
    }
  };

  const handleDeleteTrade = (trade: Trade) => {
    showConfirmation({
      title: STRINGS.DELETE_TRADE,
      message: `${STRINGS.CONFIRM_DELETE_TRADE.replace('this trade', `this ${trade.symbol} trade`)} ${STRINGS.DELETE_WARNING}`,
      confirmText: STRINGS.DELETE_TRADE,
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          // First delete the trade
          await apiClient.deleteTrade(trade.id);
          
          // Create undo action with restore function
          createTradeDeleteUndo(trade, async (deletedTrade) => {
            try {
              // Restore the trade by creating it again
              await apiClient.createTrade({
                tradeDate: deletedTrade.tradeDate,
                symbol: deletedTrade.symbol,
                side: deletedTrade.side,
                entryPrice: deletedTrade.entryPrice,
                positionSize: deletedTrade.positionSize,
                leverage: deletedTrade.leverage,
                notes: deletedTrade.notes
              });
              await loadDashboardData();
            } catch (restoreErr) {
              handleError(restoreErr, { action: 'restore_trade', tradeId: deletedTrade.id });
            }
          });
          
          // Reload dashboard data
          await loadDashboardData();
        } catch (err) {
          handleError(err, { action: 'delete_trade', tradeId: trade.id });
        }
      }
    });
  };

  const handleAddTrade = async (tradeData: CreateTradeData) => {
    try {
      setAddTradeLoading(true);
      setAddTradeError(null);
      
      await apiClient.createTrade(tradeData);
      
      // Close modal and reload dashboard data
      setIsAddTradeModalOpen(false);
      await loadDashboardData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create trade';
      setAddTradeError(errorMessage);
    } finally {
      setAddTradeLoading(false);
    }
  };

  const handleCloseTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsCloseTradeModalOpen(true);
    setCloseTradeError(null);
  };

  const handleCloseTradeSubmit = async (updateData: UpdateTradeData) => {
    if (!selectedTrade) return;
    
    try {
      setCloseTradeLoading(true);
      setCloseTradeError(null);
      
      await apiClient.updateTrade(selectedTrade.id, updateData);
      
      // Close modal and reload dashboard data
      setIsCloseTradeModalOpen(false);
      setSelectedTrade(null);
      await loadDashboardData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to close trade';
      setCloseTradeError(errorMessage);
    } finally {
      setCloseTradeLoading(false);
    }
  };

  const handleViewTrade = (trade: Trade) => {
    setViewTrade(trade);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewTrade(null);
  };

  // Keyboard shortcuts configuration
  const shortcuts = createCommonShortcuts({
    onAddTrade: () => {
      if (!isAddTradeModalOpen && !isCloseTradeModalOpen && !isDetailModalOpen && !isEditTradeModalOpen) {
        setIsAddTradeModalOpen(true);
      }
    },
    onRefresh: () => {
      if (!loading) {
        handleRefresh();
      }
    },
    onToggleHelp: toggleHelpMode,
    onCancel: () => {
      if (isAddTradeModalOpen) {
        setIsAddTradeModalOpen(false);
        setAddTradeError(null);
      } else if (isCloseTradeModalOpen) {
        setIsCloseTradeModalOpen(false);
        setSelectedTrade(null);
        setCloseTradeError(null);
      } else if (isDetailModalOpen) {
        handleCloseDetailModal();
      } else if (isEditTradeModalOpen) {
        setIsEditTradeModalOpen(false);
        setEditTrade(null);
        setEditTradeError(null);
      } else if (isShortcutsOpen) {
        hideShortcuts();
      }
    }
  });

  // Add custom shortcut for showing keyboard shortcuts
  shortcuts.push({
    key: 'k',
    metaKey: true,
    description: 'Show Keyboard Shortcuts',
    action: showShortcuts
  });

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({ shortcuts });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EnhancedLoading
          loadingState={loadingState}
          showNetworkStatus={true}
          showProgress={true}
          variant="progress"
          className="w-full max-w-lg"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <ErrorDisplay
          error={error}
          onRetry={() => retry(loadDashboardData)}
          context={{ component: 'TradingDashboard' }}
          variant="card"
          showDetails={process.env.NODE_ENV === 'development'}
          className="max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <HelpTooltip
        id="dashboard-header"
        content={STRINGS.HELP_DASHBOARD}
      >
        <div className="flex items-center justify-between mb-8" data-tour="dashboard-header">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{STRINGS.TRADING_DASHBOARD}</h1>
            <p className="text-gray-600 mt-1">{STRINGS.DASHBOARD_SUBTITLE}</p>
          </div>
          <div className="flex items-center space-x-3">
            <HelpButton variant="icon" className="" data-tour="help-button" />
            <HelpTooltip
              id="add-trade-button"
              content={STRINGS.HELP_ADD_TRADE}
            >
              <button
                onClick={() => setIsAddTradeModalOpen(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                data-tour="add-trade-button"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {STRINGS.ADD_TRADE}
              </button>
            </HelpTooltip>
            <HelpTooltip
              id="refresh-button"
              content={STRINGS.HELP_REFRESH}
            >
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                data-tour="refresh-button"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {STRINGS.REFRESH}
              </button>
            </HelpTooltip>
          </div>
        </div>
      </HelpTooltip>

      {/* Stats Cards */}
      <HelpTooltip
        id="stats-cards"
        content={STRINGS.HELP_STATS_CARDS}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-tour="stats-cards">
        <StatsCard
          title={STRINGS.TOTAL_TRADES}
          value={stats?.totalTrades.toString() || '0'}
          icon={
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        
        <StatsCard
          title={STRINGS.TOTAL_PNL}
          value={formatCurrency(stats?.totalPnL || 0)}
          trend={getTrendForPnL(stats?.totalPnL || 0)}
          icon={
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />
        
        <StatsCard
          title={STRINGS.WIN_RATE}
          value={formatPercentage(stats?.winRate || 0)}
          trend={stats?.winRate && stats.winRate > 50 ? 'positive' : stats?.winRate && stats.winRate < 50 ? 'negative' : 'neutral'}
          icon={
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <StatsCard
          title={STRINGS.AVERAGE_WIN}
          value={formatCurrency(stats?.avgWin || 0)}
          trend={stats?.avgWin && stats.avgWin > 0 ? 'positive' : 'neutral'}
          icon={
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        </div>
      </HelpTooltip>

      {/* Recent Trades */}
      <HelpTooltip
        id="recent-trades"
        content={STRINGS.HELP_RECENT_TRADES}
      >
        <div className="bg-white shadow rounded-lg" data-tour="recent-trades">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">{STRINGS.RECENT_TRADES}</h2>
              <p className="text-sm text-gray-600 mt-1">{STRINGS.RECENT_TRADES_SUBTITLE}</p>
            </div>
            <Link
              to="/trades"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View All Trades
            </Link>
          </div>
          <div className="p-6">
            <TradeList
              trades={trades.slice(0, 5)}
              onEdit={handleEditTrade}
              onDelete={handleDeleteTrade}
              onClose={handleCloseTrade}
              onView={handleViewTrade}
              loading={false}
            />
          </div>
        </div>
      </HelpTooltip>

      {/* Add Trade Modal */}
      <AddTradeModal
        isOpen={isAddTradeModalOpen}
        onClose={() => {
          setIsAddTradeModalOpen(false);
          setAddTradeError(null);
        }}
        onSubmit={handleAddTrade}
        loading={addTradeLoading}
        error={addTradeError || undefined}
      />

      {/* Close Trade Modal */}
      {selectedTrade && (
        <CloseTradeModal
          isOpen={isCloseTradeModalOpen}
          trade={selectedTrade}
          onClose={() => {
            setIsCloseTradeModalOpen(false);
            setSelectedTrade(null);
            setCloseTradeError(null);
          }}
          onSubmit={handleCloseTradeSubmit}
          loading={closeTradeLoading}
          error={closeTradeError || undefined}
        />
      )}

      {/* Trade Detail Modal */}
      <TradeDetailModal
        isOpen={isDetailModalOpen}
        trade={viewTrade}
        onClose={handleCloseDetailModal}
      />

      {/* Edit Trade Modal */}
      <EditTradeModal
        isOpen={isEditTradeModalOpen}
        trade={editTrade}
        onClose={() => {
          setIsEditTradeModalOpen(false);
          setEditTrade(null);
          setEditTradeError(null);
        }}
        onSubmit={handleEditTradeSubmit}
        loading={editTradeLoading}
        error={editTradeError || undefined}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog />

      {/* Onboarding Tour */}
      <OnboardingTour />

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel
        shortcuts={shortcuts}
        isOpen={isShortcutsOpen}
        onClose={hideShortcuts}
      />
    </div>
  );
};