'use client';

import { useRef, useEffect, ReactNode } from 'react';

interface ScrollRevealProps {
    children: ReactNode;
    width?: 'fit-content' | '100%';
    delay?: number;
}

export const ScrollReveal = ({ children, width = 'fit-content', delay = 0 }: ScrollRevealProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('reveal-visible');
                        entry.target.classList.remove('reveal-hidden');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        if (ref.current) {
            // Ensure delay is applied
            ref.current.style.transitionDelay = `${delay}ms`;
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [delay]);

    return (
        <div ref={ref} style={{ width }} className="reveal-hidden transition-all duration-1000 ease-out transform">
            {children}
        </div>
    );
};
