// src/hooks/useDevices.ts
import { useState, useEffect, useCallback } from 'react';
import type { Device, DeviceWithKey } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
    return localStorage.getItem('access_token');
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
    };
}

export function useDevices() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDevices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/devices`, { headers: authHeaders() });
            const data = await res.json();
            console.log(`data: ${JSON.stringify(data)}`);
            if (!res.ok) throw new Error(data.message || 'Lỗi tải danh sách thiết bị');
            setDevices(data.data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    const createDevice = async (
        device_name: string,
        description?: string
    ): Promise<DeviceWithKey> => {
        const res = await fetch(`${API_URL}/devices`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ device_name, description }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Tạo thiết bị thất bại');
        await fetchDevices(); // refresh list
        return data.data;
    };

    const deleteDevice = async (id: number) => {
        const res = await fetch(`${API_URL}/devices/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error('Xóa thiết bị thất bại');
        setDevices((prev) => prev.filter((d) => d.id !== id));
    };

    return { devices, loading, error, fetchDevices, createDevice, deleteDevice };
}