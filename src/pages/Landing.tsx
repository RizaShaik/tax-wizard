
import { useNavigate } from 'react-router-dom';
import { Wand2, Sparkles, Lock, Upload, Search, BarChart3, PiggyBank, ChevronRight, Shield, Zap, Star, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Navbar } from '../components/layout/Navbar';
import { useState, useEffect } from 'react';

const stats = [
    { label: 'Tax Optimized', value: '₹42Cr+', suffix: '' },
    { label: 'Users Served', value: '15K', suffix: '+' },
    { label: 'Avg Savings', value: '₹68K', suffix: '' },
    { label: 'Uptime', value: '99.9', suffix: '%' },
];

const testimonials = [
    { name: 'Priya M.', role: 'Software Engineer', text: 'Tax Wizard found ₹47,000 in deductions I was completely unaware of. The regime comparison made my decision instant.', savings: '₹47,000' },
    { name: 'Rahul K.', role: 'Freelance Designer', text: 'As a freelancer, taxes were my nightmare. Tax Wizard broke everything down so clearly — saved me hours and money.', savings: '₹31,500' },
    { name: 'Anita S.', role: 'Product Manager', text: 'The investment suggestions ranked by risk were exactly what I needed. Finally optimized both my tax and portfolio.', savings: '₹82,000' },
];

const steps = [
    { num: '01', title: 'Upload or Input', desc: 'Upload your Form 16 PDF or manually enter your salary structure. Our AI extracts everything in seconds.', icon: Upload },
    { num: '02', title: 'AI Analysis', desc: 'Our engine identifies missed deductions, compares regimes, and models your optimal tax strategy.', icon: Search },
    { num: '03', title: 'Save Money', desc: 'Get personalized investment suggestions ranked by risk profile and start saving immediately.', icon: PiggyBank },
];

