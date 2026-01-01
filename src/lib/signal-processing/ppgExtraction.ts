import { SignalNormalizer } from '../video-processing/normalization';
import { BandpassFilter } from './bandpassFilter';

/**
 * Orchestrates the extraction of a clean PPG signal from raw intensity values.
 */
export class PPGExtractor {
    private normalizer: SignalNormalizer;
    private bandpass: BandpassFilter;

    constructor() {
        this.normalizer = new SignalNormalizer(150); // 5 sec baseline
        this.bandpass = new BandpassFilter(30, 0.7, 3.5);
    }

    process(rawRedIntensity: number): number {
        // 1. Normalize (Remove DC component)
        const normalized = this.normalizer.process(rawRedIntensity);

        // 2. Invert (Blood absorption increases -> Light intensity decreases)
        const inverted = -normalized;

        // 3. Bandpass filtering (0.7Hz - 3.5Hz)
        return this.bandpass.process(inverted);
    }

    reset() {
        this.normalizer.reset();
        this.bandpass.reset();
    }
}
