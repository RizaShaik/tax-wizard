
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AIPanel } from '../components/AIPanel';
import { mockTaxData } from '../lib/mockData';
import { IndianRupee, TrendingDown, Percent, Wallet } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie
} from 'recharts';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export default function Dashboard() {
    const { oldRegime, newRegime, savings } = mockTaxData;

    const comparisonData = [
        { name: 'Old Regime', tax: oldRegime.totalTax },
        { name: 'New Regime', tax: newRegime.totalTax },
    ];

    const savingsMeterData = [
        { name: 'Optimization Score', value: 94 },
        { name: 'Remaining', value: 6 }
    ];

    return (
        <DashboardLayout>
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">My Tax Dashboard</h1>
                    <p className="text-muted-foreground text-lg">Financial year 2023-2024</p>
                </div>
                <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-5 py-2.5 rounded-full font-semibold border border-indigo-500/20 shadow-sm flex items-center gap-2 self-start md:self-auto">
                    <TrendingDown className="w-5 h-5" />
                    Recommended: New Regime
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover:shadow-xl shadow-glass transition-all duration-300 group border-blue-500/10 hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-inner">
                                <Wallet className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 px-3 py-1.5 rounded-full">Gross</span>
                        </div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Total Income</p>
                        <h3 className="text-3xl font-bold tracking-tight">{formatCurrency(newRegime.totalIncome)}</h3>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 hover:shadow-xl shadow-glass transition-all duration-300 group border-indigo-500/10 hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shadow-inner">
                                <IndianRupee className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 px-3 py-1.5 rounded-full">Optimized</span>
                        </div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Estimated Tax</p>
                        <h3 className="text-3xl font-bold tracking-tight">{formatCurrency(newRegime.totalTax)}</h3>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 hover:shadow-xl shadow-glass transition-all duration-300 group border-emerald-500/10 hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-inner">
                                <Percent className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full">Effective</span>
                        </div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Effective Tax Rate</p>
                        <h3 className="text-3xl font-bold tracking-tight">
                            {((newRegime.totalTax / newRegime.totalIncome) * 100).toFixed(1)}%
                        </h3>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-150">
                    <Card className="shadow-2xl shadow-indigo-500/5 border-border/60">
                        <CardHeader className="border-b border-border/40 pb-5 bg-muted/30">
                            <CardTitle className="text-xl">Regime Comparison</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 h-[380px] px-2 sm:px-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-sm font-medium" tick={{ fill: 'currentColor', opacity: 0.7 }} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => `₹${val / 1000}k`}
                                        className="text-xs font-semibold text-muted-foreground"
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                        contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                                        formatter={(value: number) => [<span className="font-bold">{formatCurrency(value)}</span>, "Tax Liability"]}
                                    />
                                    <Bar dataKey="tax" radius={[12, 12, 0, 0]} maxBarSize={70}>
                                        {comparisonData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#64748b' : '#6366f1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="shadow-2xl shadow-emerald-500/10 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                        <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 z-10 relative">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/20">
                                    <TrendingDown className="w-3 h-3" /> Highest Optimization
                                </div>
                                <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Total Savings Projected</p>
                                <h3 className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                                    +{formatCurrency(savings)}
                                </h3>
                                <p className="text-base font-medium text-emerald-800/70 dark:text-emerald-200/50">By choosing New Regime over Old Regime</p>
                            </div>
                            <div className="w-40 h-40 relative shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={savingsMeterData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            startAngle={225}
                                            endAngle={-45}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            <Cell fill="#10b981" />
                                            <Cell fill="rgba(16, 185, 129, 0.1)" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center flex-col mt-4">
                                    <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">94</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-500/70">Score</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
                    <div className="sticky top-8">
                        <AIPanel />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
