"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

export default function DevGuard({ children }: { children: React.ReactNode }) {
    const { userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && userProfile && !userProfile.isDev) {
            // Not a developer, redirect to dashboard
            router.push('/dashboard');
        }
    }, [userProfile, loading, router]);

    // Show loading while checking
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Only render children if user is a developer
    if (userProfile?.isDev) {
        return <>{children}</>;
    }

    return null;
}
