// src/pages/DevicesPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Plus, Trash2, Monitor, Wifi, WifiOff,
    Clock, MapPin, ArrowLeft, RefreshCw, Key
} from 'lucide-react';
import type { Device } from '../types';
import CreateDeviceModal from '../components/devices/CreateDeviceModal';
import { useDevices } from '../hooks/useDevice';

function timeAgo(dateStr?: string): string {
    if (!dateStr) return 'Chưa kết nối';
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
}

const DevicesPage: React.FC = () => {
    const navigate = useNavigate();
    const { devices, loading, error, fetchDevices, createDevice, deleteDevice } = useDevices();
    const [showModal, setShowModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const onlineCount = Array.isArray(devices) ? devices.filter(d => d.status === 'online').length : 0;
    
    const handleDelete = async (device: Device) => {
        if (!confirm(`Xóa thiết bị "${device.device_name}"? Thao tác này không thể hoàn tác.`)) return;
        setDeletingId(device.id);
        try {
            await deleteDevice(device.id);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Header */}
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Shield size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">DRONE SENTINEL</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Quản lý thiết bị</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors"
                >
                    <ArrowLeft size={14} />
                    Dashboard
                </button>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Page title + actions */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100">Thiết bị của tôi</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            {devices?.length || 0} thiết bị đã đăng ký
                            {onlineCount > 0 && (
                                <span className="ml-2 text-green-400">· {onlineCount} đang online</span>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchDevices}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                        >
                            <Plus size={14} />
                            Thêm thiết bị
                        </button>
                    </div>
                </div>

                {/* Error state */}
                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {!loading && (!devices || devices.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                            <Monitor size={28} className="text-slate-600" />
                        </div>
                        <h3 className="text-slate-300 font-medium mb-2">Chưa có thiết bị nào</h3>
                        <p className="text-slate-500 text-sm mb-6 max-w-xs">
                            Thêm thiết bị Jetson Nano đầu tiên để bắt đầu giám sát
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                        >
                            <Plus size={14} />
                            Thêm thiết bị
                        </button>
                    </div>
                )}

                {/* Device grid */}
                {devices && devices.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {devices.map(device => (
                            <DeviceCard
                                key={device.id}
                                device={device}
                                deleting={deletingId === device.id}
                                onDelete={() => handleDelete(device)}
                                onMonitor={() => {
                                    localStorage.setItem('selected_device', JSON.stringify(device));
                                    navigate('/dashboard');
                                }}
                            />
                        ))}
                    </div>
                )}
            </main>

            {showModal && (
                <CreateDeviceModal
                    onClose={() => setShowModal(false)}
                    onCreate={createDevice}
                />
            )}
        </div>
    );
};

const DeviceCard: React.FC<{
    device: Device;
    deleting: boolean;
    onDelete: () => void;
    onMonitor: () => void;
}> = ({ device, deleting, onDelete, onMonitor }) => {
    const isOnline = device.status === 'online';

    return (
        <div className={`bg-slate-900 border rounded-2xl p-5 flex flex-col gap-4 transition-colors
            ${isOnline ? 'border-slate-700 hover:border-slate-600' : 'border-slate-800 opacity-70'}`}
        >
            {/* Top row */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isOnline ? 'bg-green-500/10' : 'bg-slate-800'}`}>
                        <Monitor size={18} className={isOnline ? 'text-green-400' : 'text-slate-500'} />
                    </div>
                    <div>
                        <div className="font-semibold text-slate-100">{device.device_name}</div>
                        {device.description && (
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin size={10} />
                                {device.description}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status badge */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    ${isOnline ? 'bg-green-500/15 text-green-400' : 'bg-slate-800 text-slate-500'}`}
                >
                    {isOnline ? (
                        <>
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                            </span>
                            Online
                        </>
                    ) : (
                        <><WifiOff size={10} /> Offline</>
                    )}
                </div>
            </div>

            {/* Meta info */}
            <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                    <Clock size={11} />
                    <span>Hoạt động: {timeAgo(device.last_seen)}</span>
                </div>
                {device.last_ip && (
                    <div className="flex items-center gap-1.5">
                        <Wifi size={11} />
                        <span>IP: <span className="font-mono text-slate-400">{device.last_ip}</span></span>
                    </div>
                )}
                <div className="flex items-center gap-1.5">
                    <Key size={11} />
                    <span>Đăng ký: {new Date(device.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-slate-800">
                <button
                    onClick={onMonitor}
                    disabled={!isOnline}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isOnline
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                >
                    <Monitor size={13} />
                    {isOnline ? 'Giám sát' : 'Không khả dụng'}
                </button>
                <button
                    onClick={onDelete}
                    disabled={deleting}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-slate-700 transition-colors"
                >
                    <Trash2 size={14} className={deleting ? 'animate-pulse' : ''} />
                </button>
            </div>
        </div>
    );
};

export default DevicesPage;