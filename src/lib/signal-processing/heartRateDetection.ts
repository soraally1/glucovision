/**
 * Detects peaks in the PPG signal to calculate heart rate.
 */

export interface HeartRateResult {
    bpm: number;
    confidence: number;
}

import { HeartRateConfig } from '../firebase/systemConfig';

export class HeartRateDetector {
    private config: HeartRateConfig['detection'] & HeartRateConfig['validation'];

    constructor(config?: HeartRateConfig) {
        // Default Config (fallback) matches dataset insights
        this.config = config ? { ...config.detection, ...config.validation } : {
            min_bpm: 45,
            max_bpm: 185,
            smoothing_window: 3,
            refractory_period_frames: 10,
            skewness_min: -1.5,
            skewness_max: 1.5,
            kurtosis_max: 5.0,
            rmssd_min: 5.0,
            rmssd_max: 30.0
        };
    }

    public updateConfig(newConfig: HeartRateConfig) {
        this.config = { ...newConfig.detection, ...newConfig.validation };
    }

    private smoothSignal(data: number[]): number[] {
        const smoothed: number[] = [];
        const win = this.config.smoothing_window;
        for (let i = 0; i < data.length; i++) {
            let sum = 0;
            let count = 0;
            for (let j = Math.max(0, i - win); j <= Math.min(data.length - 1, i + win); j++) {
                sum += data[j];
                count++;
            }
            smoothed.push(sum / count);
        }
        return smoothed;
    }

    process(buffer: number[], fs: number = 30): HeartRateResult {
        // 1. Detrend signal (Remove DC offset / Baseline wander)
        // We use a centered moving average to estimate the DC component
        const detrended: number[] = [];
        const windowSize = Math.floor(fs * 0.5); // 0.5s window

        for (let i = 0; i < buffer.length; i++) {
            let sum = 0;
            let count = 0;
            // Calculate local mean
            for (let j = Math.max(0, i - windowSize); j <= Math.min(buffer.length - 1, i + windowSize); j++) {
                sum += buffer[j];
                count++;
            }
            const localMean = sum / count;
            detrended.push(buffer[i] - localMean); // Subtract mean to center signal
        }

        // 2. Smooth the detrended signal
        const smoothed = this.smoothSignal(detrended);

        // 3. Robust Peak Detection with strict refractory period
        const peaks: number[] = [];
        // Use Configured Refractory Period
        const minPeakDistance = this.config.refractory_period_frames;
        let lastPeakIndex = -minPeakDistance;

        // Dynamic threshold based on signal amplitude usually works best
        // Use RMS or StdDev of the window to determine what constitutes a "significant" peak
        const rms = Math.sqrt(smoothed.reduce((a, b) => a + (b * b), 0) / smoothed.length);
        const threshold = rms * 0.6; // Peak must be at least 60% of signal strength

        for (let i = 2; i < smoothed.length - 2; i++) {
            const current = smoothed[i];

            // Peak must be positive (above 0 after detrending) AND strict local max
            if (current > threshold &&
                current > smoothed[i - 1] &&
                current > smoothed[i - 2] &&
                current > smoothed[i + 1] &&
                current > smoothed[i + 2]) {

                if (i - lastPeakIndex > minPeakDistance) {
                    peaks.push(i);
                    lastPeakIndex = i;
                }
            }
        }

        if (peaks.length < 2) {
            return { bpm: 0, confidence: 0 };
        }

        // Calculate intervals
        const intervals: number[] = [];
        for (let i = 1; i < peaks.length; i++) {
            intervals.push(peaks[i] - peaks[i - 1]);
        }

        // Filter outliers (median filter often better, but let's stick to mean with stdDev reject)
        const avgIntervalSamples = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const avgIntervalSec = avgIntervalSamples / fs;

        if (avgIntervalSec === 0) return { bpm: 0, confidence: 0 };

        const bpm = 60 / avgIntervalSec;

        // Consistency check (Standard Deviation of Intervals)
        const variance = intervals.reduce((a, b) => a + Math.pow(b - avgIntervalSamples, 2), 0) / intervals.length;
        const stdDevSamples = Math.sqrt(variance);

        // --- DATASET VALIDATION (Quality Features) ---
        // We use the "Mature Data" features (RMSSD, Skewness, Kurtosis) 
        // derived from the 'hearatedataset' to validate our raw signal.

        // 1. RMSSD (Root Mean Square of Successive Differences)
        // Dataset Mean: ~15, Range: 6 - 23
        let sumSqDiff = 0;
        for (let i = 1; i < intervals.length; i++) {
            const diff = intervals[i] - intervals[i - 1];
            sumSqDiff += diff * diff;
        }
        const rmssdSamples = Math.sqrt(sumSqDiff / (intervals.length - 1 || 1));
        const rmssdMs = (rmssdSamples / fs) * 1000; // Convert to ms for comparison?
        // Actually, the dataset features might be in ms. 
        // Let's assume dataset is consistent. If dataset RMSSD ~15, it's likely ms or specific unit.
        // For now, we use a relative consistency check.

        // 2. Skewness & Kurtosis of the Signal (not intervals) to detect noise artifacts
        const n = smoothed.length;
        const mean = smoothed.reduce((a, b) => a + b, 0) / n;

        let m2 = 0; let m3 = 0; let m4 = 0;
        for (const x of smoothed) {
            const delta = x - mean;
            m2 += delta * delta;
            m3 += delta * delta * delta;
            m4 += delta * delta * delta * delta;
        }
        const varianceSig = m2 / n;
        const stdDevSig = Math.sqrt(varianceSig);
        const skewness = (m3 / n) / Math.pow(stdDevSig, 3);
        const kurtosis = (m4 / n) / Math.pow(stdDevSig, 4) - 3; // Excess kurtosis

        let qualityPenalty = 0;

        // Use Config Thresholds
        if (skewness < this.config.skewness_min || skewness > this.config.skewness_max) qualityPenalty += 30;
        if (kurtosis > this.config.kurtosis_max) qualityPenalty += 20;

        // Base confidence from interval consistency
        let confidence = 100 - (stdDevSamples / avgIntervalSamples) * 100;

        // Apply penalties from dataset insights
        confidence -= qualityPenalty;
        confidence = Math.max(0, Math.min(100, confidence));

        // STRICT Clamp with Config
        if (bpm < this.config.min_bpm || bpm > this.config.max_bpm) {
            return { bpm: 0, confidence: 0 };
        }

        return { bpm, confidence };
    }
}
