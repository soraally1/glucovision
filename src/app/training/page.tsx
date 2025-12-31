"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Upload, Play, Brain, CheckCircle2, AlertCircle, Activity, Info } from 'lucide-react';
import TopNav from '@/components/layout/TopNav';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import { extractRedChannelAverage } from '@/lib/video-processing/redChannelIsolation';
import { PPGExtractor } from '@/lib/signal-processing/ppgExtraction';
import { GlucoseInference } from '@/lib/ml/inference';
import { saveMeasurement } from '@/lib/firebase/firestore';
import DevGuard from '@/components/guards/DevGuard';

import { useAuth } from '@/components/providers/AuthProvider';

export default function TrainingPage() {
    return (
        <DevGuard>
            <TrainingContent />
        </DevGuard>
    );
}

function TrainingContent() {
    const { user } = useAuth();
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [actualGlucose, setActualGlucose] = useState<string>("");
    const [actualBpm, setActualBpm] = useState<string>(""); // New BPM input
    const [extractedSignal, setExtractedSignal] = useState<number[]>([]);
    const [chartData, setChartData] = useState<{ val: number }[]>([]);
    const [status, setStatus] = useState<'idle' | 'processing' | 'ready' | 'trained' | 'error'>('idle');
    const [message, setMessage] = useState("");

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ppgExtractor = useRef(new PPGExtractor());
    const glucoseInference = useRef(new GlucoseInference());

    // Clean up video URL
    useEffect(() => {
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
        };
    }, [videoUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoUrl(url);
            setExtractedSignal([]);
            setChartData([]);
            setProgress(0);
            setStatus('idle');
            setMessage("");
        }
    };

    const processVideo = async () => {
        if (!videoRef.current || !canvasRef.current || !videoUrl) return;

        setIsProcessing(true);
        setStatus('processing');
        setMessage("Mengekstrak sinyal dari video...");

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) return;

        ppgExtractor.current.reset();
        const signals: number[] = [];
        const uiSignals: { val: number }[] = [];

        video.currentTime = 0;
        await new Promise(r => video.oncanplay = r);

        const duration = video.duration;
        const frameStep = 1 / 30; // 30 FPS
        let currentTime = 0;

        while (currentTime < duration) {
            video.currentTime = currentTime;
            await new Promise(r => video.onseeked = r);

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const rgb = extractRedChannelAverage(canvas);
            const ppg = ppgExtractor.current.process(rgb.r);

            signals.push(ppg);
            if (signals.length % 2 === 0) { // Downsample for UI performance
                uiSignals.push({ val: ppg });
            }

            currentTime += frameStep;
            setProgress(Math.round((currentTime / duration) * 100));
        }

        setExtractedSignal(signals);
        setChartData(uiSignals);
        setIsProcessing(false);
        setStatus('ready');
        setMessage("Sinyal berhasil diekstrak. Silakan masukkan nilai glukosa asli.");
    };

    const runTraining = async () => {
        if (!actualGlucose || extractedSignal.length === 0) {
            setMessage("Masukkan nilai glukosa asli terlebih dahulu!");
            return;
        }

        try {
            setStatus('processing');
            setMessage("Melatih Neural Network...");

            const glucoseNum = parseFloat(actualGlucose);
            const bpmNum = actualBpm ? parseFloat(actualBpm) : 75; // Use user input or default

            // 1. Update AI Model (Offline & Cloud weights)
            await glucoseInference.current.learn(extractedSignal, glucoseNum);

            // 2. Save to Firestore Dataset (Raw Data)
            try {
                await saveMeasurement({
                    timestamp: Date.now(),
                    glucose: glucoseNum,
                    bpm: bpmNum,
                    confidence: 100,
                    rawPPG: extractedSignal,
                    userId: user?.uid
                });
                console.log("Video sample added to cloud dataset.");
            } catch (fsErr) {
                console.warn("Failed to save sample to Firestore, but AI was trained:", fsErr);
            }

            setStatus('trained');
            setMessage("Model berhasil diperbarui dengan data video ini!");
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage("Gagal melatih model. Coba lagi.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <TopNav />

            <main className="flex-1 p-6 space-y-6 max-w-lg mx-auto w-full pt-20 pb-28">

                {/* Info Card */}
                <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-100">
                    <div className="flex gap-4 items-start">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Info className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg mb-1">Upload Rekaman Jari</h2>
                            <p className="text-emerald-500 text-sm leading-relaxed brightness-150">
                                Gunakan video rekaman jari Anda yang menutupi kamera & flash untuk melatih AI secara offline.
                            </p>
                        </div>
                    </div>
                </div>

                {/* File Upload Section */}
                <div className="bg-white rounded-[2rem] p-8 border border-emerald-50 shadow-sm flex flex-col items-center text-center">
                    {!videoUrl ? (
                        <label className="w-full cursor-pointer group">
                            <div className="border-2 border-dashed border-slate-200 group-hover:border-emerald-400 group-hover:bg-emerald-50 transition-all rounded-3xl p-10 flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 group-hover:scale-110 transition-all">
                                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-600" />
                                </div>
                                <span className="font-bold text-slate-700 block mb-1">Pilih File Video</span>
                                <span className="text-xs text-slate-400">MP4 disarankan (max 50MB)</span>
                            </div>
                            <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} disabled={isProcessing} />
                        </label>
                    ) : (
                        <div className="w-full space-y-4">
                            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-inner relative">
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    className="w-full h-full object-contain"
                                    muted
                                />
                                {status === 'processing' && (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-6">
                                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden max-w-[200px] mb-4">
                                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <span className="text-sm font-bold">{progress}%</span>
                                    </div>
                                )}
                            </div>

                            {status === 'idle' && (
                                <button
                                    onClick={processVideo}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    <span>Ekstrak Sinyal</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Training Form */}
                {status !== 'idle' && (
                    <div className="bg-white rounded-[2rem] p-8 border border-emerald-50 shadow-sm space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Extracted Signal Chart */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Ekstraksi Sinyal</span>
                                {status === 'ready' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                            </div>
                            <div className="h-24 w-full bg-emerald-50 rounded-2xl p-2 border border-emerald-100/30">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <YAxis hide domain={['auto', 'auto']} />
                                        <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Input Label */}
                        <div className="space-y-4 pt-4 border-t border-slate-50">

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Gula Darah (mg/dL)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="115"
                                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                            value={actualGlucose}
                                            onChange={(e) => setActualGlucose(e.target.value)}
                                            disabled={status === 'trained' || status === 'processing'}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-300 text-sm">mg/dL</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Detak Jantung (BPM)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="80"
                                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                            value={actualBpm}
                                            onChange={(e) => setActualBpm(e.target.value)}
                                            disabled={status === 'trained' || status === 'processing'}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-300 text-sm">BPM</span>
                                    </div>
                                </div>
                            </div>

                            {message && (
                                <div className={`flex items-start gap-3 p-4 rounded-xl text-sm ${status === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                                    status === 'trained' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                    <div className="mt-0.5">
                                        {status === 'error' ? <AlertCircle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                    </div>
                                    <p className="font-medium text-xs leading-relaxed">{message}</p>
                                </div>
                            )}

                            {status === 'ready' && (
                                <button
                                    onClick={runTraining}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Brain className="w-5 h-5" />
                                    <span>Latih AI</span>
                                </button>
                            )}

                            {(status === 'trained' || status === 'error') && (
                                <button
                                    onClick={() => {
                                        setVideoUrl(null);
                                        setExtractedSignal([]);
                                        setChartData([]);
                                        setActualGlucose("");
                                        setActualBpm("");
                                        setStatus('idle');
                                        setMessage("");
                                    }}
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition-all"
                                >
                                    Latih Video Lain
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Hidden Canvas for Processing */}
                <canvas
                    ref={canvasRef}
                    width={100}
                    height={100}
                    className="hidden"
                />
            </main>
        </div>
    );
}
