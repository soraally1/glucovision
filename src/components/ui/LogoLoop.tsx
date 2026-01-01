'use client';

import React from 'react';

interface LogoLoopProps {
    items: React.ReactNode[];
    direction?: 'left' | 'right';
    speed?: 'slow' | 'normal' | 'fast';
}

export const LogoLoop = ({ items, direction = 'left', speed = 'normal' }: LogoLoopProps) => {
    const duration = {
        slow: '60s',
        normal: '30s',
        fast: '15s',
    }[speed];

    return (
        <div className="flex overflow-hidden w-full relative group mask-gradient-x">
            {/* Mask optimized for white/light backgrounds */}
            <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />

            <div
                className={`flex min-w-full shrink-0 gap-8 py-4 items-center justify-center animate-loop-${direction} group-hover:pause`}
                style={{ animationDuration: duration }}
            >
                {items.map((item, idx) => (
                    <div key={idx} className="flex-shrink-0 transition-opacity duration-300 hover:opacity-80">
                        {item}
                    </div>
                ))}
            </div>
            <div
                className={`flex min-w-full shrink-0 gap-8 py-4 items-center justify-center animate-loop-${direction} group-hover:pause ml-8`}
                aria-hidden="true"
                style={{ animationDuration: duration }}
            >
                {items.map((item, idx) => (
                    <div key={`dup-${idx}`} className="flex-shrink-0 transition-opacity duration-300 hover:opacity-80">
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
};
