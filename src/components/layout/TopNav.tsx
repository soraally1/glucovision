"use client";

import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function TopNav() {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm shadow-orange-200">
                        <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                        Gluco<span className="text-orange-600">Vision</span>
                    </span>
                </Link>
            </div>
        </header>
    );
}
