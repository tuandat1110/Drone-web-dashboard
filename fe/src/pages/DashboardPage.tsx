import React, { useState, useEffect } from 'react';
import { Cpu, Plane } from 'lucide-react';
import Header from '../components/layouts/Header';
import VideoPanel from '../components/videos/VideoPanel';
import VideoControls from '../components/videos/VideoControl';
import DetectionLog from '../components/detections/DetectionLog';
import StatCard from '../components/stats/StatCard';
import type { DetectionEvent } from '../types';
import { useWebRTC } from '../hooks/useWebRTC';
import UserMenu from '../components/menu/UserMenu';

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
    const { stream, status, connect, disconnect } = useWebRTC({
        signalingUrl: url + '/signaling',
        autoConnect: true,
    });

    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('user');
            if (raw) setUser(JSON.parse(raw));
        } catch {
            // ignore malformed data
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        // Redirect to login — adjust path to match your router setup
        window.location.href = '/login';
    };

    const isConnected = status === 'live';

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
            {/* Pass user + logout into Header, or render inline — choose one approach */}
            <Header isConnected={isConnected} />

            {/* If your Header doesn't accept these props yet, render a secondary bar here */}
            {user && (
                <div className="flex justify-end items-center px-4 py-1.5 bg-slate-900/60 border-b border-slate-800">
                    <UserMenu user={user} onLogout={handleLogout} />
                </div>
            )}

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
        </div>
    );
};

export default DashboardPage;