"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Database, CheckCircle } from 'lucide-react';
import { DataCollector } from '@/lib/ml/dataCollection';

export default function CalibrationPage() {
    const [glucoseInput, setGlucoseInput] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = async () => {
        if (!glucoseInput) return;

        // In a real flow, we would pass the *last recorded signal* here via Context or State Manager
        // For this standalone page demo, we mock the signal
        const mockSignal = Array(300).fill(0).map(() => Math.random());

        const collector = new DataCollector();
        await collector.saveExample({
            ppgSignal: mockSignal,
            heartRate: 75,
            glucoseLabel: parseFloat(glucoseInput),
            deviceInfo: navigator.userAgent
        });

        setIsSaved(true);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <header className="px-6 py-4 flex items-center gap-4 border-b border-gray-100">
                <Link href="/" className="p-2 -ml-2 hover:bg-slate-50 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-slate-700" />
                </Link>
                <span className="font-bold text-lg text-slate-800">Kalibrasi AI</span>
            </header>

            <main className="flex-1 p-6 flex flex-col gap-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm leading-relaxed">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Bantu AI Belajar
                    </p>
                    Masukkan hasil gula darah dari alat medis Anda (prick test) untuk melatih AI agar lebih akurat mengenali pola tubuh Anda.
                </div>

                {!isSaved ? (
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Kadar Gula Darah (mg/dL)
                            </label>
                            <input
                                type="number"
                                value={glucoseInput}
                                onChange={(e) => setGlucoseInput(e.target.value)}
                                className="w-full text-3xl font-bold p-4 text-center border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                placeholder="0"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={!glucoseInput}
                            className="w-full bg-slate-900 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 mt-4"
                        >
                            <Save className="w-5 h-5" />
                            <span>Simpan Kalibrasi</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Data Tersimpan!</h3>
                        <p className="text-slate-500 mt-2">
                            Terima kasih. Model AI akan diperbarui secara otomatis saat perangkat sedang di-charge.
                        </p>

                        <Link href="/" className="mt-8 text-blue-600 font-medium hover:underline">
                            Kembali ke Beranda
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
