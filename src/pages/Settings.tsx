import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Shield, Bell, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

export default function Settings() {
    const navigate = useNavigate();
    const { user, updateUser, logout } = useAuth();

    const [name, setName] = useState(user?.name ?? '');
    const [email] = useState(user?.email ?? '');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (user) setName(user.name);
    }, [user]);

    const handleSaveProfile = async () => {
        if (!name.trim()) return;
        setSaveStatus('saving');
        setErrorMsg('');
        try {
            await updateUser({ name: name.trim() });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2500);
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'Failed to save');
            setSaveStatus('error');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground text-lg mt-1">Manage your account and preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar nav */}
                <div className="md:col-span-1 space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-3 bg-accent text-accent-foreground font-medium h-12">
                        <User className="w-4 h-4" /> Profile Details
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground h-12">
                        <Shield className="w-4 h-4" /> Security &amp; Data
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground h-12">
                        <Bell className="w-4 h-4" /> Notifications
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 h-12"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                </div>

                <div className="md:col-span-3 space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader className="border-b border-border/40 pb-4">
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {errorMsg && (
                                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-sm font-semibold">Full Name</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-12 bg-background/50"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold">Email Address</label>
                                <Input
                                    value={email}
                                    type="email"
                                    className="h-12 bg-background/50 opacity-60 cursor-not-allowed"
                                    readOnly
                                />
                                <p className="text-xs text-muted-foreground">Email cannot be changed after registration.</p>
                            </div>

                            <div className="pt-4 flex items-center justify-end border-t border-border/40">
                                <Button
                                    onClick={handleSaveProfile}
                                    disabled={saveStatus === 'saving'}
                                    className="px-8 shadow-lg shadow-indigo-500/20 gap-2"
                                >
                                    {saveStatus === 'saving' && (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    )}
                                    {saveStatus === 'saved' && <CheckCircle2 className="w-4 h-4" />}
                                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gemini AI info card */}
                    <Card className="border-indigo-500/30 bg-indigo-500/5">
                        <CardHeader className="border-b border-indigo-500/20 pb-4">
                            <CardTitle className="text-indigo-300">AI Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-3">
                            <div className="flex items-start gap-3 text-sm text-indigo-300/80">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                <span>
                                    The Gemini API is configured securely on the server.
                                    Your API key is stored in <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">server/.env</code> and
                                    never exposed to the browser.
                                </span>
                            </div>
                            <p className="text-xs text-indigo-400/50 pl-7">
                                To update your key, edit <code className="font-mono">server/.env</code> → <code className="font-mono">GEMINI_API_KEY</code> and restart the server.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Danger zone */}
                    <Card className="border-red-500/30 bg-red-500/5">
                        <CardHeader>
                            <CardTitle className="text-red-500">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-red-700 dark:text-red-400 mb-6 font-medium">
                                Permanently delete your account and all associated tax data. This action cannot be undone.
                            </p>
                            <Button
                                variant="destructive"
                                className="font-semibold shadow-lg shadow-red-500/20"
                                onClick={async () => {
                                    if (!confirm('Are you sure? This will permanently delete your account and all tax data.')) return;
                                    try {
                                        const { deleteAccount } = await import('../lib/api');
                                        await deleteAccount();
                                        logout();
                                        navigate('/');
                                    } catch {
                                        alert('Failed to delete account. Please try again.');
                                    }
                                }}
                            >
                                Delete Account
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
