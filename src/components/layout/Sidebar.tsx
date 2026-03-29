
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings as SettingsIcon, Wand2, LogOut, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTax } from '../../store/TaxContext';

export function Sidebar() {
    const navigate = useNavigate();
    const { dispatch } = useTax();

    const links = [
        { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { name: 'Ingest Data', to: '/ingest', icon: FileText },
        { name: 'Settings', to: '/settings', icon: SettingsIcon },
    ];

    const handleLogout = () => {
        dispatch({ type: 'RESET_STATE' });
        navigate('/');
    };

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-60 bg-[#0c0c14]/80 backdrop-blur-xl flex flex-col z-40 pt-6 border-r border-white/[0.04]">
            <div className="flex items-center gap-2.5 px-5 mb-10 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center shadow-glow-sm">
                    <Wand2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-white tracking-tight">Tax Wizard</span>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                            isActive
                                ? "bg-violet-500/10 text-violet-400 border border-violet-500/10"
                                : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                        )}
                    >
                        <link.icon className="w-5 h-5" />
                        {link.name}
                    </NavLink>
                ))}
            </nav>

            {/* Pro tip card */}
            <div className="mx-3 mb-3 p-4 rounded-2xl bg-gradient-to-br from-violet-600/10 to-amber-600/5 border border-violet-500/10">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">AI Active</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                    Monitoring your tax profile for optimization opportunities.
                </p>
            </div>

            <div className="px-3 mb-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full text-left text-sm"
                >
                    <LogOut className="w-5 h-5" />
                    Log out
                </button>
            </div>
        </aside>
    );
}
