import React from 'react';
import { Sidebar } from './Sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0a0a0f] flex">
            <Sidebar />
            <main className="flex-1 ml-60 p-6 md:p-8 lg:p-10 overflow-y-auto h-screen relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <div className="max-w-5xl mx-auto z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
