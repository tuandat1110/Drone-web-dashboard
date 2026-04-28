// src/components/devices/DeviceSelector.tsx
import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Monitor, Plus, Wifi, WifiOff, Clock } from 'lucide-react';
import type { Device } from '../../types';

interface Props {
    devices: Device[];
    selected: Device | null;
    onSelect: (device: Device) => void;
    onAddNew: () => void;
}

function timeAgo(dateStr?: string): string {
    if (!dateStr) return 'Chưa kết nối';
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
}

const DeviceSelector: React.FC<Props> = ({ devices, selected, onSelect, onAddNew }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const onlineDevices = devices.filter(d => d.status === 'online');
    const offlineDevices = devices.filter(d => d.status === 'offline');

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition-all text-sm min-w-[180px]"
            >
                {/* Status dot */}
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                    {selected?.status === 'online' ? (
                        <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                        </>
                    ) : (
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-600" />
                    )}
                </span>

                <Monitor size={13} className="text-slate-400 shrink-0" />

                <span className="text-slate-200 font-medium truncate flex-1 text-left">
                    {selected ? selected.device_name : 'Chọn thiết bị'}
                </span>

                <ChevronDown
                    size={13}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="absolute left-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black/60 z-50 overflow-hidden">
                    {devices.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-slate-400 text-center">
                            Chưa có thiết bị nào
                        </div>
                    ) : (
                        <>
                            {onlineDevices.length > 0 && (
                                <div>
                                    <div className="px-4 pt-3 pb-1 text-[10px] text-slate-500 uppercase tracking-widest font-medium flex items-center gap-1.5">
                                        <Wifi size={10} className="text-green-500" /> Online
                                    </div>
                                    {onlineDevices.map(device => (
                                        <DeviceItem
                                            key={device.id}
                                            device={device}
                                            isSelected={selected?.id === device.id}
                                            onClick={() => { onSelect(device); setOpen(false); }}
                                        />
                                    ))}
                                </div>
                            )}

                            {offlineDevices.length > 0 && (
                                <div className={onlineDevices.length > 0 ? 'border-t border-slate-800' : ''}>
                                    <div className="px-4 pt-3 pb-1 text-[10px] text-slate-500 uppercase tracking-widest font-medium flex items-center gap-1.5">
                                        <WifiOff size={10} /> Offline
                                    </div>
                                    {offlineDevices.map(device => (
                                        <DeviceItem
                                            key={device.id}
                                            device={device}
                                            isSelected={selected?.id === device.id}
                                            onClick={() => { onSelect(device); setOpen(false); }}
                                            disabled
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Add new */}
                    <div className="border-t border-slate-800">
                        <button
                            onClick={() => { onAddNew(); setOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-blue-400 hover:bg-blue-500/10 transition-colors"
                        >
                            <Plus size={14} />
                            <span>Thêm thiết bị mới</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const DeviceItem: React.FC<{
    device: Device;
    isSelected: boolean;
    onClick: () => void;
    disabled?: boolean;
}> = ({ device, isSelected, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
            ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800'}
            ${isSelected ? 'bg-blue-500/10' : ''}
        `}
    >
        <span className={`w-2 h-2 rounded-full shrink-0 ${device.status === 'online' ? 'bg-green-500' : 'bg-slate-600'}`} />
        <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-200 font-medium truncate">{device.device_name}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Clock size={9} />
                <span>{timeAgo(device.last_seen)}</span>
                {device.last_ip && <span>· {device.last_ip}</span>}
            </div>
        </div>
        {isSelected && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
        )}
    </button>
);

export default DeviceSelector;