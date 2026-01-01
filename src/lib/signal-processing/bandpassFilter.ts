/**
 * Simple Bandpass Filter implementation for PPG signals.
 * Lower cutoff: ~0.7Hz (42 BPM)
 * Upper cutoff: ~3.5Hz (210 BPM)
 */
export class BandpassFilter {
    private alphaLow: number;
    private alphaHigh: number;
    private lastLow: number = 0;
    private lastHigh: number = 0;

    constructor(fs: number = 30, fLow: number = 0.7, fHigh: number = 3.5) {
        // Simple RC filter approximations
        const dt = 1 / fs;
        this.alphaLow = (2 * Math.PI * dt * fLow) / (2 * Math.PI * dt * fLow + 1);
        this.alphaHigh = (2 * Math.PI * dt * fHigh) / (2 * Math.PI * dt * fHigh + 1);
    }

    process(val: number): number {
        // High-pass to remove DC/Baseline drift
        const highPassed = val - this.lastLow;
        this.lastLow = val * this.alphaLow + this.lastLow * (1 - this.alphaLow);

        // Low-pass to remove high frequency noise
        this.lastHigh = highPassed * this.alphaHigh + this.lastHigh * (1 - this.alphaHigh);

        return this.lastHigh;
    }

    reset() {
        this.lastLow = 0;
        this.lastHigh = 0;
    }
}
