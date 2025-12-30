import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, Camera, Zap, ZapOff } from 'lucide-react';

interface CameraControllerProps {
    onStreamReady?: (stream: MediaStream) => void;
    onFrame?: (canvas: HTMLCanvasElement) => void;
    width?: number;
    height?: number;
}

const CameraController: React.FC<CameraControllerProps> = ({
    onStreamReady,
    onFrame,
    width = 300,
    height = 300
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const trackRef = useRef<MediaStreamTrack | null>(null); // For flash control

    const [error, setError] = useState<string | null>(null);
    const [isFlashOn, setIsFlashOn] = useState(false);
    const [hasFlash, setHasFlash] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMockMode, setIsMockMode] = useState(false);

    // Initialize camera
    useEffect(() => {
        const startCamera = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Check environment
                // User explicitly requested real camera even on HTTP.
                // Note: This will likely fail on mobile HTTP due to browser security,
                // but we are adhering to the request to remove the "Mock Mode" block.

                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const constraints = {
                        audio: false,
                        video: {
                            facingMode: 'environment', // Rear camera
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            frameRate: { ideal: 30 }
                        }
                    };

                    const stream = await navigator.mediaDevices.getUserMedia(constraints);
                    streamRef.current = stream;

                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }

                    const videoTrack = stream.getVideoTracks()[0];
                    trackRef.current = videoTrack;

                    // Check for flash capability
                    const capabilities = videoTrack.getCapabilities();
                    if ('torch' in capabilities) {
                        setHasFlash(true);
                    }

                    if (onStreamReady) {
                        onStreamReady(stream);
                    }
                } else {
                    // If API is truly missing (and not just blocked), we might still land here.
                    // But we removed the explicit "throw" that forced Mock Mode.
                    throw new Error("Browser API kamera tidak ditemukan (Cek HTTPS/Localhost)");
                }

            } catch (err: any) {
                console.error("Camera init failed:", err);
                setError(`Gagal akses kamera: ${err.message}. (Cek koneksi HTTPS atau gunakan Localhost)`);
                // We do NOT auto-switch to mock mode anymore per user request.
                // setIsMockMode(true); 
            } finally {
                setIsLoading(false);
            }
        };

        startCamera();

        return () => {
            // Cleanup
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [onStreamReady]);

    // Handle flash toggle using applyConstraints
    const toggleFlash = async () => {
        if (isMockMode) {
            setIsFlashOn(!isFlashOn); // Just toggle UI state
            return;
        }

        if (!trackRef.current) return;

        try {
            const advancedConstraint = { torch: !isFlashOn };
            await trackRef.current.applyConstraints({
                advanced: [advancedConstraint as any]
            });
            setIsFlashOn(!isFlashOn);
        } catch (err) {
            console.error("Flash error:", err);
            // Fallback or error handling
        }
    };

    // Frame processing loop
    useEffect(() => {
        let animationFrameId: number;

        const processFrame = () => {
            if (canvasRef.current && onFrame) {
                const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });

                if (ctx) {
                    canvasRef.current.width = width;
                    canvasRef.current.height = height;

                    if (isMockMode) {
                        // SIMULATION MODE: Draw red frame with pulsating intensity
                        // Simulating ~75 BPM heart rate
                        const time = Date.now() / 1000;
                        const pulsatile = Math.sin(time * 2 * Math.PI * (75 / 60)); // -1 to 1

                        // Base Red: 220, Variation: +/- 20
                        const redIntensity = 220 + (pulsatile * 20);

                        ctx.fillStyle = `rgb(${redIntensity}, 0, 0)`;
                        ctx.fillRect(0, 0, width, height);

                        // Add timestamp text to show it's live
                        ctx.fillStyle = "white";
                        ctx.font = "12px monospace";
                        ctx.fillText("SIMULATION MODE", 10, 20);
                    }
                    else if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                        // REAL MODE: Draw video frame
                        ctx.drawImage(videoRef.current, 0, 0, width, height);
                    }

                    // Pass canvas for processing (works for both Real and Mock)
                    onFrame(canvasRef.current);
                }
            }
            animationFrameId = requestAnimationFrame(processFrame);
        };

        animationFrameId = requestAnimationFrame(processFrame);

        return () => cancelAnimationFrame(animationFrameId);
    }, [onFrame, width, height, isMockMode]);

    return (
        <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden shadow-inner border-2 border-slate-800">
            {/* Real Mode: Video Feed */}
            {!isMockMode && (
                <video
                    ref={videoRef}
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transform scale-105"
                />
            )}

            {/* Mock Mode or Processing: Canvas */}
            {/* We show canvas if in Mock Mode, otherwise it's hidden but used for processing */}
            <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full object-cover ${isMockMode ? 'block' : 'hidden'}`}
            />

            {/* Overlays */}
            <div className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none"></div>

            {/* Center Reticle/Guidance */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-red-500/50 bg-red-500/10 animate-pulse"></div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 z-10">
                {hasFlash && (
                    <button
                        onClick={toggleFlash}
                        className={`p-3 rounded-full backdrop-blur-md transition-all ${isFlashOn ? 'bg-yellow-400 text-yellow-900' : 'bg-black/40 text-white hover:bg-black/60'
                            }`}
                    >
                        {isFlashOn ? <Zap size={20} fill="currentColor" /> : <ZapOff size={20} />}
                    </button>
                )}
            </div>

            {/* Loading/Error States */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Memuat Kamera...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 text-white p-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CameraController;
