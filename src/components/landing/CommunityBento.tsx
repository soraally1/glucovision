'use client';

import React from 'react';

const users = [
    { image: '/foto1.webp', alt: 'Community Member 1' },
    { image: '/foto2.webp', alt: 'Community Member 2' },
    { image: '/foto3.webp', alt: 'Community Member 3' },
];

export const CommunityBento = () => {
    return (
        <div className="w-full max-w-md mx-auto aspect-square p-4">
            <div className="grid grid-cols-3 grid-rows-3 gap-3 w-full h-full">

                {/* Large Stats Block (2x2) */}
                <div className="col-span-2 row-span-2 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 flex flex-col items-center justify-center border border-orange-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    {/* Decorative Blob */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200 rounded-bl-full opacity-50 transition-transform group-hover:scale-110" />

                    <span className="text-5xl font-extrabold text-[#D73535] mb-1 z-10">50k+</span>
                    <span className="text-sm font-semibold text-orange-600/80 uppercase tracking-wide z-10">Pengguna Aktif</span>
                </div>

                {/* Right Vertical Image (Foto 1) - Spans 2 rows */}
                <div className="col-span-1 row-span-2 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative group">
                    <img src={users[0].image} alt={users[0].alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>

                {/* Bottom Left Image (Foto 2) */}
                <div className="col-span-1 row-span-1 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative group">
                    <img src={users[1].image} alt={users[1].alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>

                {/* Bottom Right Horizontal Image (Foto 3) - Spans 2 cols */}
                <div className="col-span-2 row-span-1 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative group">
                    <img src={users[2].image} alt={users[2].alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>

            </div>

            {/* Context Text */}
            <div className="text-center mt-6">
                <p className="font-bold text-[#D73535]">Bergabung dengan Komunitas</p>
                <p className="text-sm text-slate-500">Ribuan pengguna telah beralih ke non-invasif</p>
            </div>
        </div>
    );
};
