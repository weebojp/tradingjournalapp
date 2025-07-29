import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsCard } from '../StatsCard';
import { AdvancedStatsCard } from '../AdvancedStatsCard';

describe('Stats Cards Layout', () => {
  test('StatsCard renders correctly', () => {
    render(
      <StatsCard
        title="Test Metric"
        value="100"
        trend="positive"
      />
    );
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('AdvancedStatsCard renders with tooltip', () => {
    render(
      <AdvancedStatsCard
        title="Profit Factor"
        value="2.50"
        trend="positive"
        description="This is a test description"
      />
    );
    
    expect(screen.getByText('Profit Factor')).toBeInTheDocument();
    expect(screen.getByText('2.50')).toBeInTheDocument();
  });

  test('AdvancedStatsCard renders with subtitle', () => {
    render(
      <AdvancedStatsCard
        title="Win Streak"
        value="5 wins"
        subtitle="Current: 3"
        trend="positive"
        description="Maximum consecutive wins"
      />
    );
    
    expect(screen.getByText('Win Streak')).toBeInTheDocument();
    expect(screen.getByText('5 wins')).toBeInTheDocument();
    expect(screen.getByText('Current: 3')).toBeInTheDocument();
  });
});