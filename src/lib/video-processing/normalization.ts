/**
 * Normalizes the raw signal intensity to compensate for baseline drift
 * and varying lighting conditions/skin tones.
 * 
 * Implements a simple DC removal filter:
 * AC = Signal - moving_average(Signal)
 */

export class SignalNormalizer {
    private buffer: number[] = [];
    private windowSize: number;

    constructor(windowSize: number = 30) { // ~1 second at 30fps
        this.windowSize = windowSize;
    }

    process(value: number): number {
        this.buffer.push(value);
        if (this.buffer.length > this.windowSize) {
            this.buffer.shift();
        }

        const sum = this.buffer.reduce((a, b) => a + b, 0);
        const avg = sum / this.buffer.length;

        // Avoid division by zero
        if (avg === 0) return 0;

        // Return normalized AC component
        // (Value - DC) / DC
        // This gives us the relative pulsatile change
        return (value - avg) / avg;
    }

    reset() {
        this.buffer = [];
    }
}

export const normalizeSignal = (value: number, baseline: number): number => {
    if (baseline === 0) return 0;
    return (value - baseline) / baseline;
};
