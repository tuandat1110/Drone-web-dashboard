import React, { useRef, useEffect } from 'react';
import { List } from 'lucide-react';
import DetectionLogItem from './DetectionLogItem';
import type { DetectionEvent } from '../../types';

interface DetectionLogProps {
    detections: DetectionEvent[];
}

const DetectionLog: React.FC<DetectionLogProps> = ({ detections }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest detection
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [detections]);

    return (
        <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden min-h-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
            <List size={18} className="text-blue-400" />
            <span className="font-bold text-sm">Detection History</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">{detections.length} events</span>
        </div>

        {/* Log Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[12px]">
            {detections.length === 0 ? (
            <p className="text-slate-600 italic text-center mt-6">No detections yet...</p>
            ) : (
            detections.map((event) => (
                <DetectionLogItem key={event.id} event={event} />
            ))
            )}
            <div ref={bottomRef} />
        </div>
        </div>
    );
};

export default DetectionLog;