"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Activity, Play, Square, Info, RefreshCw, ChevronLeft, Zap } from 'lucide-react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';

import CameraController from '@/components/camera/CameraController';
import { extractRedChannelAverage } from '@/lib/video-processing/redChannelIsolation';
import { PPGExtractor } from '@/lib/signal-processing/ppgExtraction';
import { HeartRateDetector } from '@/lib/signal-processing/heartRateDetection';
import { GlucoseInference } from '@/lib/ml/inference';
import { saveMeasurement } from '@/lib/firebase/firestore';
import { getHeartRateConfig } from '@/lib/firebase/systemConfig';

import { useAuth } from '@/components/providers/AuthProvider';

export default function MeasurePage() {
    const { user } = useAuth();
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [signalValue, setSignalValue] = useState<number>(0);
    const [bpm, setBpm] = useState<number>(0);
    const [measurementProgress, setMeasurementProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("Siapkan jari di kamera");
    const [chartData, setChartData] = useState<{ val: number }[]>([]);
    const [resultData, setResultData] = useState<{ glucose: number } | null>(null);

    const glucoseInference = useRef<GlucoseInference | null>(null);
    const hrDetector = useRef<HeartRateDetector | null>(null);
    const ppgExtractor = useRef<PPGExtractor | null>(null);
    const signalBuffer = useRef<number[]>([]);
    const frameCounter = useRef(0); // For performance throttling

    useEffect(() => {
        // Parallel init for better performance
        const initializeAll = async () => {
            console.log("[MeasurePage] Starting parallel initialization...");

            // 1. Init ML/Signal instances
            glucoseInference.current = new GlucoseInference();
            hrDetector.current = new HeartRateDetector();
            ppgExtractor.current = new PPGExtractor();

            // 2. Parallel tasks
            await Promise.all([
                glucoseInference.current.predict({ ppgSignal: [], heartRate: 75 }).catch(() => { }), // Warmup
                getHeartRateConfig().then(config => {
                    if (hrDetector.current) hrDetector.current.updateConfig(config);
                })
            ]);

            console.log("[MeasurePage] Initialization complete");
        };

        initializeAll();
    }, []);

    const MAX_CHART_POINTS = 50;
    const MEASUREMENT_DURATION_SEC = 10;
    const FPS = 30;
    const TOTAL_FRAMES = MEASUREMENT_DURATION_SEC * FPS;

    const handleFrame = (canvas: HTMLCanvasElement) => {
        if (!isMeasuring || !ppgExtractor.current || !hrDetector.current) return;

        frameCounter.current += 1;

        // 1. Extract & Finger Detection
        const rgb = extractRedChannelAverage(canvas);
        const isFingerDetected = rgb.r > 20 && rgb.r > rgb.g * 1.1 && rgb.r > rgb.b * 1.1;

        if (!isFingerDetected) {
            if (statusMessage !== "Jari tidak terdeteksi") {
                setStatusMessage("Jari tidak terdeteksi");
            }
            return;
        }

        // 2. PPG Processing
        const ppgValue = ppgExtractor.current.process(rgb.r);

        // 3. Buffer for HR & ML
        signalBuffer.current.push(ppgValue);

        // 4. Analysis
        let currentBpm = bpm;
        let isStable = false;

        if (signalBuffer.current.length % 30 === 0 && signalBuffer.current.length > 60) {
            const hrResult = hrDetector.current.process(signalBuffer.current);
            if (hrResult.confidence > 50) {
                currentBpm = Math.round(hrResult.bpm);
                setBpm(currentBpm);
                isStable = hrResult.confidence > 75;
            }
        }

        const progress = Math.min((signalBuffer.current.length / TOTAL_FRAMES) * 100, 100);

        // === THROTTLED UI UPDATES ===
        if (frameCounter.current % 4 === 0 || progress >= 100) {
            setSignalValue(ppgValue);

            // Dynamic status based on quality
            const qualityMsg = progress < 30 ? "Menstabilkan sinyal..." :
                (isStable ? "Sinyal stabil, teruskan" : "Mengukur... jangan bergerak");

            setStatusMessage(qualityMsg);
            setMeasurementProgress(progress);

            setChartData(prev => {
                const newData = [...prev, { val: ppgValue }];
                if (newData.length > MAX_CHART_POINTS) return newData.slice(newData.length - MAX_CHART_POINTS);
                return newData;
            });
        }

        if (progress >= 100) {
            finishMeasurement();
        }
    };

    const startMeasurement = () => {
        if (!ppgExtractor.current) return;

        setIsMeasuring(true);
        setMeasurementProgress(0);
        setSignalValue(0);
        setBpm(0);
        setChartData([]);
        signalBuffer.current = [];
        ppgExtractor.current.reset();
        frameCounter.current = 0;
        setStatusMessage("Mendeteksi denyut...");
    };

    const stopMeasurement = () => {
        setIsMeasuring(false);
        setStatusMessage("Pengukuran dibatalkan");
    };

    const finishMeasurement = async () => {
        if (!glucoseInference.current) return;

        setIsMeasuring(false);
        setStatusMessage("Selesai! Menganalisis hasil...");

        const generateId = () => {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        };

        const inferenceResult = await glucoseInference.current.predict({
            ppgSignal: signalBuffer.current,
            heartRate: bpm > 0 ? bpm : 75
        });

        if (inferenceResult.isCalibrated) {
            await glucoseInference.current.learn(signalBuffer.current, inferenceResult.glucose);
        }

        const result = {
            id: generateId(),
            timestamp: Date.now(),
            glucose: inferenceResult.glucose,
            bpm: bpm > 0 ? bpm : 75,
            confidence: inferenceResult.confidence,
            rawPPG: [...signalBuffer.current],
            userId: user?.uid
        };

        try {
            await saveMeasurement(result);
        } catch (error) {
            console.error("Failed to save to Firestore:", error);
        }

        setResultData({ glucose: inferenceResult.glucose });
    };

    return (
        <div className="fixed inset-0 bg-black text-white overflow-hidden">
            {/* 1. Camera Layer (Background) */}
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
                {/* 
                    Fix for Mobile Aspect Ratio:
                    Object-cover ensures it fills the screen.
                    w-full h-full is critical.
                 */}
                <div className="w-full h-full relative">
                    <CameraController
                        onFrame={handleFrame}
                        width={300} // Processing res
                        height={300} // Processing res
                        facingMode="user"
                    />
                </div>
            </div>

            {/* Dark Gradient Overlay for Readability */}
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isMeasuring ? 'opacity-80' : 'opacity-60'} bg-gradient-to-b from-black/80 via-transparent to-black/90 z-10`} />

            {/* Flash Effect Overlay */}
            {isMeasuring && (
                <div className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-30 bg-white animate-pulse" />
            )}


            {/* 2. UI Layer (Z-50) */}
            <div className="absolute inset-0 z-50 flex flex-col p-6 safe-area-pt">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/dashboard" className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition">
                        <ChevronLeft size={24} className="text-white" />
                    </Link>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                        <Activity size={16} className={isMeasuring ? "text-orange-500 animate-pulse" : "text-slate-400"} />
                        <span className="text-sm font-medium text-white/90">
                            {isMeasuring ? "Recording..." : "Ready"}
                        </span>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    {/* Status Message Toast */}
                    <div className="mb-8 px-6 py-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl transition-all duration-300">
                        <p className="text-white font-medium flex items-center gap-2">
                            {isMeasuring && <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />}
                            {statusMessage}
                        </p>
                    </div>

                    {/* Stats Cards (Visible during measurement or if data exists) */}
                    <div className={`grid grid-cols-2 gap-4 w-full max-w-sm transition-all duration-500 ${isMeasuring || bpm > 0 ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
                        {/* BPM Card */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10 flex flex-col items-center">
                            <span className="text-xs text-white/60 uppercase tracking-widest font-bold mb-1">Heart Rate</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white tracking-tighter">{bpm > 0 ? bpm : '--'}</span>
                                <span className="text-xs text-white/60 font-medium">BPM</span>
                            </div>
                        </div>

                        {/* Signal Card */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10 flex flex-col items-center">
                            <span className="text-xs text-white/60 uppercase tracking-widest font-bold mb-1">Signal</span>
                            <div className="flex items-center gap-1 h-10">
                                {[1, 2, 3, 4, 5].map((bar) => (
                                    <div
                                        key={bar}
                                        className={`w-1.5 rounded-full transition-all duration-300 ${
                                            // Simple visualizer based on signal value amplitude
                                            Math.abs(signalValue) * 10 > bar ? 'bg-green-400 h-6' : 'bg-white/20 h-3'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Live Graph Overlay */}
                    {chartData.length > 0 && (
                        <div className="w-full max-w-sm h-32 mt-8 opacity-80 mix-blend-screen overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <Line
                                        type="monotone"
                                        dataKey="val"
                                        stroke="#FF6B35"
                                        strokeWidth={3}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="pb-32 w-full max-w-sm mx-auto z-[60]"> {/* Added pb-32 for BottomNav clearance and High Z-index */}
                    {!isMeasuring && !resultData ? (
                        <button
                            onClick={startMeasurement}
                            className="w-full relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                            <div className="relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all transform group-active:scale-[0.98]">
                                <Play className="w-6 h-6 fill-current" />
                                <span className="text-lg">Mulai Scan</span>
                            </div>
                        </button>
                    ) : isMeasuring ? (
                        <div className="relative w-full">
                            {/* Progress Bar background */}
                            <div className="absolute bottom-full mb-4 left-0 right-0 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-300 ease-linear"
                                    style={{ width: `${measurementProgress}%` }}
                                />
                            </div>

                            <button
                                onClick={stopMeasurement}
                                className="w-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                            >
                                <Square className="w-6 h-6 fill-current" />
                                <span>Batalkan</span>
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Result Modal Overlay */}
            {resultData && (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-xs text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-gradient-to-tr from-orange-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
                            <Activity className="w-10 h-10 text-white" strokeWidth={2.5} />
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900 mb-1">Selesai!</h3>
                        <p className="text-slate-500 mb-6 text-sm">Hasil pengukuran Anda</p>

                        <div className="mb-8 relative flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <span className="text-6xl font-extrabold text-[#D73535] tracking-tighter">
                                {resultData.glucose}
                            </span>
                            <span className="text-sm text-slate-400 font-bold uppercase tracking-wider mt-1">mg/dL Glucose</span>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link
                                href="/dashboard"
                                className="w-full bg-[#D73535] hover:bg-[#b02222] text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 transition-all"
                                onClick={() => setResultData(null)}
                            >
                                Lihat Dashboard
                            </Link>
                            <button
                                onClick={() => { setResultData(null); startMeasurement(); }}
                                className="w-full bg-transparent border border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Ukur Lagi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
