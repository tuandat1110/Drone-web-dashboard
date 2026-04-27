import React from 'react';
import type { DetectionEvent } from '../../types';

interface DetectionLogItemProps {
    event: DetectionEvent;
}

const getConfidenceColor = (conf: number) => {
    if (conf >= 0.9) return 'text-green-400';
    if (conf >= 0.75) return 'text-yellow-400';
    return 'text-red-400';
};

const DetectionLogItem: React.FC<DetectionLogItemProps> = ({ event }) => {
    const confPercent = (event.confidence * 100).toFixed(1);
    const confColor = getConfidenceColor(event.confidence);

    return (
        <div className="flex justify-between items-center border-b border-slate-800/50 pb-2 last:border-0 hover:bg-slate-800/30 px-1 rounded transition-colors">
            <span className="text-blue-400 w-20 shrink-0">{event.timestamp}</span>
            <span className="text-white flex-1 text-center">{event.label}</span>
            <span className={`${confColor} w-14 text-right`}>{confPercent}%</span>
        </div>
    );
};

export default DetectionLogItem;