export default function Landing() {
    const navigate = useNavigate();
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex flex-col font-sans overflow-hidden">
            <Navbar />

            {/* ─── HERO ─── */}
            <section className="relative flex flex-col items-center justify-center pt-28 pb-20 px-6 text-center min-h-[90vh]">
                {/* Ambient glow orbs */}
                <div className="absolute top-[15%] left-[15%] w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[150px] pointer-events-none animate-float" />
                <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none animate-float-slow" />
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/8 rounded-full blur-[200px] pointer-events-none" />

                <div className="z-10 max-w-5xl mx-auto flex flex-col items-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-400 font-medium text-sm mb-8 border border-violet-500/20 backdrop-blur-sm shadow-glow-sm">
                        <Sparkles className="w-4 h-4" />
                        <span>India's #1 AI Tax Optimization Engine</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white mb-6 leading-[1.05]">
                        Your Tax
                        <br />
                        <span className="gradient-text">Wizard</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed font-light">
                        Upload Form 16 or input your salary. AI finds every missed deduction,
                        compares regimes, and recommends tax-saving investments — all in seconds.
                    </p>

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
                        <button
                            onClick={() => navigate('/auth')}
                            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-base shadow-glow hover:shadow-glow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <span className="relative z-10 flex items-center gap-2">
                                Start Free Analysis <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </span>
                        </button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto rounded-2xl text-base h-14 px-8 border-slate-700/50 text-slate-300 hover:bg-white/5 hover:border-violet-500/30 transition-all backdrop-blur-sm"
                        >
                            Watch Demo
                        </Button>
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-3xl">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center p-4 rounded-2xl glass-subtle">
                                <p className="text-2xl md:text-3xl font-bold text-white mb-1">
                                    {stat.value}<span className="text-violet-400">{stat.suffix}</span>
                                </p>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FEATURES GRID ─── */}
            <section className="relative py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium text-xs mb-4 border border-emerald-500/20 uppercase tracking-wider">
                            <Zap className="w-3 h-3" /> Powerful Features
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                            Everything you need to <span className="text-violet-400">save more</span>
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">Four powerful tools working together to minimize your tax liability and maximize your savings.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                            {
                                icon: Upload,
                                title: "Upload & Auto-Parse",
                                desc: "Upload your Form 16 PDF or manually input salary structure. AI-powered OCR extracts salary, TDS, and deduction data in under 5 seconds.",
                                color: "violet",
                                gradient: "from-violet-600/20 to-purple-600/10",
                                iconGradient: "from-violet-500 to-purple-500",
                                tag: "AI Powered"
                            },
                            {
                                icon: Search,
                                title: "Missing Deduction Detector",
                                desc: "Our AI scans your profile against 50+ deduction sections — 80C, 80D, 80E, 80G, HRA, LTA — and flags every rupee you're leaving on the table.",
                                color: "emerald",
                                gradient: "from-emerald-600/20 to-teal-600/10",
                                iconGradient: "from-emerald-500 to-teal-500",
                                tag: "Smart Scan"
                            },
                            {
                                icon: BarChart3,
                                title: "Regime Comparison Engine",
                                desc: "Side-by-side Old vs New regime with your exact numbers. See effective rates, slab-wise breakdown, and the precise rupee difference.",
                                color: "blue",
                                gradient: "from-blue-600/20 to-indigo-600/10",
                                iconGradient: "from-blue-500 to-indigo-500",
                                tag: "Deterministic"
                            },
                            {
                                icon: PiggyBank,
                                title: "Investment Suggestions",
                                desc: "Tax-saving investments ranked by your risk tolerance and liquidity needs — ELSS, PPF, NPS, health insurance premiums, and more.",
                                color: "amber",
                                gradient: "from-amber-600/20 to-orange-600/10",
                                iconGradient: "from-amber-500 to-orange-500",
                                tag: "Personalized"
                            },
                        ].map((f, i) => (
                            <div key={i} className={`group relative rounded-3xl p-6 md:p-8 bg-gradient-to-br ${f.gradient} border border-white/[0.06] hover:border-${f.color}-500/30 transition-all duration-500 hover:-translate-y-1 overflow-hidden`}>
                                <div className={`absolute top-0 right-0 w-64 h-64 bg-${f.color}-500/5 rounded-full blur-[80px] group-hover:bg-${f.color}-500/10 transition-colors duration-500`} />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.iconGradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <f.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider bg-${f.color}-500/10 text-${f.color}-400 px-3 py-1 rounded-full border border-${f.color}-500/20`}>
                                            {f.tag}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section className="relative py-24 px-6 border-t border-white/[0.04]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                            Three steps to <span className="text-amber-400">lower taxes</span>
                        </h2>
                        <p className="text-slate-400 max-w-lg mx-auto">No tax expertise required. Our wizard handles the complexity while you enjoy the savings.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {steps.map((step, i) => (
                            <div key={i} className="relative group">
                                <div className="glass-card rounded-3xl p-7 h-full hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-5">
                                        <span className="text-4xl font-black text-violet-500/20 group-hover:text-violet-500/40 transition-colors">{step.num}</span>
                                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                                            <step.icon className="w-5 h-5 text-violet-400" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                                </div>
                                {i < 2 && (
                                    <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                                        <ArrowRight className="w-5 h-5 text-violet-500/30" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── TESTIMONIALS ─── */}
            <section className="relative py-24 px-6 border-t border-white/[0.04]">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                            Loved by <span className="text-emerald-400">thousands</span>
                        </h2>
                    </div>

                    <div className="relative glass-card rounded-3xl p-8 md:p-10 min-h-[200px]">
                        <div className="absolute top-6 right-8 flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                            ))}
                        </div>
                        <div key={activeTestimonial} className="animate-in fade-in duration-500">
                            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-6 font-light italic">
                                "{testimonials[activeTestimonial].text}"
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                                        {testimonials[activeTestimonial].name[0]}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{testimonials[activeTestimonial].name}</p>
                                        <p className="text-slate-500 text-xs">{testimonials[activeTestimonial].role}</p>
                                    </div>
                                </div>
                                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold border border-emerald-500/20">
                                    Saved {testimonials[activeTestimonial].savings}
                                </div>
                            </div>
                        </div>

                        {/* Dots */}
                        <div className="flex justify-center gap-2 mt-8">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveTestimonial(i)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'bg-violet-500 w-6' : 'bg-slate-700 hover:bg-slate-600'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── CTA BANNER ─── */}
            <section className="relative py-24 px-6">
                <div className="max-w-4xl mx-auto relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-amber-600/20 rounded-3xl blur-[60px]" />
                    <div className="relative glass-card rounded-3xl p-10 md:p-14 text-center overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                            Ready to save on taxes?
                        </h2>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                            Join thousands of Indians who've optimized their tax with AI. It's free to start.
                        </p>
                        <button
                            onClick={() => navigate('/auth')}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-amber-500 text-white px-10 py-4 rounded-2xl font-semibold text-lg shadow-glow hover:shadow-glow-lg transition-all duration-500 hover:scale-[1.02]"
                        >
                            <Wand2 className="w-5 h-5" /> Get Started Free
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="border-t border-white/[0.04] py-10 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center">
                            <Wand2 className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-bold text-white">Tax Wizard</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Bank-Grade Encryption</span>
                        <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> ISO 27001</span>
                        <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI-Powered</span>
                    </div>
                    <p className="text-xs text-slate-600">© 2024 Tax Wizard. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
