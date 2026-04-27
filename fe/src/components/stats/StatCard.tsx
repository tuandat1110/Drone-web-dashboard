import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  colorClass?: string; 
}

const StatCard: React.FC<StatCardProps> = ({
    icon,
    label,
    value,
    unit,
    colorClass = 'text-blue-400',
}) => {
    return (
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
            {icon}
            <span className="text-xs uppercase font-bold tracking-wider">{label}</span>
        </div>
        <div className="flex items-end gap-1">
            <p className={`text-3xl font-mono font-bold ${colorClass}`}>{value}</p>
            {unit && <span className="text-xs text-slate-500 mb-1">{unit}</span>}
        </div>
        </div>
    );
};

export default StatCard;