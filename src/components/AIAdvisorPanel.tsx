import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTax } from '../store/TaxContext';
import { getAIAdvisorInsights, AIInsight } from '../lib/geminiService';
import {
    Sparkles,
    BrainCircuit,
    ShieldAlert,
    Zap,
    TrendingUp,
    Lightbulb,
    HeartPulse,
    CheckCircle2,
    AlertTriangle,
    Info,
    RefreshCw,
} from 'lucide-react';

const formatINR = (value: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);

// ── InsightCard component ──────────────────────────────────────────────────

interface InsightCardProps {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
    color?: 'indigo' | 'emerald' | 'purple' | 'amber' | 'blue' | 'red';
    delay?: number;
}

function InsightCard({ icon: Icon, title, children, color = 'indigo', delay = 0 }: InsightCardProps) {
    const colorCls: Record<string, string> = {
        indigo: 'bg-indigo-900/20 border-indigo-500/20 hover:border-indigo-500/40',
        emerald: 'bg-emerald-900/20 border-emerald-500/20 hover:border-emerald-500/40',
        purple: 'bg-purple-900/20 border-purple-500/20 hover:border-purple-500/40',
        amber: 'bg-amber-900/20 border-amber-500/20 hover:border-amber-500/40',
        blue: 'bg-blue-900/20 border-blue-500/20 hover:border-blue-500/40',
        red: 'bg-red-900/20 border-red-500/20 hover:border-red-500/40',
    };
    const iconCls: Record<string, string> = {
        indigo: 'bg-indigo-500/20 text-indigo-400',
        emerald: 'bg-emerald-500/20 text-emerald-400',
        purple: 'bg-purple-500/20 text-purple-400',
        amber: 'bg-amber-500/20 text-amber-400',
        blue: 'bg-blue-500/20 text-blue-400',
        red: 'bg-red-500/20 text-red-400',
    };
    const textCls: Record<string, string> = {
        indigo: 'text-indigo-200',
        emerald: 'text-emerald-200',
        purple: 'text-purple-200',
        amber: 'text-amber-200',
        blue: 'text-blue-200',
        red: 'text-red-200',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className={`border rounded-2xl p-4 relative overflow-hidden group transition-colors ${colorCls[color]}`}
        >
            <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconCls[color]}`}>
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <h4 className={`font-semibold text-sm ${textCls[color]}`}>{title}</h4>
            </div>
            <div className={`text-xs leading-relaxed ${textCls[color]} opacity-80`}>
                {children}
            </div>
        </motion.div>
    );
}

// ── Icon map for Gemini-returned color strings ─────────────────────────────

const colorIconMap: Record<string, React.ElementType> = {
    indigo: Zap,
    emerald: CheckCircle2,
    purple: ShieldAlert,
    amber: AlertTriangle,
    blue: HeartPulse,
    red: AlertTriangle,
};

// ── Fallback template insights (no API key) ────────────────────────────────

function FallbackInsights() {
    const { state } = useTax();
    const { userDetails, income, deductions, results } = state;

    const userName = userDetails.name || 'Friend';
    const totalIncome = (income.grossSalary || 0) + (income.freelanceIncome || 0);
    const isNewRegimeBetter = results.recommendation === 'NEW_REGIME';
    const isOldRegimeBetter = results.recommendation === 'OLD_REGIME';
    const actual80C = deductions.section80C || 0;
    const actual80D = deductions.section80D || 0;
    const unutilized80C = Math.max(0, 150000 - actual80C);
    const has80D = actual80D > 0;
    const hasHRA = (deductions.hraExemption || 0) > 0;
    const effectiveRateNew = totalIncome > 0 ? (results.newRegimeTax / totalIncome) * 100 : 0;
    const effectiveRateOld = totalIncome > 0 ? (results.oldRegimeTax / totalIncome) * 100 : 0;

    return (
        <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-3">
            <p className="text-slate-200 text-sm font-medium">
                Hi <span className="text-indigo-300 font-semibold">{userName}</span>, here's my analysis:
            </p>

            {totalIncome === 0 && (
                <InsightCard icon={Info} title="Enter Your Data" color="blue" delay={0.05}>
                    Head to the Tax Profile Setup to enter your income and deductions. I'll generate personalized insights here once you do!
                </InsightCard>
            )}
            {totalIncome > 0 && (
                <InsightCard icon={Zap} title="Regime Strategy" color={isNewRegimeBetter ? 'indigo' : 'emerald'} delay={0.05}>
                    {results.recommendation === 'EQUAL'
                        ? 'Both regimes result in identical tax. Choose New Regime — it requires less documentation.'
                        : isNewRegimeBetter
                            ? <>Your deductions ({formatINR(actual80C + (deductions.section80D || 0) + (deductions.hraExemption || 0))}) aren't enough to offset the New Regime's lower slabs. <span className="text-indigo-300 font-semibold">New Regime saves you {formatINR(results.taxSaved)}</span>.</>
                            : <>Your combined deductions of {formatINR(actual80C + (deductions.section80D || 0) + (deductions.hraExemption || 0))} are protecting your income. <span className="text-emerald-300 font-semibold">Old Regime saves you {formatINR(results.taxSaved)}</span>.</>
                    }
                </InsightCard>
            )}
            {totalIncome > 0 && unutilized80C > 0 && (
                <InsightCard icon={ShieldAlert} title="Unutilized 80C Limit" color="purple" delay={0.1}>
                    You've claimed only <span className="text-purple-300 font-semibold">{formatINR(actual80C)}</span> of the ₹1,50,000 limit.{' '}
                    Investing another <span className="text-emerald-400 font-bold">{formatINR(unutilized80C)}</span> in ELSS, PPF, or LIC before March 31 could help.
                </InsightCard>
            )}
            {totalIncome > 0 && unutilized80C <= 0 && (
                <InsightCard icon={CheckCircle2} title="80C: Fully Utilized!" color="emerald" delay={0.1}>
                    Excellent! You've maxed your Section 80C limit. Consider Section 80CCD(1B) — an additional ₹50,000 deduction for NPS contributions.
                </InsightCard>
            )}
            {totalIncome > 0 && !has80D && (
                <InsightCard icon={HeartPulse} title="Missing 80D Deduction" color="blue" delay={0.15}>
                    You haven't declared health insurance premiums. You can claim up to <span className="text-blue-300 font-semibold">₹1,00,000</span> under Section 80D.
                </InsightCard>
            )}
            {totalIncome > 0 && !hasHRA && isOldRegimeBetter && (
                <InsightCard icon={AlertTriangle} title="HRA Exemption Not Claimed" color="amber" delay={0.2}>
                    If you pay rent, you may be eligible for HRA exemption which could further reduce your taxable income.
                </InsightCard>
            )}
            {totalIncome > 0 && (
                <InsightCard icon={TrendingUp} title="Effective Rate Analysis" color="indigo" delay={0.2}>
                    Your effective tax rates are <span className="text-indigo-300 font-semibold">{effectiveRateOld.toFixed(1)}% (Old)</span> vs <span className="text-indigo-300 font-semibold">{effectiveRateNew.toFixed(1)}% (New)</span> of gross income.{' '}
                    {effectiveRateNew < 15 ? 'That\'s a healthy rate.' : effectiveRateNew < 25 ? 'Mid-high range — good deduction planning is key.' : 'Your rate is high. Maximise all available deductions.'}
                </InsightCard>
            )}
            {totalIncome > 0 && (income.freelanceIncome || 0) > 0 && (
                <InsightCard icon={Lightbulb} title="Freelance Income Tip" color="amber" delay={0.25}>
                    Your freelance income of <span className="text-amber-300 font-semibold">{formatINR(income.freelanceIncome)}</span> is taxed as "Income from Other Sources." Consider claiming business expenses as deductions.
                </InsightCard>
            )}
        </motion.div>
    );
}

// ── Main Panel ─────────────────────────────────────────────────────────────

export function AIAdvisorPanel() {
    const { state } = useTax();
    const [isThinking, setIsThinking] = useState(true);
    const [geminiInsights, setGeminiInsights] = useState<AIInsight[] | null>(null);
    const [isGeminiActive, setIsGeminiActive] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { income, deductions } = state;

    const fetchInsights = useCallback(async (showRefresh = false) => {
        if (showRefresh) setIsRefreshing(true);
        setIsThinking(true);

        const insights = await getAIAdvisorInsights(state);
        setGeminiInsights(insights);
        setIsGeminiActive(insights !== null && insights.length > 0);
        setIsThinking(false);
        setIsRefreshing(false);
    }, [state]);

    // Re-fetch when income/deductions change (with debounce)
    useEffect(() => {
        const timer = setTimeout(() => fetchInsights(), 1800);
        return () => clearTimeout(timer);
    }, [income.grossSalary, income.freelanceIncome, deductions.section80C, deductions.section80D, deductions.hraExemption]);

    // No longer need localStorage key listeners — key now lives server-side

    return (
        <aside className="flex flex-col h-full bg-indigo-950/20 backdrop-blur-xl border-l border-indigo-500/20 relative">
            {/* Glossy top edge */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-indigo-500/0 via-indigo-400/50 to-indigo-500/0" />

            {/* Header */}
            <div className="p-5 border-b border-indigo-500/10 flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 relative shrink-0">
                    <BrainCircuit className="w-4 h-4 text-white" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
                </div>
                <div className="flex-1">
                    <h2 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-amber-400">Tax Wizard AI</h2>
                    <p className="text-xs text-slate-500">{isGeminiActive ? 'Powered by Gemini' : 'Live Analysis'}</p>
                </div>
                {/* Refresh button — always show since key is server-side */}
                {!isThinking && (
                    <button
                        onClick={() => fetchInsights(true)}
                        disabled={isRefreshing}
                        className="p-1.5 rounded-lg text-indigo-400/60 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                        title="Re-generate insights"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
                <AnimatePresence mode="wait">
                    {isThinking ? (
                        <motion.div
                            key="thinking"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, filter: 'blur(4px)' }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center justify-center text-center py-12 space-y-5"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    className="absolute inset-0 bg-indigo-500/30 blur-[35px] rounded-full"
                                />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                    className="w-16 h-16 rounded-full border-2 border-dashed border-indigo-500/50 flex items-center justify-center relative z-10 bg-slate-900/50"
                                >
                                    <Sparkles className="w-6 h-6 text-indigo-400" />
                                </motion.div>
                            </div>
                            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                <p className="text-indigo-300 font-medium text-sm">
                                    Asking Gemini AI...
                                </p>
                                <p className="text-indigo-400/50 text-xs mt-1">
                                    Generating personalized advice
                                </p>
                            </motion.div>
                        </motion.div>
                    ) : isGeminiActive && geminiInsights ? (
                        // ── GEMINI LIVE INSIGHTS ──
                        <motion.div key="gemini" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-3">
                            <div className="flex items-center gap-2 text-xs text-indigo-400/70 mb-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Gemini AI analysis for {state.userDetails.name || 'you'}</span>
                            </div>
                            {geminiInsights.map((insight, i) => {
                                const IconComponent = colorIconMap[insight.color] ?? Zap;
                                return (
                                    <InsightCard
                                        key={i}
                                        icon={IconComponent}
                                        title={insight.title}
                                        color={insight.color as 'indigo' | 'emerald' | 'purple' | 'amber' | 'blue' | 'red'}
                                        delay={i * 0.08}
                                    >
                                        {insight.body}
                                    </InsightCard>
                                );
                            })}
                        </motion.div>
                    ) : !isGeminiActive ? (
                        // ── Server key not set or call failed → show template fallback ──
                        <motion.div key="nokey" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                            <FallbackInsights />
                        </motion.div>
                    ) : null}

                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 flex justify-center border-t border-indigo-500/10 shrink-0">
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-500/50" />
                    {isGeminiActive ? 'Powered by Gemini AI' : 'Powered by Tax Wizard AI'}
                </p>
            </div>
        </aside>
    );
}
