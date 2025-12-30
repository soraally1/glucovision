import { SignalNormalizer } from '../video-processing/normalization';

/**
 * Orchestrates the extraction of a clean PPG signal from raw intensity values.
 */
export class PPGExtractor {
    private normalizer: SignalNormalizer;
    private filterBuffer: number[] = [];

    constructor() {
        this.normalizer = new SignalNormalizer(150); // 5 sec baseline
    }

    process(rawRedIntensity: number): number {
        // 1. Normalize (Remove DC component)
        const normalized = this.normalizer.process(rawRedIntensity);

        // 2. Invert (Blood absorption increases -> Light intensity decreases)
        // So pulse peak (more blood) = lower intensity.
        // We invert so peaks look like peaks.
        const inverted = -normalized;

        // 3. Simple Bandpass/Smoothing (Moving Average for now, will enhance later)
        return this.smooth(inverted);
    }

    private smooth(val: number): number {
        this.filterBuffer.push(val);
        if (this.filterBuffer.length > 5) this.filterBuffer.shift();
        return this.filterBuffer.reduce((a, b) => a + b, 0) / this.filterBuffer.length;
    }

    reset() {
        this.normalizer.reset();
        this.filterBuffer = [];
    }
}
