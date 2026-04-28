// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Cpu, Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layouts/Header';
import VideoPanel from '../components/videos/VideoPanel';
import VideoControls from '../components/videos/VideoControl';
import DetectionLog from '../components/detections/DetectionLog';
import StatCard from '../components/stats/StatCard';
import UserMenu from '../components/menu/UserMenu';
import DeviceSelector from '../components/devices/DeviceSelector';
import CreateDeviceModal from '../components/devices/CreateDeviceModal';
import { useWebRTC } from '../hooks/useWebRTC';
import type { DetectionEvent, Device } from '../types';
import { useDevices } from '../hooks/useDevice';

export interface UserInfo {
    id: string | number;
    username: string;
    email: string;
}

const fakeDetections: DetectionEvent[] = [
    { id: "evt_001", timestamp: "2026-04-23T12:01:15Z", label: "drone", confidence: 0.92, bbox: { x: 120, y: 80, w: 60, h: 40 } },
    { id: "evt_002", timestamp: "2026-04-23T12:01:17Z", label: "drone", confidence: 0.87, bbox: { x: 200, y: 100, w: 55, h: 38 } },
    { id: "evt_003", timestamp: "2026-04-23T12:01:20Z", label: "bird", confidence: 0.65, bbox: { x: 300, y: 120, w: 40, h: 30 } },
    { id: "evt_004", timestamp: "2026-04-23T12:01:25Z", label: "drone", confidence: 0.96, bbox: { x: 150, y: 90, w: 70, h: 45 } },
    { id: "evt_005", timestamp: "2026-04-23T12:01:30Z", label: "drone", confidence: 0.78, bbox: { x: 180, y: 110, w: 65, h: 42 } },
    { id: "evt_006", timestamp: "2026-04-23T12:01:35Z", label: "plane", confidence: 0.55, bbox: { x: 50, y: 60, w: 100, h: 60 } },
    { id: "evt_007", timestamp: "2026-04-23T12:01:40Z", label: "drone", confidence: 0.89, bbox: { x: 220, y: 130, w: 58, h: 36 } },
    { id: "evt_008", timestamp: "2026-04-23T12:01:45Z", label: "drone", confidence: 0.94, bbox: { x: 260, y: 140, w: 62, h: 40 } },
    { id: "evt_009", timestamp: "2026-04-23T12:01:50Z", label: "drone", confidence: 0.81, bbox: { x: 300, y: 150, w: 50, h: 35 } },
    { id: "evt_010", timestamp: "2026-04-23T12:01:55Z", label: "helicopter", confidence: 0.6, bbox: { x: 100, y: 70, w: 120, h: 80 } }
];

const DashboardPage: React.FC = () => {
    const url = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    // User
    const [user, setUser] = useState<UserInfo | null>(null);
    useEffect(() => {
        try {
            const raw = localStorage.getItem('user');
            if (raw) setUser(JSON.parse(raw));
        } catch { /* ignore */ }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('selected_device');
        navigate('/login', { replace: true });
    };

    // Devices
    const { devices, createDevice } = useDevices();
    console.log(`devices: ${JSON.stringify(devices)}`);
    //const devices: any[] = [];
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Restore selected device from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem('selected_device');
            if (raw) setSelectedDevice(JSON.parse(raw));
        } catch { /* ignore */ }
    }, []);

    // Auto-select first online device if none selected
    useEffect(() => {
        if (!selectedDevice && devices.length > 0) {
            const firstOnline = devices.find(d => d.status === 'online');
            if(!!firstOnline) {
                setSelectedDevice(firstOnline);
                localStorage.setItem('selected_device', JSON.stringify(firstOnline));
            }
        } else if (devices.length === 0) {
            setSelectedDevice(null);
            localStorage.removeItem('selected_device');
        }
    }, [devices, selectedDevice]);

    console.log(`Selected device: ${JSON.stringify(selectedDevice)}`);

    const handleSelectDevice = (device: Device) => {
        setSelectedDevice(device);
        localStorage.setItem('selected_device', JSON.stringify(device));
    };

    //WebRTC — signalingUrl thay đổi theo device được chọn
    const signalingUrl = selectedDevice
        ? `${url}/signaling?deviceId=${selectedDevice.id}`
        : `${url}/signaling`;

    console.log(`Signaling URL: ${signalingUrl}`);

    //const signalingUrl = `${url}/signaling`;

    const { stream, status, connect, disconnect } = useWebRTC({
        signalingUrl,
        autoConnect: !!selectedDevice,
    });

    const isConnected = status === 'live';

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
            <Header isConnected={isConnected} />

            {/* Sub-bar: device selector + user menu */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/60 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                    <DeviceSelector
                        devices={devices}
                        selected={selectedDevice}
                        onSelect={handleSelectDevice}
                        onAddNew={() => setShowCreateModal(true)}
                    />
                    {/* Manage devices link */}
                    <button
                        onClick={() => navigate('/devices')}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Quản lý thiết bị →
                    </button>
                </div>

                {user && <UserMenu user={user} onLogout={handleLogout} />}
            </div>

            <main className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
                <section className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
                    <VideoPanel stream={stream} status={status} />
                    <VideoControls onConnect={connect} onDisconnect={disconnect} />
                </section>
                <section className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-hidden">
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard icon={<Plane size={16} />} label={'DRONES'} value={'02'} />
                        <StatCard icon={<Cpu size={16} />} label={'FPS'} value={'28.5'} />
                    </div>
                    <DetectionLog detections={fakeDetections} />
                </section>
            </main>

            {/* {showCreateModal && (
                <CreateDeviceModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={createDevice}
                />
            )} */}
        </div>
    );
};

export default DashboardPage;