import React, { useEffect, useRef } from 'react';
import { Scan, Target, Maximize2 } from 'lucide-react';
import type { WebRTCState } from '../../hooks/useWebRTC';

interface VideoPanelProps {
    stream: MediaStream | null;
    status: WebRTCState;
};

const STATUS_LABELS: Record<WebRTCState, string> = {
    idle:               'Chưa kết nối',
    connecting:         'Đang kết nối signaling...',
    'waiting-publisher':'Chờ camera publisher...',
    negotiating:        'Đang thiết lập WebRTC...',
    live:               '',   // đang stream, không hiện overlay
    disconnected:       'Mất kết nối',
    error:              'Lỗi kết nối',
};

const VideoPanel: React.FC<VideoPanelProps> = ({ stream, status }) => {
    //const [imgError, setImgError] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    
    useEffect(() => {
        const video = videoRef.current;
        if(!video) return;
        if(stream) {
            video.srcObject = stream;
            video.play().catch(() => {})
        } else {
            video.srcObject = null;
        }
    }, [stream]);

    const isLive    = status === 'live';
    const overlayMsg = STATUS_LABELS[status];
    
    return (
        <div className="flex-1 bg-slate-950 rounded-3xl border border-slate-800 relative overflow-hidden group shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]">
            
            {/* 1. Kính ngắm AI (Decor) - Chỉ hiện khi đang Connect */}
            {isLive && (
                <div className="absolute inset-0 pointer-events-none z-20">
                    <div className="absolute top-10 left-10 w-10 h-10 border-t-2 border-l-2 border-blue-500/50 rounded-tl-lg"></div>
                    <div className="absolute top-10 right-10 w-10 h-10 border-t-2 border-r-2 border-blue-500/50 rounded-tr-lg"></div>
                    <div className="absolute bottom-10 left-10 w-10 h-10 border-b-2 border-l-2 border-blue-500/50 rounded-bl-lg"></div>
                    <div className="absolute bottom-10 right-10 w-10 h-10 border-b-2 border-r-2 border-blue-500/50 rounded-br-lg"></div>
                    
                    {/* Hiệu ứng quét Scan line */}
                    <div className="w-full h-[2px] bg-blue-500/10 absolute top-0 animate-[scan_3s_linear_infinite]"></div>
                </div>
            )}

            {/* 2. Badges Header */}
            <div className="absolute top-5 left-5 z-30 flex gap-3">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
                    <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        {isLive ? 'Signal Live' : 'Offline'}
                    </span>
                </div>
                <span className="hidden md:block bg-slate-900/80 backdrop-blur-md text-[10px] px-3 py-1.5 rounded-full border border-white/5 text-slate-400 font-mono">
                    localhost:3001/stream
                </span>
            </div>

            {/* 3. Connection Status (Top Right) */}
            <div className="absolute top-5 right-5 z-30">
                <button className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full border border-white/10 transition-all">
                    <Maximize2 size={14} className="text-slate-300" />
                </button>
            </div>

            {/* 4. Main Content Area */}
            <div className="relative w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
                {isLive  ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
                            <div className="relative w-20 h-20 rounded-full border border-slate-800 flex items-center justify-center bg-slate-900">
                                <Scan size={32} className="text-slate-600 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Searching for Source...</p>
                            <p className="text-[10px] text-slate-600 font-mono">localhost:3001/stream</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 5. Bottom Overlay Info */}
            {isLive && (
                <div className="absolute bottom-5 left-5 right-5 z-30 flex justify-between items-end pointer-events-none">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Target size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-blue-400/80">Auto-Tracking Active</span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-mono">COORD: 21.0285° N, 105.8542° E</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-mono uppercase">Encoder: H.264 / MJPEG</p>
                        <p className="text-[10px] text-slate-500 font-mono uppercase">Res: 1280x720</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPanel;