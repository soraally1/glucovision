'use client';

import { useEffect, useRef, useState } from 'react';

interface CircularGalleryProps {
    items?: { image: string; alt: string }[];
}

export const CircularGallery = ({ items = [] }: CircularGalleryProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [angle, setAngle] = useState(0);

    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            setAngle(prev => (prev + 0.2) % 360);
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // Default placeholders if no items provided
    const displayItems = items.length > 0 ? items : [
        { image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', alt: 'User 1' },
        { image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop', alt: 'User 2' },
        { image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop', alt: 'User 3' },
        { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', alt: 'User 4' },
        { image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', alt: 'User 5' },
        { image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop', alt: 'User 6' },
    ];

    const radius = 140; // Reduced radius for better mobile fit
    const itemSize = 50;

    return (
        <div className="relative w-[320px] h-[320px] mx-auto flex items-center justify-center">
            {/* Central Pulsing Circle */}
            <div className="absolute w-32 h-32 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center animate-pulse">
                <div className="text-center">
                    <span className="block text-2xl font-bold text-orange-600">50k+</span>
                    <span className="text-xs text-orange-500 font-medium">Pengguna</span>
                </div>
            </div>

            {/* Rotating Ring */}
            <div ref={containerRef} className="absolute inset-0 rounded-full border border-slate-100">
                {displayItems.map((item, index) => {
                    const count = displayItems.length;
                    const theta = ((360 / count) * index + angle) * (Math.PI / 180);
                    const x = radius * Math.cos(theta);
                    const y = radius * Math.sin(theta);

                    return (
                        <div
                            key={index}
                            className="absolute w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg transition-transform hover:scale-125 hover:z-10"
                            style={{
                                left: `calc(50% + ${x}px - ${itemSize / 2}px)`,
                                top: `calc(50% + ${y}px - ${itemSize / 2}px)`,
                            }}
                        >
                            <img
                                src={item.image}
                                alt={item.alt}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
