"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Activity, Calendar, ChevronRight, Plus, TrendingUp, TrendingDown, Heart, Target, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getMeasurements } from '@/lib/firebase/firestore';
import TopNav from '@/components/layout/TopNav';

export default function DashboardPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [latest, setLatest] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                const data = await getMeasurements(50, user.uid);
                setHistory(data);
                if (data.length > 0) {
                    setLatest(data[0]);
                }
            } catch (error) {
                console.error("Failed to load history:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) loadData();
    }, [user]);

    const getStatusColor = (val: number) => {
        if (val < 70) return 'text-yellow-600';
        if (val > 140) return 'text-red-600';
        return 'text-green-600';
    };

    const getStatusText = (val: number) => {
        if (val < 70) return 'Rendah';
        if (val > 140) return 'Tinggi';
        return 'Normal';
    };

    const getStatusBorder = (val: number) => {
        if (val < 70) return 'border-yellow-200';
        if (val > 140) return 'border-red-200';
        return 'border-green-200';
    };

    // Calculate stats
    const avgGlucose = history.length > 0
        ? Math.round(history.reduce((sum, item) => sum + item.glucose, 0) / history.length)
        : 0;

    const trend = history.length >= 2
        ? history[0].glucose - history[1].glucose
        : 0;

    const normalCount = history.filter(item => item.glucose >= 70 && item.glucose <= 140).length;
    const normalPercentage = history.length > 0 ? Math.round((normalCount / history.length) * 100) : 0;

    return (
        <div className="flex flex-col h-full bg-white">
            <TopNav />

            <main className="flex-1 overflow-y-auto p-4 pt-24 md:p-6 md:pt-24 lg:p-8 lg:pt-24 pb-32 max-w-6xl mx-auto w-full">

                {/* Header */}
                <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Dashboard</h1>
                        <p className="text-slate-500 text-sm md:text-base">Monitor kesehatan Anda</p>
                    </div>
                    <Link
                        href="/measure"
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Ukur Sekarang
                    </Link>
                </div>

                {latest ? (
                    <>
                        {/* Latest Reading */}
                        <div className={`mb-8 p-8 border-l-4 ${getStatusBorder(latest.glucose)} bg-slate-50`}>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Pembacaan Terakhir</p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(latest.timestamp).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <span className={`px-4 py-1 border ${getStatusColor(latest.glucose).replace('text-', 'border-')} ${getStatusColor(latest.glucose)} text-sm font-semibold`}>
                                    {getStatusText(latest.glucose)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* Main Reading */}
                                <div className="lg:col-span-1">
                                    <div className="text-6xl font-bold text-slate-900 mb-2">
                                        {latest.glucose}
                                    </div>
                                    <p className="text-slate-500 mb-3">mg/dL</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        {trend > 0 ? (
                                            <><TrendingUp className="w-4 h-4 text-red-500" /> +{trend}</>
                                        ) : trend < 0 ? (
                                            <><TrendingDown className="w-4 h-4 text-green-500" /> {trend}</>
                                        ) : (
                                            <><Activity className="w-4 h-4" /> Stabil</>
                                        )}
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="lg:col-span-3 grid grid-cols-3 gap-6">
                                    <div className="border-l-2 border-slate-200 pl-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Heart className="w-4 h-4 text-red-500" />
                                            <span className="text-xs text-slate-500 uppercase">Denyut Jantung</span>
                                        </div>
                                        <div className="text-3xl font-bold text-slate-900">{latest.bpm}</div>
                                        <span className="text-sm text-slate-500">BPM</span>
                                    </div>

                                    <div className="border-l-2 border-slate-200 pl-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="w-4 h-4 text-blue-500" />
                                            <span className="text-xs text-slate-500 uppercase">Rata-rata</span>
                                        </div>
                                        <div className="text-3xl font-bold text-slate-900">{avgGlucose}</div>
                                        <span className="text-sm text-slate-500">mg/dL</span>
                                    </div>

                                    <div className="border-l-2 border-slate-200 pl-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            <span className="text-xs text-slate-500 uppercase">Normal</span>
                                        </div>
                                        <div className="text-3xl font-bold text-slate-900">{normalPercentage}%</div>
                                        <span className="text-sm text-slate-500">Range</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart & Insights */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Chart */}
                            <div className="lg:col-span-2">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Tren 7 Hari</h2>
                                {history.length > 1 ? (
                                    <div className="h-64 border border-slate-200 p-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={[...history].reverse().slice(-7)}>
                                                <XAxis
                                                    dataKey="timestamp"
                                                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    stroke="#94a3b8"
                                                    style={{ fontSize: '12px' }}
                                                />
                                                <YAxis
                                                    domain={[60, 160]}
                                                    stroke="#94a3b8"
                                                    style={{ fontSize: '12px' }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '4px',
                                                        padding: '8px'
                                                    }}
                                                    labelFormatter={(timestamp) => new Date(timestamp).toLocaleString('id-ID')}
                                                    formatter={(value: any) => [`${value} mg/dL`, 'Gula Darah']}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="glucose"
                                                    stroke="#f97316"
                                                    strokeWidth={2}
                                                    dot={{ fill: '#f97316', r: 4 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-64 border border-slate-200 flex items-center justify-center">
                                        <p className="text-slate-400">Butuh lebih banyak data</p>
                                    </div>
                                )}
                            </div>

                            {/* Insights */}
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Insight</h2>
                                <div className="space-y-4">
                                    <div className="border-l-4 border-green-500 pl-4 py-2">
                                        <h3 className="font-semibold text-slate-900 mb-1">Kadar Gula {getStatusText(latest.glucose)}</h3>
                                        <p className="text-sm text-slate-600">
                                            {latest.glucose >= 70 && latest.glucose <= 140
                                                ? "Pertahankan pola hidup sehat Anda"
                                                : latest.glucose < 70
                                                    ? "Konsumsi makanan berkarbohidrat"
                                                    : "Kurangi asupan gula"}
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                                        <h3 className="font-semibold text-slate-900 mb-1">Denyut Jantung</h3>
                                        <p className="text-sm text-slate-600">
                                            {latest.bpm >= 60 && latest.bpm <= 100
                                                ? "Denyut jantung normal"
                                                : "Konsultasi jika sering abnormal"}
                                        </p>
                                    </div>

                                    <Link href="/sugar-visualizer" className="block border border-slate-200 hover:border-orange-500 p-4 transition-colors">
                                        <h3 className="font-semibold text-slate-900 mb-1">Cek Gula Makanan</h3>
                                        <p className="text-sm text-slate-600">Scan produk dengan AI →</p>
                                    </Link>

                                    <Link href="/wound-check" className="block border border-slate-200 hover:border-blue-500 p-4 transition-colors relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <ShieldAlert className="w-12 h-12 text-blue-600" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                                            Cek Luka Kaki <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded font-bold">BARU</span>
                                        </h3>
                                        <p className="text-sm text-slate-600">Skrining luka diabetes →</p>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* History */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-900">Riwayat</h2>
                                <Link href="/history" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                                    Lihat Semua →
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {history.slice(0, 5).map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 border border-slate-200 hover:border-slate-300 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-1 h-12 ${getStatusColor(item.glucose).replace('text-', 'bg-')}`}></div>
                                            <div>
                                                <span className="font-semibold text-slate-900">{item.glucose} <span className="text-sm font-normal text-slate-500">mg/dL</span></span>
                                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(item.timestamp).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 border ${getStatusColor(item.glucose).replace('text-', 'border-')} ${getStatusColor(item.glucose)} text-xs font-semibold`}>
                                                {getStatusText(item.glucose)}
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-slate-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 border border-dashed border-slate-300">
                        <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Belum Ada Data</h3>
                        <p className="text-slate-500 mb-6">
                            Mulai dengan melakukan pengukuran pertama
                        </p>
                        <Link href="/measure" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors">
                            <Plus className="w-5 h-5" />
                            Mulai Ukur
                        </Link>
                    </div>
                )}

            </main>
        </div>
    );
}

