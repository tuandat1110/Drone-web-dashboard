import { useEffect, useRef, useState } from "react";
import type { UserInfo } from "../../pages/DashboardPage";
import { LogOut, ChevronDown, User } from "lucide-react";

const UserMenu: React.FC<{ user: UserInfo; onLogout: () => void }> = ({ user, onLogout }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition-all duration-150 text-sm"
            >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400">
                    <User size={13} />
                </span>
                <span className="text-slate-200 font-medium">{user.username}</span>
                <ChevronDown
                    size={13}
                    className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black/50 z-50 overflow-hidden">
                    {/* User info block */}
                    <div className="px-4 py-3 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                                <User size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-100 font-semibold text-sm truncate">{user.username}</p>
                                <p className="text-slate-400 text-xs truncate">{user.email}</p>
                            </div>
                        </div>
                        <div className="mt-2 px-1">
                            <span className="text-slate-600 text-xs">ID: </span>
                            <span className="text-slate-500 text-xs font-mono">{user.id}</span>
                        </div>
                    </div>

                    {/* Logout button */}
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-150"
                    >
                        <LogOut size={14} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;