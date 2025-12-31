"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Activity, FlaskConical, Settings, Stethoscope, ScanBarcode } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function BottomNav() {
    const pathname = usePathname();
    const { userProfile } = useAuth();

    // Hide BottomNav on these routes
    if (pathname === '/login' || pathname === '/register' || pathname === '/' || pathname === '/sugar-visualizer') return null;

    const isDev = userProfile?.isDev === true;

    const allNavItems = [
        { href: '/dashboard', label: 'Home', icon: LayoutDashboard, devOnly: false },
        { href: '/measure', label: 'Ukur', icon: Activity, devOnly: false },
        { href: '/sugar-visualizer', label: 'Gluco', icon: ScanBarcode, devOnly: false },
        { href: '/consult', label: 'Konsul', icon: Stethoscope, devOnly: false },
        { href: '/training', label: 'AI Lab', icon: FlaskConical, devOnly: true },
        { href: '/calibration', label: 'Setup', icon: Settings, devOnly: true },
    ];

    // Filter based on dev status
    const navItems = allNavItems.filter(item =>
        !item.devOnly || isDev
    );

    return (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50 pointer-events-none pb-4 lg:pb-6 px-4">
            <nav
                className={`
                    pointer-events-auto
                    w-full max-w-md lg:max-w-4xl
                    ${isDev ? 'bg-purple-600/95' : 'bg-white/95'}
                    backdrop-blur-xl
                    shadow-2xl rounded-2xl lg:rounded-3xl
                    border ${isDev ? 'border-purple-700/50' : 'border-white/20'}
                    transition-all duration-300
                `}
            >
                <div className="flex items-center justify-around lg:justify-center lg:gap-2 p-2 lg:p-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex flex-col lg:flex-row items-center justify-center
                                    gap-1 lg:gap-3 px-4 lg:px-6 py-3 lg:py-3.5 rounded-xl lg:rounded-2xl
                                    transition-all duration-200
                                    ${isActive
                                        ? isDev
                                            ? 'bg-purple-700 shadow-lg shadow-purple-900/30'
                                            : 'bg-gradient-to-br from-orange-50 to-yellow-50 shadow-md'
                                        : isDev
                                            ? 'hover:bg-purple-700/50'
                                            : 'hover:bg-orange-50/50'
                                    }
                                    group
                                `}
                            >
                                <Icon
                                    className={`
                                        w-5 h-5 lg:w-6 lg:h-6
                                        ${isActive
                                            ? isDev
                                                ? 'text-white'
                                                : 'text-orange-600'
                                            : isDev
                                                ? 'text-purple-100'
                                                : 'text-gray-500 group-hover:text-orange-500'
                                        }
                                        transition-colors duration-200
                                    `}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span
                                    className={`
                                        text-xs lg:text-sm font-medium lg:font-bold
                                        ${isActive
                                            ? isDev
                                                ? 'text-white'
                                                : 'text-orange-600'
                                            : isDev
                                                ? 'text-purple-100'
                                                : 'text-gray-500 group-hover:text-orange-500'
                                        }
                                        transition-colors duration-200
                                    `}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Dev Mode Indicator */}
                {isDev && (
                    <div className="px-3 pb-2">
                        <div className="text-center text-purple-200 text-[10px] font-medium">
                            Developer Mode
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
}
