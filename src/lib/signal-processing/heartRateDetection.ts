/**
 * Detects peaks in the PPG signal to calculate heart rate.
 */

export interface HeartRateResult {
    bpm: number;
    confidence: number;
}

export class HeartRateDetector {
    private timestamps: number[] = [];

    // Simple peak detection
    // Returns true if a peak is detected at current index
    detectPeak(data: number[], index: number): boolean {
        if (index < 2 || index >= data.length - 2) return false;

        const current = data[index];
        // Check if local maximum
        return (
            current > data[index - 1] &&
            current > data[index - 2] &&
            current > data[index + 1] &&
            current > data[index + 2] &&
            current > 0 // Must be positive (above baseline)
        );
    }

    process(buffer: number[], fs: number = 30): HeartRateResult {
        const peaks: number[] = [];

        // Scan buffer for peaks
        for (let i = 2; i < buffer.length - 2; i++) {
            if (this.detectPeak(buffer, i)) {
                peaks.push(i);
            }
        }

        if (peaks.length < 2) {
            return { bpm: 0, confidence: 0 };
        }

        // Calculate intervals (in samples)
        const intervals: number[] = [];
        for (let i = 1; i < peaks.length; i++) {
            intervals.push(peaks[i] - peaks[i - 1]);
        }

        // Calculate average interval
        const avgIntervalSamples = intervals.reduce((a, b) => a + b, 0) / intervals.length;

        // Convert to seconds
        const avgIntervalSec = avgIntervalSamples / fs;

        if (avgIntervalSec === 0) return { bpm: 0, confidence: 0 };

        const bpm = 60 / avgIntervalSec;

        // Confidence heuristic: consistency of intervals
        // Lower variance = higher confidence
        const variance = intervals.reduce((a, b) => a + Math.pow(b - avgIntervalSamples, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);

        // Arbitrary confidence score (0-100)
        // If stdDev is low (< 10% of avg), confidence is high
        let confidence = 100 - (stdDev / avgIntervalSamples) * 100;
        confidence = Math.max(0, Math.min(100, confidence));

        // Sanity check for human HR limits (40-200)
        if (bpm < 40 || bpm > 220) {
            return { bpm: bpm, confidence: 10 }; // Low confidence if out of range
        }

        return { bpm, confidence };
    }
}
