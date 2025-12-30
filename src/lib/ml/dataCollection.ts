// dataCollection.ts

export interface TrainingExample {
    id: string;
    timestamp: number;
    ppgSignal: number[];
    heartRate: number;
    glucoseLabel: number; // Ground truth from blood test
    deviceInfo: string;
}

export class DataCollector {
    private static STORAGE_KEY = 'glucovision_training_data';

    async saveExample(example: Omit<TrainingExample, 'id' | 'timestamp'>): Promise<void> {
        const newExample: TrainingExample = {
            ...example,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        };

        // Save to local storage for now (or IndexedDB)
        // In production, this syncs to Firebase
        const existing = await this.getExamples();
        existing.push(newExample);

        if (typeof window !== 'undefined') {
            localStorage.setItem(DataCollector.STORAGE_KEY, JSON.stringify(existing));
        }

        console.log("Saved training example:", newExample.id);
    }

    async getExamples(): Promise<TrainingExample[]> {
        if (typeof window === 'undefined') return [];

        const data = localStorage.getItem(DataCollector.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }
}
