
import { db } from './config';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export interface HeartRateConfig {
    validation: {
        skewness_min: number;
        skewness_max: number;
        kurtosis_max: number;
        rmssd_min: number;
        rmssd_max: number;
    };
    detection: {
        min_bpm: number;
        max_bpm: number;
        smoothing_window: number;
        refractory_period_frames: number;
    };
}

const DEFAULT_CONFIG: HeartRateConfig = {
    validation: {
        skewness_min: -1.5,
        skewness_max: 1.5,
        kurtosis_max: 5.0,
        rmssd_min: 5.0,
        rmssd_max: 30.0
    },
    detection: {
        min_bpm: 45,
        max_bpm: 185,
        smoothing_window: 3,
        refractory_period_frames: 10
    }
};

export const getHeartRateConfig = async (): Promise<HeartRateConfig> => {
    try {
        const docRef = doc(db, 'system_config', 'heart_rate');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            return snap.data() as HeartRateConfig;
        }
    } catch (err) {
        console.warn("Failed to fetch config, using defaults:", err);
    }
    return DEFAULT_CONFIG;
};
