import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsCard } from '../StatsCard';

describe('StatsCard', () => {
  test('should render stats card with title and value', () => {
    render(<StatsCard title="Total Trades" value="25" />);

    expect(screen.getByText('Total Trades')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  test('should render stats card with subtitle', () => {
    render(<StatsCard title="Win Rate" value="75%" subtitle="+5% from last month" />);

    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('+5% from last month')).toBeInTheDocument();
  });

  test('should render stats card with icon', () => {
    const icon = <div data-testid="test-icon">📊</div>;
    render(<StatsCard title="Total PnL" value="$1,234.56" icon={icon} />);

    expect(screen.getByText('Total PnL')).toBeInTheDocument();
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  test('should apply positive trend styling', () => {
    const { container } = render(<StatsCard title="Profit" value="$500" trend="positive" />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-green-200');
  });

  test('should apply negative trend styling', () => {
    const { container } = render(<StatsCard title="Loss" value="-$200" trend="negative" />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-red-200');
  });

  test('should apply neutral trend styling by default', () => {
    const { container } = render(<StatsCard title="Neutral" value="0" />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-gray-200');
  });

  test('should be clickable when onClick is provided', () => {
    const mockOnClick = jest.fn();
    const { container } = render(<StatsCard title="Clickable" value="100" onClick={mockOnClick} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveClass('hover:shadow-md');
  });

  test('should call onClick when clicked', () => {
    const mockOnClick = jest.fn();
    const { container } = render(<StatsCard title="Clickable" value="100" onClick={mockOnClick} />);

    const card = container.firstChild as HTMLElement;
    card?.click();

    expect(mockOnClick).toHaveBeenCalled();
  });

  test('should not be clickable when onClick is not provided', () => {
    const { container } = render(<StatsCard title="Not Clickable" value="100" />);

    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass('cursor-pointer');
  });

  test('should render loading state', () => {
    const { container } = render(<StatsCard title="Loading" value="..." loading={true} />);

    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('animate-pulse');
  });

  test('should handle large numbers formatting', () => {
    render(<StatsCard title="Large Number" value="1,234,567.89" />);

    expect(screen.getByText('Large Number')).toBeInTheDocument();
    expect(screen.getByText('1,234,567.89')).toBeInTheDocument();
  });

  test('should handle percentage values', () => {
    render(<StatsCard title="Percentage" value="85.5%" />);

    expect(screen.getByText('Percentage')).toBeInTheDocument();
    expect(screen.getByText('85.5%')).toBeInTheDocument();
  });
});