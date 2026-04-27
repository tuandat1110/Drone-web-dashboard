import React from 'react';
import { Shield } from 'lucide-react';

interface HeaderProps {
    isConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ isConnected }) => {
    return (
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
            <Shield size={24} className="text-white" />
            </div>
            <div>
            <h1 className="text-xl font-bold tracking-tight">DRONE SENTINEL</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                Jetson Nano Edge AI
            </p>
            </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
                <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}
                />
                <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
                />
            </span>
            <span className="text-sm font-medium text-slate-300">
                {isConnected ? 'System Online' : 'Disconnected'}
            </span>
            </div>
        </div>
        </header>
    );
};

export default Header;