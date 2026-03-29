import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTax } from '../store/TaxContext';
import { useAuth } from '../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    IndianRupee,
    TrendingDown,
    Zap,
    Award,
    X,
    Wallet,
    Calculator,
    Percent,
    Menu,
    Wand2,
    PiggyBank,
    ShieldCheck,
    AlertTriangle,
    Clock,
    CalendarDays,
    HeartPulse,
    Building,
    Briefcase,
    ChevronRight,
    TrendingUp,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { AIAdvisorPanel } from './AIAdvisorPanel';

// --- Formatters ---
const formatINR = (value: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);

const formatINRShort = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
};

// --- Investment Suggestions Data ---
interface InvestmentOption {
    name: string;
    section: string;
    maxLimit: string;
    risk: 'Low' | 'Medium' | 'High';
    liquidity: 'Low' | 'Medium' | 'High';
    lockIn: string;
    returns: string;
    icon: React.ElementType;
    color: string;
}

const investmentOptions: InvestmentOption[] = [
    { name: 'ELSS Mutual Funds', section: '80C', maxLimit: '₹1.5L', risk: 'High', liquidity: 'Medium', lockIn: '3 years', returns: '12-15%', icon: TrendingUp, color: 'emerald' },
    { name: 'PPF (Public Provident Fund)', section: '80C', maxLimit: '₹1.5L', risk: 'Low', liquidity: 'Low', lockIn: '15 years', returns: '7.1%', icon: ShieldCheck, color: 'blue' },
    { name: 'NPS (National Pension)', section: '80CCD(1B)', maxLimit: '₹50K extra', risk: 'Medium', liquidity: 'Low', lockIn: '60 years', returns: '9-12%', icon: Briefcase, color: 'violet' },
    { name: 'Health Insurance', section: '80D', maxLimit: '₹25K-₹1L', risk: 'Low', liquidity: 'High', lockIn: '1 year', returns: 'N/A', icon: HeartPulse, color: 'rose' },
    { name: 'Home Loan Principal', section: '80C', maxLimit: '₹1.5L', risk: 'Low', liquidity: 'Low', lockIn: 'Loan tenure', returns: 'N/A', icon: Building, color: 'amber' },
    { name: 'Term Life Insurance', section: '80C', maxLimit: '₹1.5L', risk: 'Low', liquidity: 'Low', lockIn: 'Policy term', returns: 'N/A', icon: ShieldCheck, color: 'teal' },
];

// --- Tax Deadlines ---
const deadlines = [
    { date: 'Jul 31, 2024', label: 'ITR Filing Deadline', urgent: true },
    { date: 'Mar 31, 2024', label: 'Tax-Saving Investment Deadline', urgent: false },
    { date: 'Jun 15, 2024', label: 'Advance Tax Installment 1', urgent: false },
    { date: 'Sep 15, 2024', label: 'Advance Tax Installment 2', urgent: false },
];

// --- Sidebar ---
function Sidebar({ onClose }: { onClose?: () => void }) {
    const navigate = useNavigate();
    const { dispatch } = useTax();
    const { logout } = useAuth();

    const navItems = [
        { name: 'Overview', icon: LayoutDashboard, active: true, onClick: () => { } },
        { name: 'Documents', icon: FileText, active: false, onClick: () => { } },
        { name: 'Investments', icon: PiggyBank, active: false, onClick: () => { } },
        { name: 'Settings', icon: Settings, active: false, onClick: () => navigate('/settings') },
    ];

    const handleLogout = () => {
        dispatch({ type: 'RESET_STATE' });
        logout();
        navigate('/');
    };

    return (
        <aside className="flex flex-col h-full pt-6 pb-6 px-4 bg-[#0c0c14]/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-2 mb-10">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center shadow-glow-sm">
                        <Wand2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">Tax Wizard</span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-slate-500 hover:text-white p-1 transition-colors"> <X className="w-5 h-5" /></button>
                )}
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={item.onClick}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${item.active
                            ? 'bg-violet-500/10 text-violet-400 font-medium border border-violet-500/10'
                            : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </button>
                ))}
            </nav>

            {/* Tax tip card */}
            <div className="rounded-2xl bg-gradient-to-br from-violet-600/10 to-amber-600/5 border border-violet-500/10 p-4 mx-1 mb-3">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">Pro Tip</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                    Invest in ELSS before March 31 to claim 80C deductions and potentially earn 12-15% returns.
                </p>
            </div>

            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full text-left text-sm"
            >
                <LogOut className="w-5 h-5" />
                Log out
            </button>
        </aside>
    );
}

