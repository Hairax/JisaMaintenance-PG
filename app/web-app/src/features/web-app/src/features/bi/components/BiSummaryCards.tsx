import React from 'react';

interface SummaryCard {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface BiSummaryCardsProps {
  cards: SummaryCard[];
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
  green: 'bg-green-50 border-green-200 text-green-800',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  red: 'bg-red-50 border-red-200 text-red-800',
  purple: 'bg-purple-50 border-purple-200 text-purple-800',
};

export const BiSummaryCards: React.FC<BiSummaryCardsProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => {
        const colorClass = colorClasses[card.color || 'blue'];
        
        return (
          <div
            key={index}
            className={`p-6 rounded-lg border-2 ${colorClass} transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                {card.trend && (
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-xs font-medium ${
                        card.trend.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {card.trend.isPositive ? '↗' : '↘'} {Math.abs(card.trend.value)}%
                    </span>
                  </div>
                )}
              </div>
              {card.icon && (
                <div className="text-2xl opacity-75">{card.icon}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BiSummaryCards;
