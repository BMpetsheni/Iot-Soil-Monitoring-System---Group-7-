
import React from 'react';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, unit, colorClass }) => {
  return (
    <div className="bg-surface rounded-xl shadow-sm p-5 flex items-center space-x-4">
      <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${colorClass}`}>
        <span className="material-symbols-outlined text-white text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-sm text-on-surface-secondary font-medium">{label}</p>
        <p className="text-2xl font-bold text-on-surface">
          {value}
          {unit && <span className="text-base font-medium text-on-surface-secondary ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
