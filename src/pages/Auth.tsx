import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Wand2, Mail, AlertCircle, CheckCircle2, Shield, Sparkles, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

const features = [
    { icon: Sparkles, text: 'AI identifies every missed deduction' },
    { icon: Shield, text: 'Old vs New regime with exact numbers' },
    { icon: Lock, text: 'Bank-grade encryption, zero tracking' },
];

export default function Auth() {
    const navigate = useNavigate();
    const { login, signup } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [touched, setTouched] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');

    const isValidEmail = EMAIL_REGEX.test(email.trim());
    const showEmailError = touched && email.length > 0 && !isValidEmail;
    const showEmailSuccess = email.length > 0 && isValidEmail;
    const isFormValid = isLogin
        ? isValidEmail && password.length >= 4
        : isValidEmail && password.length >= 4 && name.trim().length >= 2;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);
        setServerError('');
        if (!isFormValid) return;

        setIsSubmitting(true);
        try {
            if (isLogin) {
                await login(email.trim(), password);
            } else {
                await signup(name.trim(), email.trim(), password);
            }
            navigate('/ingest');
        } catch (err: unknown) {
            setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0a0a0f] overflow-hidden">
            {/* Left form panel */}
            <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-8 z-10 relative">
                {/* Subtle glow */}
                <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="w-full max-w-md relative z-10">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 mb-12 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center shadow-glow-sm">
                            <Wand2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-2xl text-white">Tax Wizard</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                            {isLogin ? 'Welcome back' : 'Create your account'}
                        </h2>
                        <p className="text-slate-400">
                            {isLogin ? 'Sign in to optimize your taxes with AI.' : 'Start saving on taxes in under 2 minutes.'}
                        </p>
                    </div>

                    {/* Tab Toggle */}
                    <div className="flex mb-8 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <button
                            onClick={() => { setIsLogin(true); setServerError(''); }}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${isLogin ? 'bg-violet-500/20 text-violet-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setServerError(''); }}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${!isLogin ? 'bg-violet-500/20 text-violet-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Server error banner */}
                    {serverError && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                            <p className="text-sm text-red-400">{serverError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Name field (sign up only) */}
                        {!isLogin && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-sm font-semibold text-slate-300">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Shubham Sharma"
                                    className="w-full h-12 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all outline-none"
                                    autoFocus={!isLogin}
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setServerError(''); }}
                                    onBlur={() => setTouched(true)}
                                    className={`w-full h-12 bg-white/[0.03] border rounded-xl pl-11 pr-10 text-white placeholder:text-slate-600 focus:ring-2 transition-all outline-none ${
                                        showEmailError
                                            ? 'border-red-500/50 focus:ring-red-500/30'
                                            : showEmailSuccess
                                                ? 'border-emerald-500/50 focus:ring-emerald-500/30'
                                                : 'border-white/[0.08] focus:ring-violet-500/40 focus:border-violet-500/40'
                                    }`}
                                    required
                                    autoComplete="email"
                                    autoFocus={isLogin}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {showEmailSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                    {showEmailError && <AlertCircle className="w-4 h-4 text-red-400" />}
                                </div>
                            </div>
                            {showEmailError && (
                                <p className="text-xs text-red-400 flex items-center gap-1.5">
                                    <AlertCircle className="w-3 h-3" />
                                    {email.includes('@') ? 'Please enter a valid email address' : 'Email must contain @'}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setServerError(''); }}
                                    placeholder="••••••••"
                                    className="w-full h-12 bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-10 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {isLogin && (
                            <div className="flex justify-end">
                                <a href="#" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">Forgot password?</a>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-semibold text-base shadow-glow hover:shadow-glow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {isLogin ? 'Signing in...' : 'Creating account...'}
                                </span>
                            ) : (
                                <>
                                    {isLogin ? 'Continue' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right visual panel */}
            <div className="hidden lg:flex w-[45%] relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-950/80 via-purple-950/60 to-[#0a0a0f]" />
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-violet-500/15 rounded-full blur-[150px]" />
                <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[120px]" />

                <div className="relative z-10 max-w-md px-10">
                    <div className="space-y-6">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center mx-auto mb-5 shadow-glow">
                                <Wand2 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Tax Magic Awaits</h3>
                            <p className="text-slate-400 text-sm">Your AI tax advisor is ready to save you money</p>
                        </div>

                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-4 glass-card rounded-2xl p-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                                    <f.icon className="w-5 h-5 text-violet-400" />
                                </div>
                                <p className="text-sm text-slate-300 font-medium">{f.text}</p>
                            </div>
                        ))}

                        <div className="flex items-center justify-center gap-3 pt-4">
                            {['AES-256', 'ISO 27001', 'GDPR'].map(badge => (
                                <span key={badge} className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
