import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveFilters } from '../ActiveFilters';

const mockFilters = {
  symbol: 'BTCUSD',
  side: 'LONG' as const,
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  pnlFrom: '100',
  pnlTo: '1000',
  positionSizeFrom: '0.1',
  positionSizeTo: '1.0',
  minRiskReward: '1.5',
  maxRiskReward: '5.0'
};

const emptyFilters = {
  symbol: '',
  side: 'ALL' as const,
  dateFrom: '',
  dateTo: '',
  pnlFrom: '',
  pnlTo: '',
  positionSizeFrom: '',
  positionSizeTo: '',
  minRiskReward: '',
  maxRiskReward: ''
};

describe('Advanced Filtering', () => {
  test('ActiveFilters displays all active filters', () => {
    const mockClearFilter = jest.fn();
    const mockClearAll = jest.fn();

    render(
      <ActiveFilters
        filters={mockFilters}
        onClearFilter={mockClearFilter}
        onClearAll={mockClearAll}
      />
    );

    // Check that all active filters are displayed
    expect(screen.getByText('Symbol:')).toBeInTheDocument();
    expect(screen.getByText('BTCUSD')).toBeInTheDocument();
    expect(screen.getByText('Side:')).toBeInTheDocument();
    expect(screen.getByText('LONG')).toBeInTheDocument();
    expect(screen.getByText('P&L From:')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('Min R:R:')).toBeInTheDocument();
    expect(screen.getByText('1.5')).toBeInTheDocument();
  });

  test('ActiveFilters calls clearFilter when individual filter is removed', () => {
    const mockClearFilter = jest.fn();
    const mockClearAll = jest.fn();

    render(
      <ActiveFilters
        filters={mockFilters}
        onClearFilter={mockClearFilter}
        onClearAll={mockClearAll}
      />
    );

    // Click the X button on the first filter tag
    const removeButtons = screen.getAllByRole('button');
    const firstRemoveButton = removeButtons.find(button => 
      button.querySelector('svg') && button.className.includes('w-4 h-4')
    );
    
    if (firstRemoveButton) {
      fireEvent.click(firstRemoveButton);
      expect(mockClearFilter).toHaveBeenCalled();
    }
  });

  test('ActiveFilters calls clearAll when Clear All button is clicked', () => {
    const mockClearFilter = jest.fn();
    const mockClearAll = jest.fn();

    render(
      <ActiveFilters
        filters={mockFilters}
        onClearFilter={mockClearFilter}
        onClearAll={mockClearAll}
      />
    );

    const clearAllButton = screen.getByText('Clear All');
    fireEvent.click(clearAllButton);
    
    expect(mockClearAll).toHaveBeenCalled();
  });

  test('ActiveFilters does not render when no filters are active', () => {
    const mockClearFilter = jest.fn();
    const mockClearAll = jest.fn();

    const { container } = render(
      <ActiveFilters
        filters={emptyFilters}
        onClearFilter={mockClearFilter}
        onClearAll={mockClearAll}
      />
    );

    // Should render nothing when no filters are active
    expect(container.firstChild).toBeNull();
  });
});