// --- Stat Card ---
function StatCard({ title, value, sub, icon: Icon, color, delay = 0 }: {
    title: string;
    value: string;
    sub?: string;
    icon: React.ElementType;
    color: string;
    delay?: number;
}) {
    const colorMap: Record<string, string> = {
        violet: 'bg-violet-500/10 text-violet-400 border-violet-500/10',
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/10',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/10',
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/10',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className={`relative p-5 rounded-2xl border ${colorMap[color] || colorMap.violet} backdrop-blur-md overflow-hidden group hover:-translate-y-1 transition-transform duration-300 glass-subtle`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-xl font-bold text-white leading-tight">{value}</h3>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </motion.div>
    );
}

// --- Risk Badge ---
function RiskBadge({ risk }: { risk: string }) {
    const colors: Record<string, string> = {
        Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        High: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[risk] || colors.Low}`}>
            {risk}
        </span>
    );
}

// --- Sparkles icon import for the sidebar pro tip ---
import { Sparkles } from 'lucide-react';

// --- Main Dashboard ---
export function Dashboard() {
    const { state, loadFromServer } = useTax();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [riskFilter, setRiskFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');

    // Load latest data from server when dashboard mounts
    useEffect(() => { loadFromServer(); }, []);

    const { income, deductions, results, userDetails } = state;

    const totalIncome = (income.grossSalary || 0) + (income.freelanceIncome || 0);
    const totalOldDeductions =
        Math.min(deductions.section80C || 0, 150000) +
        (deductions.section80D || 0) +
        (deductions.hraExemption || 0) +
        (deductions.standardDeduction || 50000);




    const effectiveRateOld = totalIncome > 0 ? ((results.oldRegimeTax / totalIncome) * 100).toFixed(1) : '0.0';
    const effectiveRateNew = totalIncome > 0 ? ((results.newRegimeTax / totalIncome) * 100).toFixed(1) : '0.0';

    const recText =
        results.recommendation === 'EQUAL'
            ? 'Both Equal'
            : results.recommendation === 'NEW_REGIME'
                ? 'New Regime'
                : 'Old Regime';

    const optimizationScore = useMemo(() => {
        if (totalIncome === 0) return 0;
        const normalized = Math.min(100, Math.round((results.taxSaved / (totalIncome * 0.3 + 1)) * 100 + 60));
        return Math.min(99, Math.max(40, normalized));
    }, [results, totalIncome]);

    const chartData = useMemo(() => [
        {
            name: 'Old Regime',
            tax: results.oldRegimeTax,
            fill: results.recommendation === 'NEW_REGIME' ? '#f87171' : '#10b981',
        },
        {
            name: 'New Regime',
            tax: results.newRegimeTax,
            fill: results.recommendation === 'OLD_REGIME' ? '#f87171' : '#10b981',
        },
    ], [results]);

    const hasData = totalIncome > 0;

    // Missing deductions computed
    const missingDeductions = useMemo(() => {
        const items: { label: string; section: string; potential: number; color: string }[] = [];
        const actual80C = deductions.section80C || 0;
        if (actual80C < 150000) items.push({ label: '80C gap (invest more)', section: '80C', potential: 150000 - actual80C, color: 'emerald' });
        if (!(deductions.section80D > 0)) items.push({ label: 'Health Insurance', section: '80D', potential: 25000, color: 'blue' });
        if (!(deductions.hraExemption > 0) && results.recommendation === 'OLD_REGIME') items.push({ label: 'HRA Exemption', section: '10(13A)', potential: 100000, color: 'orange' });
        items.push({ label: 'NPS Contribution', section: '80CCD(1B)', potential: 50000, color: 'violet' });
        return items;
    }, [deductions, results]);

    const filteredInvestments = riskFilter === 'All' ? investmentOptions : investmentOptions.filter(x => x.risk === riskFilter);

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-50 flex">

            {/* Desktop Sidebar */}
            <aside className="w-60 border-r border-white/[0.04] h-screen fixed left-0 top-0 hidden md:block">
                <Sidebar />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-64 border-r border-white/[0.04]">
                        <Sidebar onClose={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 md:ml-60 min-h-screen flex flex-col lg:flex-row">

                {/* Center Canvas */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">

                    {/* Top Bar */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2 rounded-lg bg-white/[0.03] text-slate-400 hover:text-white transition-colors border border-white/[0.06]"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                    {userDetails.name ? `${userDetails.name}'s Dashboard` : 'Tax Dashboard'}
                                </h1>
                                <p className="text-slate-500 text-sm mt-0.5">FY 2023-24 · AY 2024-25</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowReport(r => !r)}
                            className="hidden sm:flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-all border border-white/[0.06]"
                        >
                            <FileText className="w-4 h-4" />
                            Export
                        </button>
                    </div>

                    {/* Empty state */}
                    {!hasData && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card rounded-3xl p-12 text-center"
                        >
                            <div className="w-20 h-20 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-violet-500/10">
                                <Calculator className="w-10 h-10 text-violet-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">No data entered yet</h3>
                            <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">Complete the tax profile setup to see your personalized tax analysis, regime comparison, and investment suggestions.</p>
                            <button
                                onClick={() => navigate('/ingest')}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-3.5 rounded-2xl font-semibold hover:scale-[1.02] transition-all shadow-glow"
                            >
                                <Wand2 className="w-4 h-4" /> Start Tax Profile
                            </button>
                        </motion.div>
                    )}

                    {hasData && (
                        <>
                            {/* Recommendation Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${results.recommendation === 'NEW_REGIME'
                                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                    : results.recommendation === 'OLD_REGIME'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    }`}
                            >
                                <Zap className="w-4 h-4" />
                                Recommended: {recText} · Save {formatINR(results.taxSaved)}
                            </motion.div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <StatCard title="Total Income" value={formatINRShort(totalIncome)} sub={`${formatINR(totalIncome)}`} icon={Wallet} color="blue" delay={0} />
                                <StatCard title="Estimated Tax" value={formatINRShort(results.recommendation === 'OLD_REGIME' ? results.oldRegimeTax : results.newRegimeTax)} sub={`${recText}`} icon={IndianRupee} color="violet" delay={0.05} />
                                <StatCard title="Tax Saved" value={`+${formatINRShort(results.taxSaved)}`} sub="vs other regime" icon={TrendingDown} color="emerald" delay={0.1} />
                                <StatCard title="Effective Rate" value={`${results.recommendation === 'OLD_REGIME' ? effectiveRateOld : effectiveRateNew}%`} sub="of gross income" icon={Percent} color="purple" delay={0.15} />
                            </div>

                            {/* Savings Banner */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/15 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px]" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 bg-emerald-500/15 rounded-2xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                                        <Award className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-lg">
                                            Optimal: <span className="text-emerald-400">{recText}</span>
                                        </h4>
                                        <p className="text-emerald-200/60 text-sm mt-0.5">
                                            Save <span className="text-emerald-400 font-bold">{formatINR(results.taxSaved)}</span> vs the {results.recommendation === 'NEW_REGIME' ? 'Old' : 'New'} Regime
                                        </p>
                                    </div>
                                </div>
                                <div className="relative z-10 text-right hidden sm:block shrink-0 bg-emerald-500/10 rounded-2xl px-5 py-3 border border-emerald-500/10">
                                    <p className="text-xs text-emerald-400/60 uppercase tracking-wider font-medium">Score</p>
                                    <p className="text-3xl font-bold text-emerald-400">{optimizationScore}%</p>
                                </div>
                            </motion.div>

                            {/* Chart + Breakdowns */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {/* Chart */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="glass-card rounded-3xl p-6"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h2 className="text-base font-semibold text-white">Regime Comparison</h2>
                                            <p className="text-xs text-slate-500 mt-0.5">Tax liability · FY 2023-24</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-medium">
                                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />Better</div>
                                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-400" />Worse</div>
                                        </div>
                                    </div>
                                    <div className="h-[240px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 15, right: 10, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => formatINRShort(val)} dx={-5} />
                                                <Tooltip cursor={{ fill: 'rgba(99,102,241,0.05)' }} contentStyle={{ backgroundColor: '#0f0f1a', borderColor: '#1e1e30', borderRadius: '12px', color: '#fff', fontSize: 13 }} formatter={(value: number) => [formatINR(value), 'Tax']} />
                                                <Bar dataKey="tax" radius={[8, 8, 0, 0]} maxBarSize={80}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Rate row */}
                                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/[0.04]">
                                        <div className={`text-center p-3 rounded-xl ${results.recommendation === 'OLD_REGIME' ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-white/[0.02]'}`}>
                                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Old Regime</p>
                                            <p className="text-xl font-bold text-slate-200">{effectiveRateOld}%</p>
                                            <p className="text-xs text-slate-500 font-semibold mt-0.5">{formatINR(results.oldRegimeTax)}</p>
                                        </div>
                                        <div className={`text-center p-3 rounded-xl ${results.recommendation === 'NEW_REGIME' ? 'bg-violet-500/5 border border-violet-500/10' : 'bg-white/[0.02]'}`}>
                                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">New Regime</p>
                                            <p className="text-xl font-bold text-slate-200">{effectiveRateNew}%</p>
                                            <p className="text-xs text-slate-500 font-semibold mt-0.5">{formatINR(results.newRegimeTax)}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Missing Deductions + Deadlines */}
                                <div className="space-y-5">
                                    {/* Missing Deductions */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.35 }}
                                        className="glass-card rounded-3xl p-6"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                                            <h3 className="text-sm font-semibold text-white">Missing Deductions</h3>
                                            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 ml-auto">{missingDeductions.length} found</span>
                                        </div>
                                        <div className="space-y-2.5">
                                            {missingDeductions.map((d, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors group cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full bg-${d.color}-500`} />
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-200">{d.label}</p>
                                                            <p className="text-xs text-slate-500">Section {d.section}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-emerald-400">+{formatINRShort(d.potential)}</span>
                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Tax Calendar */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="glass-card rounded-3xl p-6"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <CalendarDays className="w-4 h-4 text-violet-400" />
                                            <h3 className="text-sm font-semibold text-white">Tax Calendar</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {deadlines.map((d, i) => (
                                                <div key={i} className="flex items-center justify-between py-2">
                                                    <div className="flex items-center gap-3">
                                                        <Clock className={`w-3.5 h-3.5 ${d.urgent ? 'text-red-400' : 'text-slate-500'}`} />
                                                        <span className="text-sm text-slate-300">{d.label}</span>
                                                    </div>
                                                    <span className={`text-xs font-semibold ${d.urgent ? 'text-red-400' : 'text-slate-500'}`}>{d.date}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* ─── INVESTMENT SUGGESTIONS ─── */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                                className="glass-card rounded-3xl p-6"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                                    <div className="flex items-center gap-2">
                                        <PiggyBank className="w-5 h-5 text-amber-400" />
                                        <h2 className="text-base font-semibold text-white">Tax-Saving Investments</h2>
                                        <span className="text-[10px] font-bold bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/20">Ranked by profile</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {(['All', 'Low', 'Medium', 'High'] as const).map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setRiskFilter(r)}
                                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${riskFilter === r ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20' : 'text-slate-500 hover:text-slate-300 border border-transparent hover:bg-white/[0.03]'}`}
                                            >
                                                {r} Risk
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredInvestments.map((inv, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group cursor-pointer">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`w-9 h-9 rounded-xl bg-${inv.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                    <inv.icon className={`w-4 h-4 text-${inv.color}-400`} />
                                                </div>
                                                <RiskBadge risk={inv.risk} />
                                            </div>
                                            <h4 className="text-sm font-semibold text-white mb-1">{inv.name}</h4>
                                            <p className="text-xs text-slate-500 mb-3">Section {inv.section} · Limit {inv.maxLimit}</p>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500">Lock-in: <span className="text-slate-300">{inv.lockIn}</span></span>
                                                <span className="text-slate-500">Returns: <span className="text-emerald-400 font-semibold">{inv.returns}</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Income + Deduction Breakdown */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="glass-card rounded-2xl p-5"
                                >
                                    <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-blue-400" /> Income Breakdown
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Gross Salary', value: income.grossSalary, color: 'blue' },
                                            { label: 'Freelance / Other', value: income.freelanceIncome, color: 'purple' },
                                        ].map(item => (
                                            <div key={item.label}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-slate-400">{item.label}</span>
                                                    <span className="text-white font-semibold">{formatINR(item.value)}</span>
                                                </div>
                                                {totalIncome > 0 && (
                                                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full bg-${item.color}-500`} style={{ width: `${(item.value / totalIncome) * 100}%` }} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <div className="border-t border-white/[0.04] pt-3 flex justify-between text-sm font-bold">
                                            <span className="text-slate-300">Total</span>
                                            <span className="text-white">{formatINR(totalIncome)}</span>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.55 }}
                                    className="glass-card rounded-2xl p-5"
                                >
                                    <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                        <TrendingDown className="w-4 h-4 text-emerald-400" /> Old Regime Deductions
                                    </h3>
                                    <div className="space-y-2.5">
                                        {[
                                            { label: 'Standard (₹50K)', value: 50000, color: 'bg-slate-500' },
                                            { label: 'Sec 80C', value: Math.min(deductions.section80C || 0, 150000), color: 'bg-emerald-500' },
                                            { label: 'Sec 80D', value: deductions.section80D || 0, color: 'bg-blue-500' },
                                            { label: 'HRA Exemption', value: deductions.hraExemption || 0, color: 'bg-orange-500' },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center justify-between text-sm gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                                                    <span className="text-slate-400">{item.label}</span>
                                                </div>
                                                <span className="text-white font-semibold">{formatINR(item.value)}</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-white/[0.04] pt-2 flex justify-between text-sm font-bold">
                                            <span className="text-slate-300">Total</span>
                                            <span className="text-emerald-400">{formatINR(totalOldDeductions)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Panel: AI Insights */}
                {hasData && (
                    <div className="lg:w-[320px] xl:w-[360px] shrink-0">
                        <div className="lg:sticky lg:top-0 lg:h-screen">
                            <AIAdvisorPanel />
                        </div>
                    </div>
                )}
            </main>

            {/* Export Report Modal */}
            {showReport && hasData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowReport(false)} />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full z-10"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Tax Report Summary</h2>
                            <button onClick={() => setShowReport(false)} className="text-slate-500 hover:text-white transition-colors p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="bg-white/[0.03] rounded-xl p-4 space-y-2 border border-white/[0.04]">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Taxpayer</p>
                                <p className="text-white font-semibold">{userDetails.name || 'Not specified'}</p>
                                {userDetails.email && <p className="text-slate-400">{userDetails.email}</p>}
                            </div>
                            <div className="bg-white/[0.03] rounded-xl p-4 space-y-2 border border-white/[0.04]">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tax Comparison</p>
                                <div className="flex justify-between"><span className="text-slate-400">Old Regime</span><span className="text-red-400 font-semibold">{formatINR(results.oldRegimeTax)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">New Regime</span><span className="text-violet-400 font-semibold">{formatINR(results.newRegimeTax)}</span></div>
                                <div className="flex justify-between font-bold border-t border-white/[0.04] pt-2 mt-2"><span className="text-emerald-400">You Save</span><span className="text-emerald-400">{formatINR(results.taxSaved)}</span></div>
                            </div>
                            <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-4 text-center">
                                <p className="text-violet-300 font-semibold">Recommended Regime</p>
                                <p className="text-2xl font-bold text-white mt-1">{recText}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowReport(false)}
                            className="w-full mt-5 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.01] transition-transform shadow-glow"
                        >
                            Close Report
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
