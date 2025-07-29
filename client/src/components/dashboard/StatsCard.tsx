import React from 'react';

export interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
  loading?: boolean;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend = 'neutral',
  loading = false,
  onClick
}) => {
  const getTrendStyles = () => {
    switch (trend) {
      case 'positive':
        return 'border-green-200 bg-green-50';
      case 'negative':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getValueColor = () => {
    switch (trend) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  const baseClasses = `
    relative p-6 border rounded-lg shadow-sm transition-all duration-200
    ${getTrendStyles()}
    ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
    ${loading ? 'animate-pulse' : ''}
  `;

  return (
    <div className={baseClasses.trim()} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">
            {title}
          </p>
          <p className={`text-2xl font-semibold ${getValueColor()} mt-1`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </div>
      
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};