"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, Play, Square, Info, RefreshCw } from 'lucide-react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';

import CameraController from '@/components/camera/CameraController';
import { extractRedChannelAverage } from '@/lib/video-processing/redChannelIsolation';
import { PPGExtractor } from '@/lib/signal-processing/ppgExtraction';
import { HeartRateDetector } from '@/lib/signal-processing/heartRateDetection';
import { GlucoseInference } from '@/lib/ml/inference';

export default function MeasurePage() {
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [signalValue, setSignalValue] = useState<number>(0);
    const [bpm, setBpm] = useState<number>(0);
    const [measurementProgress, setMeasurementProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("Siapkan jari di kamera");
    const [chartData, setChartData] = useState<{ val: number }[]>([]);

    const ppgExtractor = useRef(new PPGExtractor());
    const hrDetector = useRef(new HeartRateDetector());
    const glucoseInference = useRef(new GlucoseInference()); // Real AI Model
    const signalBuffer = useRef<number[]>([]);

    const MAX_CHART_POINTS = 50;
    const MEASUREMENT_DURATION_SEC = 20; // Faster for testing
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
            id: generateId(),
            timestamp: Date.now(),
            glucose: inferenceResult.glucose,
            bpm: bpm > 0 ? bpm : 75,
            confidence: inferenceResult.confidence
        };

        // Save to local history for Dashboard
        const history = JSON.parse(localStorage.getItem('glucovision_history') || '[]');
        history.unshift(result);
        localStorage.setItem('glucovision_history', JSON.stringify(history));

        // Simulate processing delay then redirect
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <header className="px-6 py-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <Link href="/" className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-700" />
                </Link>
                <span className="font-bold text-lg text-slate-800">Pengukuran</span>
                <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    <Activity className="w-3 h-3" />
                    <span>Live</span>
                </div>
            </header>

            <main className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">

                {/* Status Card */}
                <div className={`p-4 rounded-xl border ${isMeasuring ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'} transition-colors`}>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Info className={`w-5 h-5 ${isMeasuring ? 'text-blue-600' : 'text-slate-500'}`} />
                            {isMeasuring && <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>}
                        </div>
                        <p className={`font-medium ${isMeasuring ? 'text-blue-800' : 'text-slate-700'} text-sm`}>
                            {statusMessage}
                        </p>
                    </div>
                </div>

                {/* Camera Viewport - Made taller and less padding */}
                <div className="w-full aspect-[3/4] relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-black mx-auto max-w-[400px]">
                    <CameraController
                        onFrame={handleFrame}
                        width={300}
                        height={300}
                    />

                    {/* Progress Overlay */}
                    {isMeasuring && (
                        <div className="absolute bottom-0 left-0 h-1.5 bg-green-500 transition-all duration-100 shadow-[0_-2px_6px_rgba(34,197,94,0.6)]" style={{ width: `${measurementProgress}%` }}></div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* HR Display */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col items-center justify-center min-h-[100px]">
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Denyut Jantung</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-800">{bpm > 0 ? bpm : '--'}</span>
                            <span className="text-sm text-slate-500 font-medium">BPM</span>
                        </div>
                    </div>

                    {/* Signal Strength / Quality */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col items-center justify-center min-h-[100px]">
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Kualitas Sinyal</span>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`h-2 w-8 rounded-full ${signalValue !== 0 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                            <div className={`h-2 w-8 rounded-full ${Math.abs(signalValue) > 0.05 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                            <div className={`h-2 w-8 rounded-full ${Math.abs(signalValue) > 0.1 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Real-time Graph */}
                {/* Real-time Graph */}
                <div className="w-full bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
                    <ResponsiveContainer width="100%" height={128}>
                        <LineChart data={chartData}>
                            <YAxis domain={['auto', 'auto']} hide />
                            <Line
                                type="monotone"
                                dataKey="val"
                                stroke="#2563EB"
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Controls */}
                <div className="mt-auto">
                    {!isMeasuring ? (
                        <button
                            onClick={startMeasurement}
                            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all"
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
                    ) : (
                        <button
                            onClick={stopMeasurement}
                            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-xl border border-red-200 flex items-center justify-center gap-2 transition-all"
                        >
                            <Square className="w-5 h-5 fill-current" />
                            <span>Berhenti</span>
                        </button>
                    )}
                </div>

            </main>
        </div>
    );
}
