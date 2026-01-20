'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Camera, AlertCircle, ChevronLeft, Upload, Loader2, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { analyzeWound, WoundAnalysisResult } from '@/app/actions/analyzeWound';
import TopNav from '@/components/layout/TopNav';
import CameraController from '@/components/camera/CameraController';

export default function WoundCheckPage() {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<WoundAnalysisResult | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCapture = (canvas: HTMLCanvasElement) => {
        const image = canvas.toDataURL('image/jpeg');
        setCapturedImage(image);
        setCameraActive(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCapturedImage(reader.result as string);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = async () => {
        if (!capturedImage) return;
        setIsAnalyzing(true);
        try {
            const res = await analyzeWound(capturedImage);
            setResult(res);
        } catch (error) {
            console.error(error);
            alert('Gagal menganalisis. Coba lagi.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <TopNav />

            {/* Main Content */}
            <main className="flex-1 w-full max-w-md mx-auto pt-24 pb-20 px-6">

                {/* Header Section */}
                {!cameraActive && !capturedImage && (
                    <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-red-50 rounded-full">
                            <ShieldAlert className="w-10 h-10 text-[#D73535]" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Cek Luka Kaki</h1>
                        <p className="text-slate-500 leading-relaxed">
                            Deteksi dini risiko komplikasi diabetes pada kaki Anda dengan bantuan AI.
                        </p>
                    </div>
                )}

                {/* Workflow : Initial State */}
                {!capturedImage && !cameraActive && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <button
                            onClick={() => setCameraActive(true)}
                            className="w-full py-4 bg-gradient-to-r from-[#D73535] to-[#FF5E5E] hover:from-[#b02222] hover:to-[#e04040] text-white font-bold rounded-2xl shadow-xl shadow-red-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <Camera className="w-6 h-6" />
                            Ambil Foto Luka
                        </button>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-4 bg-white text-slate-600 font-semibold rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 border border-slate-100"
                        >
                            <Upload className="w-5 h-5" />
                            Upload dari Galeri
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                        {/* Simple Alert */}
                        <div className="mt-8 p-4 rounded-xl bg-orange-50 border border-orange-100 flex gap-3 text-left">
                            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-orange-800 leading-snug">
                                <span className="font-bold block mb-1">Penting:</span>
                                Periksa telapak kaki setiap hari jika sering terasa kaku atau mati rasa.
                            </p>
                        </div>
                    </div>
                )}

                {/* Camera View - Fullscreen Immersive */}
                {cameraActive && (
                    <div className="fixed inset-0 z-[500] bg-black">
                        {/* Cam Feed */}
                        <div className="absolute inset-0">
                            <CameraController
                                onFrame={(canvas) => { }}
                                width={720}
                                height={1280}
                                facingMode="environment"
                            />
                        </div>

                        {/* Minimalist Overlay Guides (Optional, keeps it clean) */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] border border-white/30 rounded-3xl"></div>
                            <div className="absolute top-8 left-0 right-0 text-center">
                                <span className="px-4 py-2 rounded-full bg-black/40 text-white text-sm font-medium backdrop-blur-sm">
                                    Posisikan luka di dalam kotak
                                </span>
                            </div>
                        </div>

                        {/* Floating Controls */}
                        <div className="absolute bottom-0 inset-x-0 pb-12 pt-24 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-12">
                            <button
                                onClick={() => setCameraActive(false)}
                                className="p-4 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <button
                                onClick={() => {
                                    const video = document.querySelector('video');
                                    if (video) {
                                        const canvas = document.createElement('canvas');
                                        canvas.width = video.videoWidth;
                                        canvas.height = video.videoHeight;
                                        // Draw exactly what is seen (object-cover crop might need handling if precise, 
                                        // but for now capturing full frame is safer for analysis)
                                        canvas.getContext('2d')?.drawImage(video, 0, 0);
                                        handleCapture(canvas);
                                    }
                                }}
                                className="w-20 h-20 rounded-full bg-white border-4 border-white/50 shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
                            >
                                <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-300" />
                            </button>

                            {/* Placeholder for balance or Gallery shortcut if needed */}
                            <div className="w-14" />
                        </div>
                    </div>
                )}

                {/* Analysis UI */}
                {capturedImage && !cameraActive && !result && (
                    <div className="space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[3/4]">
                            <img src={capturedImage} alt="Preview" className="w-full h-full object-cover" />

                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex gap-3">
                                    <button
                                        onClick={runAnalysis}
                                        disabled={isAnalyzing}
                                        className="flex-1 py-3.5 bg-[#D73535] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
                                        {isAnalyzing ? 'Menganalisis...' : 'Analisis Luka'}
                                    </button>
                                    <button
                                        onClick={() => setCapturedImage(null)}
                                        className="py-3.5 px-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-sm text-slate-400">
                            Pastikan foto luka terlihat jelas dan fokus.
                        </p>
                    </div>
                )}

                {/* Result - Ultra Clean Typography */}
                {result && (
                    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500">
                        {/* Header Result */}
                        <div className="text-center">
                            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Hasil Analisis AI</p>
                            <h2 className={`text-4xl font-black leading-tight mb-2 ${result.riskLevel === 'Critical' ? 'text-red-600' :
                                result.riskLevel === 'High' ? 'text-orange-600' :
                                    result.riskLevel === 'Medium' ? 'text-yellow-600' :
                                        'text-green-600'
                                }`}>
                                {result.riskLevel === 'Low' ? 'Kondisi Baik' :
                                    result.riskLevel === 'Medium' ? 'Waspada' :
                                        result.riskLevel === 'High' ? 'Risiko Tinggi' : 'KRITIS'}
                            </h2>
                            <p className="text-slate-500 font-medium">
                                {result.riskLevel === 'Low' ? 'Tidak ditemukan tanda bahaya.' : 'Ditemukan indikasi abnormalitas.'}
                            </p>
                        </div>

                        {/* Signs Detected - Cloud Layout */}
                        <div className="text-center">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Deteksi Visual</h3>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {Object.entries(result.signs).some(([_, detected]) => detected) ? (
                                    Object.entries(result.signs).map(([key, detected]) => detected && (
                                        <span key={key} className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold">
                                            {key === 'redness' ? '🔴 Kemerahan' :
                                                key === 'swelling' ? '🔵 Bengkak' :
                                                    key === 'pus' ? '⚪ Bernanah' :
                                                        key === 'blackening' ? '⚫ Jaringan Mati' : '⭕ Luka Terbuka'}
                                        </span>
                                    ))
                                ) : (
                                    <span className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                                        ✨ Kulit tampak sehat
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Analysis Text */}
                        <div className="text-center max-w-xs mx-auto">
                            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Detail</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {result.analysis}
                            </p>
                        </div>

                        {/* Recommendation - Minimalist Highlight */}
                        <div className="text-center pt-6 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Rekomendasi</h3>
                            <p className="text-lg font-medium text-slate-800 leading-relaxed mb-6">
                                "{result.recommendation}"
                            </p>

                            {result.riskLevel !== 'Low' && (
                                <p className="text-xs text-red-500 font-semibold bg-red-50 inline-block px-3 py-1 rounded-lg">
                                    ⚠️ Perhatian: Hasil ini bukan diagnosis medis.
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => { setCapturedImage(null); setResult(null); }}
                            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                        >
                            Selesai & Cek Lagi
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
}
