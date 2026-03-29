import { Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
    const navigate = useNavigate();

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-[#0a0a0f]/80 backdrop-blur-xl z-50 flex items-center justify-between px-6 md:px-12 border-b border-white/[0.04]">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center shadow-glow-sm">
                    <Wand2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-white tracking-tight">
                    Tax Wizard
                </span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                <a href="#" className="hover:text-white transition-colors duration-200">Features</a>
                <a href="#" className="hover:text-white transition-colors duration-200">Pricing</a>
                <a href="#" className="hover:text-white transition-colors duration-200">About</a>
            </nav>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/auth')}
                    className="hidden sm:inline-flex text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2"
                >
                    Log in
                </button>
                <button
                    onClick={() => navigate('/auth')}
                    className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-2 rounded-xl hover:from-violet-500 hover:to-purple-500 shadow-glow-sm hover:shadow-glow transition-all duration-300"
                >
                    Get Started
                </button>
            </div>
        </header>
    );
}
