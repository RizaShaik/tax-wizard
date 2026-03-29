import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTax } from '../store/TaxContext';
import { useNavigate } from 'react-router-dom';
import { parseForm16, Form16Data, ParseProgress } from '../utils/form16Parser';
import {
    UploadCloud,
    CheckCircle2,
    Calculator,
    IndianRupee,
    ShieldCheck,
    Building,
    Loader2,
    ArrowRight,
    User,
    HeartPulse,
    AlertCircle,
    Wand2
} from 'lucide-react';

const steps = [
    { id: 1, title: 'Income' },
    { id: 2, title: 'Deductions' },
    { id: 3, title: 'Verify' },
];

export function OnboardingStepper() {
    const { state, dispatch, syncToServer } = useTax();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(1);

    // Step 3 specific state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [parseFailed, setParseFailed] = useState(false);
    const [parsedData, setParsedData] = useState<Form16Data | null>(null);
    const [ocrProgress, setOcrProgress] = useState<ParseProgress | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step 1: Name + Income
    const [localName, setLocalName] = useState(state.userDetails.name || '');
    const [localIncome, setLocalIncome] = useState({
        grossSalary: state.income.grossSalary > 0 ? state.income.grossSalary.toString() : '',
        freelanceIncome: state.income.freelanceIncome > 0 ? state.income.freelanceIncome.toString() : '',
    });

    // Step 2: Deductions
    const [localDeductions, setLocalDeductions] = useState({
        section80C: state.deductions.section80C > 0 ? state.deductions.section80C.toString() : '',
        section80D: state.deductions.section80D > 0 ? state.deductions.section80D.toString() : '',
        hraExemption: state.deductions.hraExemption > 0 ? state.deductions.hraExemption.toString() : '',
    });

    // Validation
    const grossSalaryNum = Number(localIncome.grossSalary);
    const isIncomeValid =
        localName.trim().length >= 2 &&
        grossSalaryNum > 0 &&
        Number(localIncome.freelanceIncome) >= 0;

    const isDeductionsValid =
        Number(localDeductions.section80C) >= 0 &&
        Number(localDeductions.section80D) >= 0 &&
        Number(localDeductions.hraExemption) >= 0;

    // Navigation handlers
    const handleNext = () => {
        if (currentStep === 1) {
            if (!isIncomeValid) return;
            dispatch({ type: 'UPDATE_USER_DETAILS', payload: { name: localName.trim() } });
            dispatch({
                type: 'UPDATE_INCOME',
                payload: {
                    grossSalary: grossSalaryNum,
                    freelanceIncome: Number(localIncome.freelanceIncome) || 0,
                },
            });
        } else if (currentStep === 2) {
            if (!isDeductionsValid) return;
            dispatch({
                type: 'UPDATE_DEDUCTIONS',
                payload: {
                    section80C: Number(localDeductions.section80C) || 0,
                    section80D: Number(localDeductions.section80D) || 0,
                    hraExemption: Number(localDeductions.hraExemption) || 0,
                },
            });
        }
        setDirection(1);
        setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    };

    const handleBack = () => {
        setDirection(-1);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleCalculate = async () => {
        const finalIncome = {
            grossSalary: Number(localIncome.grossSalary) || 0,
            freelanceIncome: Number(localIncome.freelanceIncome) || 0,
        };
        const finalDeductions = {
            section80C: Number(localDeductions.section80C) || 0,
            section80D: Number(localDeductions.section80D) || 0,
            hraExemption: Number(localDeductions.hraExemption) || 0,
            standardDeduction: 50000,
        };
        // Dispatch local state first
        dispatch({ type: 'UPDATE_INCOME', payload: finalIncome });
        dispatch({ type: 'UPDATE_DEDUCTIONS', payload: finalDeductions });
        dispatch({ type: 'CALCULATE_TAX' });
        // Sync to server with data passed directly (bypasses React state batching delay)
        await syncToServer({ income: finalIncome, deductions: finalDeductions });
        navigate('/dashboard');
    };


    const handleUploadClick = () => {
        if (isUploading || uploadSuccess) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setParseFailed(false);
        setOcrProgress(null);
        setIsUploading(true);

        try {
            const result = await parseForm16(file, (progress) => {
                setOcrProgress(progress);
            });
            setParsedData(result);

            if (result.parseSuccess) {
                dispatch({ type: 'LOAD_FROM_FORM16', payload: result });
                setUploadSuccess(true);
            } else {
                setParseFailed(true);
            }
        } catch {
            setParseFailed(true);
        } finally {
            setIsUploading(false);
            setOcrProgress(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 60 : -60,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 60 : -60,
            opacity: 0,
        }),
    };

    // Live preview tax calc for step 1/2 feedback
    const previewIncome = grossSalaryNum + (Number(localIncome.freelanceIncome) || 0);
    const formatINR = (v: number) =>
        v > 0
            ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)
            : '₹0';

    const inputClass = (colorRing = 'indigo') =>
        `w-full bg-white/5 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-medium focus:ring-2 focus:ring-${colorRing}-500 focus:border-${colorRing}-500 transition-all outline-none placeholder:text-slate-600`;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4 selection:bg-indigo-500/30">

            {/* Background glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-xl relative z-10">

                {/* Logo */}
                <div
                    className="flex items-center gap-2 mb-8 cursor-pointer w-fit mx-auto"
                    onClick={() => navigate('/')}
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/30 text-sm">
                        <Wand2 className="w-4 h-4" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Tax Wizard</span>
                </div>

                {/* Stepper Header */}
                <div className="mb-8 flex justify-between items-center relative px-4">
                    <div className="absolute left-4 right-4 top-5 h-0.5 bg-slate-800 rounded-full -z-10">
                        <motion.div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                        />
                    </div>
                    {steps.map((step) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${isActive
                                        ? 'bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] border-2 border-violet-400 scale-110'
                                        : isCompleted
                                            ? 'bg-slate-800 text-violet-400 border border-violet-500/50'
                                            : 'bg-slate-900 border border-slate-700 text-slate-500'
                                        }`}
                                >
                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                                </div>
                                <span className={`text-xs font-medium tracking-wide ${isActive ? 'text-violet-300' : 'text-slate-500'}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Card */}
                <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <AnimatePresence mode="wait" custom={direction}>

                        {/* STEP 1: INCOME */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="space-y-5"
                            >
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">Tell us about yourself</h2>
                                    <p className="text-slate-400 text-sm">Your name and income details for FY 2023-24.</p>
                                </div>

                                <div className="space-y-4">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="w-5 h-5 text-indigo-400/70" />
                                            </div>
                                            <input
                                                type="text"
                                                value={localName}
                                                onChange={(e) => setLocalName(e.target.value)}
                                                className={inputClass('indigo')}
                                                placeholder="e.g. Shubham Sharma"
                                                autoFocus
                                            />
                                        </div>
                                        {localName.length > 0 && localName.trim().length < 2 && (
                                            <p className="text-red-400 text-xs mt-1">Name must be at least 2 characters</p>
                                        )}
                                    </div>

                                    {/* Gross Salary */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Salary (Annual)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <IndianRupee className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                value={localIncome.grossSalary}
                                                onChange={(e) => setLocalIncome(p => ({ ...p, grossSalary: e.target.value }))}
                                                className={inputClass('indigo')}
                                                placeholder="e.g. 1500000"
                                            />
                                        </div>
                                        {Number(localIncome.grossSalary) > 0 && (
                                            <p className="text-indigo-400/70 text-xs">{formatINR(Number(localIncome.grossSalary))} per year</p>
                                        )}
                                    </div>

                                    {/* Freelance Income */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Freelance / Other Income</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <IndianRupee className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                value={localIncome.freelanceIncome}
                                                onChange={(e) => setLocalIncome(p => ({ ...p, freelanceIncome: e.target.value }))}
                                                className={`w-full bg-white/5 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none placeholder:text-slate-600`}
                                                placeholder="0 (optional)"
                                            />
                                        </div>
                                    </div>

                                    {/* Live Preview */}
                                    {previewIncome > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between"
                                        >
                                            <span className="text-slate-400 text-sm">Total Gross Income</span>
                                            <span className="text-indigo-300 font-bold">{formatINR(previewIncome)}</span>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={handleNext}
                                        disabled={!isIncomeValid}
                                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-7 py-3 rounded-xl font-semibold shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.3)] hover:scale-[1.02] transition-all disabled:opacity-40 disabled:pointer-events-none"
                                    >
                                        Next Step <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: DEDUCTIONS */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="space-y-5"
                            >
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">Deductions & Exemptions</h2>
                                    <p className="text-slate-400 text-sm">Maximize your savings by entering your investments.</p>
                                </div>

                                <div className="space-y-4">
                                    {/* Section 80C */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Section 80C Investments</label>
                                            <span className="text-xs text-emerald-400/70 font-medium">Max ₹1,50,000</span>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                max="150000"
                                                value={localDeductions.section80C}
                                                onChange={(e) => setLocalDeductions(p => ({ ...p, section80C: e.target.value }))}
                                                className={`w-full bg-white/5 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none placeholder:text-slate-600`}
                                                placeholder="0"
                                            />
                                        </div>
                                        <p className="text-slate-500 text-xs">ELSS, PPF, EPF, LIC, Home Loan Principal, NSC...</p>
                                        {Number(localDeductions.section80C) > 150000 && (
                                            <p className="text-amber-400 text-xs">⚠️ Capped at ₹1,50,000 — excess won't be deducted</p>
                                        )}
                                    </div>

                                    {/* Section 80D */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Section 80D — Health Insurance</label>
                                            <span className="text-xs text-blue-400/70 font-medium">Max ₹25,000–₹1L</span>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <HeartPulse className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                value={localDeductions.section80D}
                                                onChange={(e) => setLocalDeductions(p => ({ ...p, section80D: e.target.value }))}
                                                className={`w-full bg-white/5 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none placeholder:text-slate-600`}
                                                placeholder="0"
                                            />
                                        </div>
                                        <p className="text-slate-500 text-xs">Health Insurance Premiums (Self, Spouse, Children & Parents)</p>
                                    </div>

                                    {/* HRA Exemption */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">HRA Exemption</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Building className="w-5 h-5 text-orange-400" />
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                value={localDeductions.hraExemption}
                                                onChange={(e) => setLocalDeductions(p => ({ ...p, hraExemption: e.target.value }))}
                                                className={`w-full bg-white/5 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none placeholder:text-slate-600`}
                                                placeholder="0"
                                            />
                                        </div>
                                        <p className="text-slate-500 text-xs">House Rent Allowance exemption (only applicable in Old Regime)</p>
                                    </div>

                                    {/* Standard Deduction notice */}
                                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30 flex items-center gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <p className="text-xs text-slate-400">
                                            Standard Deduction of <span className="text-emerald-400 font-semibold">₹50,000</span> auto-applied for salaried in both regimes.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-between">
                                    <button
                                        onClick={handleBack}
                                        className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!isDeductionsValid}
                                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-7 py-3 rounded-xl font-semibold shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:scale-[1.02] transition-all disabled:opacity-40 disabled:pointer-events-none"
                                    >
                                        Next Step <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: VERIFICATION */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">Almost There!</h2>
                                    <p className="text-slate-400 text-sm">Optionally upload your Form 16 for AI verification, or skip directly to the dashboard.</p>
                                </div>

                                {/* Summary box */}
                                <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/30 space-y-2">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Tax Profile Summary</p>
                                    {[
                                        { label: 'Name', value: localName || state.userDetails.name },
                                        { label: 'Gross Salary', value: formatINR(Number(localIncome.grossSalary) || state.income.grossSalary) },
                                        { label: 'Freelance Income', value: formatINR(Number(localIncome.freelanceIncome) || state.income.freelanceIncome) },
                                        { label: '80C Investments', value: formatINR(Number(localDeductions.section80C) || state.deductions.section80C) },
                                    ].map(item => (
                                        <div key={item.label} className="flex justify-between text-sm">
                                            <span className="text-slate-500">{item.label}</span>
                                            <span className="text-slate-200 font-medium">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Hidden real file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                <div
                                    onClick={handleUploadClick}
                                    className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${uploadSuccess
                                        ? 'border-emerald-500/50 bg-emerald-500/10'
                                        : parseFailed
                                            ? 'border-amber-500/40 bg-amber-500/5'
                                            : isUploading
                                                ? 'border-indigo-500/50 bg-indigo-500/10'
                                                : 'border-slate-700 hover:border-indigo-500/50 hover:bg-white/5'
                                        }`}
                                >
                                    <AnimatePresence mode="wait">
                                        {uploadSuccess && parsedData ? (
                                            <motion.div key="success" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3 w-full">
                                                <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-emerald-400 font-semibold">Form 16 Parsed Successfully!</p>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${parsedData.method === 'ocr'
                                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                                        : parsedData.method === 'heuristic'
                                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                        }`}>
                                                        {parsedData.method === 'ocr' ? '⚡ OCR' : parsedData.method === 'heuristic' ? '🔍 Smart' : '📄 Text'}
                                                    </span>
                                                </div>
                                                <div className="w-full mt-1 space-y-1 text-left">
                                                    {parsedData.grossSalary > 0 && (
                                                        <div className="flex justify-between text-xs px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                                                            <span className="text-slate-400">Gross Salary</span>
                                                            <span className="text-emerald-300 font-semibold">{formatINR(parsedData.grossSalary)}</span>
                                                        </div>
                                                    )}
                                                    {parsedData.tdsDeducted > 0 && (
                                                        <div className="flex justify-between text-xs px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                                                            <span className="text-slate-400">TDS Deducted</span>
                                                            <span className="text-emerald-300 font-semibold">{formatINR(parsedData.tdsDeducted)}</span>
                                                        </div>
                                                    )}
                                                    {parsedData.section80C > 0 && (
                                                        <div className="flex justify-between text-xs px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                                                            <span className="text-slate-400">Section 80C</span>
                                                            <span className="text-emerald-300 font-semibold">{formatINR(parsedData.section80C)}</span>
                                                        </div>
                                                    )}
                                                    {parsedData.hraExemption > 0 && (
                                                        <div className="flex justify-between text-xs px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                                                            <span className="text-slate-400">HRA Exemption</span>
                                                            <span className="text-emerald-300 font-semibold">{formatINR(parsedData.hraExemption)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-emerald-400/60 text-xs mt-1">Values pre-filled. Click Calculate to continue.</p>
                                            </motion.div>
                                        ) : parseFailed ? (
                                            <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
                                                <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center">
                                                    <AlertCircle className="w-7 h-7 text-amber-400" />
                                                </div>
                                                <p className="text-amber-300 font-medium">Couldn't read all fields</p>
                                                <p className="text-slate-500 text-xs">Your manually entered values will be used. Try a text-based PDF.</p>
                                                <p className="text-indigo-400 text-xs underline cursor-pointer">Try another file</p>
                                            </motion.div>
                                        ) : isUploading ? (
                                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                                                {ocrProgress?.stage === 'vision' ? (
                                                    <>
                                                        <p className="text-indigo-300 font-medium">✨ Asking Gemini Vision...</p>
                                                        <p className="text-slate-500 text-sm">AI reading your Form 16</p>
                                                    </>
                                                ) : ocrProgress?.stage === 'ocr' ? (
                                                    <>
                                                        <p className="text-indigo-300 font-medium">Running OCR...</p>
                                                        <p className="text-slate-500 text-sm">
                                                            {ocrProgress.totalPages && ocrProgress.totalPages > 1
                                                                ? `Page ${ocrProgress.page} of ${ocrProgress.totalPages}`
                                                                : 'Reading image data...'}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-indigo-300 font-medium">Parsing Form 16...</p>
                                                        <p className="text-slate-500 text-sm">Extracting salary, TDS &amp; deductions...</p>
                                                    </>
                                                )}
                                            </motion.div>
                                        ) : (
                                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
                                                <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                                                    <UploadCloud className="w-7 h-7 text-slate-400" />
                                                </div>
                                                <p className="text-slate-200 font-medium">Upload Form 16 <span className="text-slate-500">(Optional)</span></p>
                                                <p className="text-slate-500 text-xs">PDF, JPG or PNG · Max 10MB · Auto-fills your tax data</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="pt-2 flex justify-between items-center gap-4">
                                    <button
                                        onClick={handleBack}
                                        className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors shrink-0"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={handleCalculate}
                                        className="relative group overflow-hidden flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] text-white px-8 py-3.5 rounded-xl font-bold text-base hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all hover:scale-[1.02] animate-gradient"
                                    >
                                        <Calculator className="w-5 h-5" />
                                        Calculate My Tax
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
        </div>
    );
}
