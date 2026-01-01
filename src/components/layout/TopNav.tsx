"use client";

import Link from 'next/link';


import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';

interface TopNavProps {
    showAuth?: boolean;
}

export default function TopNav({ showAuth = false }: TopNavProps) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/GlucoVision.svg" alt="GlucoVision Logo" className="h-10 w-auto transition-transform group-hover:scale-105" />
                </Link>

                {showAuth && (
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="px-6 py-2.5 rounded-full bg-[#D73535] text-white font-medium hover:bg-[#FF4646] transition-colors shadow-lg shadow-red-200"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                            >
                                Masuk
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
