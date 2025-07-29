import React from 'react';
import { StatsCard } from './StatsCard';

export interface AdvancedStatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  description?: string;
}

export const AdvancedStatsCard: React.FC<AdvancedStatsCardProps> = ({
  title,
  value,
  subtitle,
  trend = 'neutral',
  description
}) => {
  return (
    <div className="group relative">
      <StatsCard
        title={title}
        value={value}
        subtitle={subtitle}
        trend={trend}
        icon={
          <div className="w-6 h-6 flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${trend === 'positive' ? 'bg-green-500' : trend === 'negative' ? 'bg-red-500' : 'bg-gray-400'}`} />
          </div>
        }
      />
      {description && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          {description}
        </div>
      )}
    </div>
  );
};