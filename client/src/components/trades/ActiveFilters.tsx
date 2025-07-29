import React from 'react';

interface Filters {
  symbol: string;
  side: 'ALL' | 'LONG' | 'SHORT';
  dateFrom: string;
  dateTo: string;
  pnlFrom: string;
  pnlTo: string;
  positionSizeFrom: string;
  positionSizeTo: string;
  minRiskReward: string;
  maxRiskReward: string;
}

interface ActiveFiltersProps {
  filters: Filters;
  onClearFilter: (filterKey: keyof Filters) => void;
  onClearAll: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onClearFilter,
  onClearAll
}) => {
  const activeFilters: Array<{ key: keyof Filters; label: string; value: string }> = [];

  if (filters.symbol) {
    activeFilters.push({ key: 'symbol', label: 'Symbol', value: filters.symbol });
  }

  if (filters.side !== 'ALL') {
    activeFilters.push({ key: 'side', label: 'Side', value: filters.side });
  }

  if (filters.dateFrom) {
    activeFilters.push({ key: 'dateFrom', label: 'Date From', value: filters.dateFrom });
  }

  if (filters.dateTo) {
    activeFilters.push({ key: 'dateTo', label: 'Date To', value: filters.dateTo });
  }

  if (filters.pnlFrom) {
    activeFilters.push({ key: 'pnlFrom', label: 'P&L From', value: `$${filters.pnlFrom}` });
  }

  if (filters.pnlTo) {
    activeFilters.push({ key: 'pnlTo', label: 'P&L To', value: `$${filters.pnlTo}` });
  }

  if (filters.positionSizeFrom) {
    activeFilters.push({ key: 'positionSizeFrom', label: 'Position From', value: filters.positionSizeFrom });
  }

  if (filters.positionSizeTo) {
    activeFilters.push({ key: 'positionSizeTo', label: 'Position To', value: filters.positionSizeTo });
  }

  if (filters.minRiskReward) {
    activeFilters.push({ key: 'minRiskReward', label: 'Min R:R', value: filters.minRiskReward });
  }

  if (filters.maxRiskReward) {
    activeFilters.push({ key: 'maxRiskReward', label: 'Max R:R', value: filters.maxRiskReward });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-blue-900">Active Filters</h3>
        <button
          onClick={onClearAll}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear All
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {activeFilters.map(({ key, label, value }) => (
          <span
            key={key}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
          >
            <span className="font-medium">{label}:</span>
            <span className="ml-1">{value}</span>
            <button
              onClick={() => onClearFilter(key)}
              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 text-blue-600 hover:text-blue-800"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};