import React, { useState } from 'react';
import { Camera, Crop, Check, Wifi, WifiOff } from 'lucide-react';

interface VideoControlsProps {
    onConnect?:    () => void;
    onDisconnect?: () => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({ onConnect, onDisconnect }) => {
    const [captured, setCaptured] = useState(false);
    const [roiActive, setRoiActive] = useState(false);

    const handleCapture = () => {
        setCaptured(true);
        setTimeout(() => setCaptured(false), 2000);
    };

    const handleROI = () => {
        setRoiActive((prev) => !prev);
    };

    return (
        <div className="h-20 bg-slate-900 rounded-2xl border border-slate-800 px-5 flex items-center gap-3 shrink-0">
            {/* Connect / Disconnect */}
            <button
                onClick={onConnect}
                className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200"
            >
                <Wifi size={16} />
                Kết nối
            </button>

            <button
                onClick={onDisconnect}
                className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all duration-200"
            >
                <WifiOff size={16} />
                Ngắt
            </button>

            <div className="w-px h-8 bg-slate-700" />

            {/* Capture */}
            <button
                onClick={handleCapture}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    captured
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
            >
                {captured ? <Check size={16} /> : <Camera size={16} />}
                {captured ? 'Captured!' : 'Capture'}
            </button>

            {/* ROI */}
            <button
                onClick={handleROI}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                    roiActive
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
            >
                <Crop size={16} />
                {roiActive ? 'ROI Active' : 'Mark ROI'}
            </button>

            <div className="ml-auto text-xs text-slate-600 font-mono">
                Press{' '}
                <kbd className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400">
                    S
                </kbd>{' '}
                to snapshot
            </div>
        </div>
    );
};

export default VideoControls;