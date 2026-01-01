'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Camera, RefreshCw, Smartphone, ChevronLeft } from 'lucide-react';
import { analyzeProduct, AnalysisResult } from '../actions/analyzeProduct';
import VisualizerScene from '../../components/sugar-visualizer/VisualizerScene';
import ResultPanel from '../../components/sugar-visualizer/ResultPanel';

export default function SugarVisualizerPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please allow camera permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setAnalyzing(true);
        setError(null);

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Image = canvas.toDataURL('image/jpeg', 0.7);

            const analysis = await analyzeProduct(base64Image);
            setResult(analysis);
            stopCamera(); // Stop camera when showing results
        } catch (err) {
            console.error("Analysis failed:", err);
            setError("Failed to analyze product. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        startCamera();
    };

    return (
        <div className="fixed inset-0 bg-black text-white overflow-hidden">
            {/* View 1: Camera (Full Screen) */}
            {(!result || analyzing) && (
                <div className="absolute inset-0 z-0">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Dark Gradient Overlays for readability */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/60 via-transparent to-black/80" />

                    {/* Header Overlay */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex items-center gap-4 z-50">
                        <Link href="/dashboard" className="p-2 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition border border-white/10">
                            <ChevronLeft size={24} />
                        </Link>
                        <h1 className="text-xl font-bold text-white/90 drop-shadow-md">
                            Gluco
                        </h1>
                    </div>

                    {/* Viewfinder Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                        <div className="relative">
                            <p className="mt-8 text-white/90 font-medium px-6 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                Arahkan kamera ke informasi nutrisi
                            </p>
                        </div>
                    </div>

                    {/* Capture Button */}
                    <div className="absolute bottom-12 inset-x-0 flex justify-center z-50">
                        <button
                            onClick={handleCapture}
                            disabled={analyzing}
                            className="w-20 h-20 rounded-full border-[6px] border-white/20 flex items-center justify-center bg-white/90 shadow-lg shadow-blue-900/20 active:scale-95 transition-all duration-300 hover:bg-white disabled:opacity-70 disabled:grayscale"
                        >
                            {analyzing ? (
                                <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <div className="w-16 h-16 bg-white rounded-full border-[3px] border-gray-100" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* View 2: Results (Overlay or Split) */}
            {result && !analyzing && (
                <div className="absolute inset-0 z-50 flex flex-col bg-gray-900">
                    {/* Header for Results */}
                    <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium hover:bg-white/20 transition flex items-center gap-2"
                        >
                            <RefreshCw size={16} /> Scan Ulang
                        </button>
                    </div>

                    {/* 3D Scene - Takes top half */}
                    <div className="h-[55%] relative w-full bg-[#1a1c2e]">
                        <VisualizerScene sugarGrams={result.sugarContent} />
                        <div className="absolute bottom-4 inset-x-0 text-center pointer-events-none">
                            <span className="text-xs text-white/50 tracking-wider uppercase font-medium">Interactive 3D View</span>
                        </div>
                    </div>

                    {/* Info Panel - Takes bottom half with rounded top */}
                    <div className="flex-1 bg-white text-gray-900 rounded-t-[2.5rem] -mt-8 relative z-10 p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] overflow-y-auto">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
                        <ResultPanel result={result} />
                    </div>
                </div>
            )}

            {/* Global Error Toast */}
            {error && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-full z-[100] text-sm font-medium shadow-lg backdrop-blur-md animate-in slide-in-from-top-4">
                    {error}
                </div>
            )}
        </div>
    );
}
