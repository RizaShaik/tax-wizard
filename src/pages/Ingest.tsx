import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';

export default function Ingest() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isScanning, setIsScanning] = useState(false);

    const handleNext = () => setStep(s => Math.min(s + 1, 3));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const simulateUpload = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            navigate('/dashboard');
        }, 3000);
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-8">
                <div className="mb-10">
                    <h1 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight">Tax Profile Setup</h1>
                    <p className="text-muted-foreground text-lg">Let's gather some details to optimize your taxes.</p>
                </div>

                {/* Stepper Progress */}
                <div className="flex items-center justify-between mb-12 relative">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border/40 -z-10" />
                    {[
                        { num: 1, label: "Income" },
                        { num: 2, label: "Deductions" },
                        { num: 3, label: "Documents" }
                    ].map((s) => (
                        <div key={s.num} className="flex flex-col items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 backdrop-blur-sm">
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500",
                                step === s.num
                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110 ring-4 ring-indigo-500/20"
                                    : step > s.num
                                        ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/30"
                                        : "bg-card border-2 border-border text-muted-foreground"
                            )}>
                                {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : s.num}
                            </div>
                            <span className={cn(
                                "text-sm font-semibold tracking-wide uppercase",
                                step === s.num ? "text-foreground" : "text-muted-foreground"
                            )}>{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <Card className="shadow-2xl shadow-indigo-500/5 border-border/60">
                    <CardHeader className="bg-muted/30 border-b border-border/40">
                        <CardTitle className="text-xl">{
                            step === 1 ? "Income Details" :
                                step === 2 ? "Deductions & Investments" :
                                    "Upload Form 16"
                        }</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-8 pb-8">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Base Salary (₹)</label>
                                    <Input type="number" placeholder="e.g. 1500000" defaultValue="1850000" className="h-14 text-lg bg-background/50" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Freelance/Business Income (₹)</label>
                                    <Input type="number" placeholder="e.g. 350000" defaultValue="0" className="h-14 text-lg bg-background/50" />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Section 80C Investments (₹)</label>
                                    <Input type="number" placeholder="Max 1.5L" defaultValue="150000" className="h-14 text-lg bg-background/50" />
                                    <p className="text-sm text-indigo-500 font-medium">✨ Pro tip: We'll evaluate if this matters under the New Regime.</p>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">HRA / Rent Paid (₹)</label>
                                    <Input type="number" placeholder="Annual Rent" defaultValue="200000" className="h-14 text-lg bg-background/50" />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                {!isScanning ? (
                                    <div
                                        className="border-2 border-dashed border-indigo-500/30 rounded-2xl p-14 text-center hover:bg-indigo-500/5 transition-colors cursor-pointer group bg-slate-50 dark:bg-slate-900/50"
                                        onClick={simulateUpload}
                                    >
                                        <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                            <Upload className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">Drag & Drop Form 16</h3>
                                        <p className="text-base text-muted-foreground max-w-sm mx-auto mb-8">
                                            Supports PDF, JPG, or PNG up to 10MB. We'll automatically parse your tax data in seconds.
                                        </p>
                                        <Button className="pointer-events-none rounded-full px-8">Select Files</Button>
                                    </div>
                                ) : (
                                    <div className="border border-indigo-500/20 rounded-2xl p-16 text-center bg-indigo-500/5 backdrop-blur-sm relative overflow-hidden shadow-inner">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                        <div className="relative w-24 h-24 mx-auto mb-8">
                                            <FileText className="w-24 h-24 text-indigo-500 opacity-20" />
                                            <div className="absolute top-0 left-0 w-full h-full border-t-[3px] border-r-[3px] border-indigo-500 rounded-full animate-spin" />
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/30 animate-pulse rounded-full" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3 text-indigo-500 dark:text-indigo-400">Scanning Document...</h3>
                                        <p className="text-base text-muted-foreground font-medium">
                                            Extracting AI insights and crunching numbers...
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-8 flex justify-between border-t border-border/40 mt-8">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={step === 1 || isScanning}
                                className="px-8 h-12 text-base"
                            >
                                Back
                            </Button>
                            {step < 3 ? (
                                <Button onClick={handleNext} className="gap-2 shadow-lg shadow-indigo-500/20 px-8 h-12 text-base rounded-md">
                                    Continue <ChevronRight className="w-5 h-5" />
                                </Button>
                            ) : (
                                <Button onClick={simulateUpload} disabled={isScanning} className="gap-2 shadow-lg shadow-indigo-500/20 px-8 h-12 text-base rounded-md">
                                    {isScanning ? "Processing..." : "Generate Dashboard"}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
