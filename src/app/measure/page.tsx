"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Activity, Play, Square, Info, RefreshCw } from 'lucide-react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import TopNav from '@/components/layout/TopNav';

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

    const glucoseInference = useRef(new GlucoseInference());
    const hrDetector = useRef(new HeartRateDetector());
    const ppgExtractor = useRef(new PPGExtractor()); // Fix: Add missing ppgExtractor ref based on previous file read
    const signalBuffer = useRef<number[]>([]);

    useEffect(() => {
        // Initialize logic if needed
        glucoseInference.current = new GlucoseInference();

        // Fetch AI Config from Cloud
        getHeartRateConfig().then(config => {
            console.log("Applied Heart Rate Config:", config);
            hrDetector.current.updateConfig(config);
        });
    }, []);

    const MAX_CHART_POINTS = 50;
    const MEASUREMENT_DURATION_SEC = 10; // Match model input: 10s * 30fps = 300 frames
    const FPS = 30;
    const TOTAL_FRAMES = MEASUREMENT_DURATION_SEC * FPS;

    const handleFrame = (canvas: HTMLCanvasElement) => {
        if (!isMeasuring) return;

        // 1. Extract & Finger Detection
        const rgb = extractRedChannelAverage(canvas);
        // Simple red dominance check - adjusted threshold
        const isFingerDetected = rgb.r > 20 && rgb.r > rgb.g * 1.1 && rgb.r > rgb.b * 1.1;

        if (!isFingerDetected) {
            setStatusMessage("Letakkan jari menutupi kamera & flash");
            // Keep running but don't record progress if finger lost? 
            // For UX, maybe just pause progress
            return;
        }

        setStatusMessage("Mengukur... Jangan gerak");

        // 2. PPG Processing
        const ppgValue = ppgExtractor.current.process(rgb.r);

        // Update State for UI
        setSignalValue(ppgValue);

        // Update Chart Data (Keep it performant)
        setChartData(prev => {
            const newData = [...prev, { val: ppgValue }];
            if (newData.length > MAX_CHART_POINTS) return newData.slice(newData.length - MAX_CHART_POINTS);
            return newData;
        });

        // 3. Buffer for HR & ML
        signalBuffer.current.push(ppgValue);

        // 4. Analysis (every 30 frames / 1 sec update)
        if (signalBuffer.current.length % 30 === 0 && signalBuffer.current.length > 60) {
            const hrResult = hrDetector.current.process(signalBuffer.current);
            if (hrResult.confidence > 50) {
                setBpm(Math.round(hrResult.bpm));
            }
        }

        // 5. Progress
        // Only increment progress if finger detected
        const progress = Math.min((signalBuffer.current.length / TOTAL_FRAMES) * 100, 100);
        setMeasurementProgress(progress);

        if (progress >= 100) {
            finishMeasurement();
        }
    };

    const startMeasurement = () => {
        setIsMeasuring(true);
        setMeasurementProgress(0);
        setSignalValue(0);
        setBpm(0);
        setChartData([]);
        signalBuffer.current = [];
        ppgExtractor.current.reset();
        setStatusMessage("Mendeteksi denyut...");
    };

    const stopMeasurement = () => {
        setIsMeasuring(false);
        setStatusMessage("Pengukuran dibatalkan");
    };

    const finishMeasurement = async () => {
        setIsMeasuring(false);
        setStatusMessage("Selesai! Menganalisis hasil...");

        // Robust ID generation for non-secure contexts
        const generateId = () => {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        };

        // Run AI Inference
        const inferenceResult = await glucoseInference.current.predict({
            ppgSignal: signalBuffer.current,
            heartRate: bpm > 0 ? bpm : 75
        });

        // Continuous Learning:
        // As requested, we use the test data to train the model to improve accuracy.
        // In a real scenario, we would ask the user to confirm/calibrate first.
        // Here we assume the inference (or a calibrated version of it) is the "truth" for self-training mechanism demo.
        // To prevent drift, in production we would strictly use CalibrationPage data.
        // For this task, we enable the *mechanism*.
        if (inferenceResult.isCalibrated) {
            // Only train if we have high confidence or it was a calibrated result
            await glucoseInference.current.learn(signalBuffer.current, inferenceResult.glucose);
        }

        const result = {
            id: generateId(), // Firestore will generate its own ID too, but keeping this for internal consistency if needed
            timestamp: Date.now(),
            glucose: inferenceResult.glucose,
            bpm: bpm > 0 ? bpm : 75,
            confidence: inferenceResult.confidence,
            rawPPG: [...signalBuffer.current], // Save raw data for Dataset!
            userId: user?.uid // Link to User
        };

        // Save to Firestore (Now serves as Personal & Dataset Collector)
        try {
            await saveMeasurement(result);
            console.log("Dataset updated with new sample.");
        } catch (error) {
            console.error("Failed to save to Firestore:", error);
        }

        // Show result modal instead of redirecting immediately
        setResultData({ glucose: inferenceResult.glucose });
    };

    return (
        <div className={`flex flex-col h-full relative transition-colors duration-500 ${isMeasuring ? 'bg-white' : 'bg-slate-50'}`}>
            <TopNav />

            <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col gap-4 overflow-y-auto pt-20 pb-28 max-w-2xl mx-auto w-full">

                {/* Status Card */}
                <div className={`p-4 rounded-xl border ${isMeasuring ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'} transition-colors shadow-sm`}>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Info className={`w-5 h-5 ${isMeasuring ? 'text-orange-600' : 'text-slate-500'}`} />
                            {isMeasuring && <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                            </span>}
                        </div>
                        <p className={`font-medium ${isMeasuring ? 'text-orange-800' : 'text-slate-700'} text-sm`}>
                            {statusMessage}
                        </p>
                    </div>
                </div>

                {/* Camera Viewport - Enlarger for Visual Clarity & Front Camera Usage */}
                <div className={`w-full aspect-square md:aspect-[4/3] max-w-[400px] md:max-w-[500px] relative rounded-3xl overflow-hidden shadow-2xl border-4 ${isMeasuring ? 'border-orange-400 ring-4 ring-orange-100' : 'border-slate-200'} bg-black mx-auto transition-all duration-500 transform ${isMeasuring ? 'scale-[1.02]' : 'scale-100'}`}>
                    <CameraController
                        onFrame={handleFrame}
                        width={300}
                        height={300}
                        facingMode="user" // Use front camera as requested
                    />

                    {/* High Brightness Mode Overlay (Screen Flash) */}
                    {isMeasuring && (
                        <div className="absolute inset-0 border-[40px] border-white pointer-events-none z-10 opacity-100 mix-blend-overlay"></div>
                    )}

                    {/* Progress Overlay */}
                    {isMeasuring && (
                        <div className="absolute bottom-0 left-0 h-2 bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-100 shadow-[0_-2px_10px_rgba(255,162,64,0.6)]" style={{ width: `${measurementProgress}%` }}></div>
                    )}
                </div>

                {/* Brightness Helper Text */}
                <p className="text-center text-xs text-slate-400 mt-2 mb-2">
                    {isMeasuring ? "Layar akan menjadi terang untuk membantu pencahayaan" : "Pastikan wajah/jari mendapat cahaya cukup"}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* HR Display */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center min-h-[100px] shadow-sm">
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Denyut Jantung</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-800">{bpm > 0 ? bpm : '--'}</span>
                            <span className="text-sm text-slate-500 font-medium">BPM</span>
                        </div>
                    </div>

                    {/* Signal Strength / Quality */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center min-h-[100px] shadow-sm">
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Kualitas Sinyal</span>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`h-2 w-8 rounded-full ${signalValue !== 0 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                            <div className={`h-2 w-8 rounded-full ${Math.abs(signalValue) > 0.05 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                            <div className={`h-2 w-8 rounded-full ${Math.abs(signalValue) > 0.1 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Real-time Graph */}
                <div className="w-full bg-white rounded-2xl border border-slate-200 p-2 shadow-sm mb-4">
                    <ResponsiveContainer width="100%" height={100}>
                        <LineChart data={chartData}>
                            <YAxis domain={['auto', 'auto']} hide />
                            <Line
                                type="monotone"
                                dataKey="val"
                                stroke="#FF6B35"
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Controls */}
                <div className="mt-auto sticky bottom-24 z-10">
                    {!isMeasuring && !resultData ? (
                        <button
                            onClick={startMeasurement}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:scale-[0.98] text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1"
                        >
                            {measurementProgress > 0 && measurementProgress < 100 ? (
                                <>
                                    <RefreshCw className="w-5 h-5 fill-current" />
                                    <span>Ulangi Scan</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5 fill-current" />
                                    <span>Mulai Scan</span>
                                </>
                            )}
                        </button>
                    ) : isMeasuring ? (
                        <button
                            onClick={stopMeasurement}
                            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl border border-red-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <Square className="w-5 h-5 fill-current" />
                            <span>Berhenti</span>
                        </button>
                    ) : null}
                </div>

                {/* Result Modal Overlay */}
                {resultData && (
                    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                        {/* Glassmorphism Backdrop */}
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"></div>

                        <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-sm text-center transform scale-100 animate-in zoom-in-95 duration-300 overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-orange-50 to-white"></div>

                            <div className="relative z-10">
                                {/* Success Icon */}
                                <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 ring-4 ring-white">
                                    <Activity className="w-10 h-10 text-white" strokeWidth={2.5} />
                                </div>

                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Pengukuran Selesai!</h3>
                                <p className="text-slate-500 mb-8 font-medium">Estimasi Gula Darah:</p>

                                <div className="mb-10 relative flex items-center justify-center bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <span className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 tracking-tighter">
                                        {resultData.glucose}
                                    </span>
                                    <span className="text-lg text-slate-400 font-bold ml-2 self-end mb-2">mg/dL</span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Link
                                        href="/dashboard"
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
                                        onClick={() => setResultData(null)}
                                    >
                                        Lihat Dashboard
                                    </Link>
                                    <button
                                        onClick={() => { setResultData(null); startMeasurement(); }}
                                        className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors active:scale-[0.98]"
                                    >
                                        Ukur Lagi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
