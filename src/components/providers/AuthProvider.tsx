"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter, usePathname } from 'next/navigation';
import { createUserProfile, getUserProfile, UserProfile } from '@/lib/firebase/userService';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    logout: async () => { },
    signInWithGoogle: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // Create/Update user profile & fetch isDev status
                const profile = await createUserProfile(currentUser);
                setUserProfile(profile);
            } else {
                setUserProfile(null);
            }

            setLoading(false);

            // Protected Routes Logic
            const publicRoutes = ['/login', '/register', '/'];
            const isPublicRoute = publicRoutes.includes(pathname);

            if (!currentUser && !isPublicRoute) {
                router.push('/login');
            } else if (currentUser && pathname === '/login') {
                router.push('/dashboard');
            }
        });

        return () => unsubscribe();
    }, [pathname, router]);

    const logout = async () => {
        await signOut(auth);
        setUserProfile(null);
        router.push('/login');
    };

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // Profile creation handled by onAuthStateChanged
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, logout, signInWithGoogle }}>
            {!loading ? children : (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black">
                    <div className="w-12 h-12 border-4 border-orange-600/30 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-orange-500 font-medium text-sm animate-pulse">Memuat GlucoVision...</p>
                </div>
            )}
        </AuthContext.Provider>
    );
};
