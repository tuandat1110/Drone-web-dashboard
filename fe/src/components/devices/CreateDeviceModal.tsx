// src/components/devices/CreateDeviceModal.tsx
import React, { useState } from 'react';
import { X, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react';
import type { DeviceWithKey } from '../../types';

interface Props {
    onClose: () => void;
    onCreate: (name: string, description?: string) => Promise<DeviceWithKey>;
}

type Step = 'form' | 'key';

const CreateDeviceModal: React.FC<Props> = ({ onClose, onCreate }) => {
    const [step, setStep] = useState<Step>('form');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdDevice, setCreatedDevice] = useState<DeviceWithKey | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) { setError('Vui lòng nhập tên thiết bị'); return; }
        setLoading(true);
        setError('');
        try {
            const device = await onCreate(name.trim(), description.trim() || undefined);
            setCreatedDevice(device);
            setStep('key');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!createdDevice) return;
        navigator.clipboard.writeText(createdDevice.device_key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                    <h2 className="text-base font-semibold text-slate-100">
                        {step === 'form' ? 'Thêm thiết bị mới' : 'Thiết bị đã được tạo'}
                    </h2>
                    {step === 'key' && (
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="px-6 py-5">
                    {step === 'form' ? (
                        <>
                            {error && (
                                <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                                        Tên thiết bị <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                        placeholder="VD: Jetson Cổng Chính"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                                        Mô tả vị trí
                                    </label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="VD: Camera góc Đông Bắc, tầng mái"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6 justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 border border-slate-700 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center gap-2 transition-colors"
                                >
                                    {loading && <Loader2 size={14} className="animate-spin" />}
                                    Tạo thiết bị
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Key reveal step */}
                            <p className="text-sm text-slate-400 mb-4">
                                Copy <span className="text-slate-200 font-medium">device key</span> bên dưới và thêm vào file{' '}
                                <code className="text-cyan-400 text-xs bg-slate-800 px-1.5 py-0.5 rounded">.env</code> trên Jetson Nano.
                            </p>

                            <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-500 uppercase tracking-wider">Device Key</span>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                                    >
                                        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                                        {copied ? 'Đã copy' : 'Copy'}
                                    </button>
                                </div>
                                <div className="font-mono text-lg font-semibold text-cyan-400 tracking-widest mt-1">
                                    {createdDevice?.device_key}
                                </div>
                            </div>

                            {/* Env hint */}
                            <div className="mt-3 bg-slate-800/60 rounded-lg px-4 py-3">
                                <p className="text-xs text-slate-500 mb-1">Thêm vào <code className="text-slate-400">.env</code> trên Jetson:</p>
                                <code className="text-xs text-green-400 font-mono">
                                    DEVICE_KEY={createdDevice?.device_key}
                                </code>
                            </div>

                            {/* Warning */}
                            <div className="flex items-start gap-2 mt-4 px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-300/80">
                                    Key này chỉ hiển thị <strong className="text-amber-300">một lần duy nhất</strong>. Sau khi đóng modal sẽ không thể xem lại.
                                </p>
                            </div>

                            <div className="flex justify-end mt-5">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                                >
                                    Hoàn tất
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateDeviceModal;