"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, Calendar, Settings, ChevronRight, Plus, Brain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getMeasurements } from '@/lib/firebase/firestore';

export default function DashboardPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [latest, setLatest] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getMeasurements();
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

        loadData();
    }, []);

    const getStatusColor = (val: number) => {
        if (val < 70) return 'text-yellow-600';
        if (val > 140) return 'text-orange-600';
        return 'text-green-600';
    };

    const getStatusText = (val: number) => {
        if (val < 70) return 'Rendah';
        if (val > 140) return 'Tinggi';
        return 'Normal';
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <header className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-10">
                <Link href="/" className="font-bold text-xl tracking-tight text-blue-900">
                    GlucoVision
                </Link>
                <div className="flex gap-2">
                    <Link href="/training" className="p-2 bg-blue-50 rounded-full text-blue-600 hover:bg-blue-100 transition flex items-center gap-2 px-3">
                        <Brain className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Lab</span>
                    </Link>
                    <Link href="/calibration" className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition">
                        <Settings className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Latest Result Card */}
                {latest ? (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Terakhir</span>
                            <span className="text-xs text-slate-400">{new Date(latest.timestamp).toLocaleTimeString()}</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="text-6xl font-extrabold text-slate-800 tracking-tighter">
                                {latest.glucose}
                            </div>
                            <span className="text-sm text-slate-400 font-medium mb-1">mg/dL</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold bg-opacity-10 ${getStatusColor(latest.glucose).replace('text-', 'bg-')} ${getStatusColor(latest.glucose)}`}>
                                {getStatusText(latest.glucose)}
                            </span>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                            <div className="text-center">
                                <span className="block text-xs text-slate-400 mb-1">Denyut Jantung</span>
                                <span className="block text-xl font-bold text-slate-700">{latest.bpm} <span className="text-xs font-normal">BPM</span></span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xs text-slate-400 mb-1">Akurasi AI</span>
                                <span className="block text-xl font-bold text-slate-700">{latest.confidence}%</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
                        <p className="text-slate-500 mb-4">Belum ada data pengukuran.</p>
                        <Link href="/measure" className="inline-flex items-center gap-2 text-blue-600 font-bold">
                            <Plus className="w-5 h-5" />
                            Mulai Sekarang
                        </Link>
                    </div>
                )}

                {/* Trend Chart */}
                {history.length > 1 && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 h-48 flex flex-col">
                        <span className="block text-sm font-medium text-slate-400 mb-4 ml-2">Tren Gula Darah</span>
                        <div className="flex-1 min-h-0 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[...history].reverse()}>
                                    <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        labelFormatter={() => ''}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="glucose"
                                        stroke="#2563EB"
                                        strokeWidth={3}
                                        dot={{ fill: '#2563EB', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <Link
                    href="/measure"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all"
                >
                    <Activity className="w-5 h-5" />
                    <span>Ukur Baru</span>
                </Link>

                {/* History List */}
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3 px-1">Riwayat</h3>
                    <div className="space-y-3">
                        {history.slice(0, 5).map((item: any) => (
                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-10 rounded-full ${getStatusColor(item.glucose).replace('text-', 'bg-')}`}></div>
                                    <div>
                                        <span className="block font-bold text-slate-700">{item.glucose} mg/dL</span>
                                        <span className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}
