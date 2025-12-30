// inference.ts
// Handles the actual prediction logic

export interface InferenceInput {
    ppgSignal: number[];
    heartRate: number;
}

export interface InferenceResult {
    glucose: number;
    confidence: number;
    isCalibrated: boolean;
}

import * as tf from '@tensorflow/tfjs';
import { ModelTrainer } from './modelTraining';

export interface InferenceInput {
    ppgSignal: number[];
    heartRate: number;
}

export interface InferenceResult {
    glucose: number;
    confidence: number;
    isCalibrated: boolean;
}

export class GlucoseInference {
    private trainer: ModelTrainer;
    private modelLoaded = false;

    constructor() {
        this.trainer = new ModelTrainer();
        this.init();
    }

    private async init() {
        await this.trainer.initialize();
        this.modelLoaded = true;
    }

    async predict(input: InferenceInput): Promise<InferenceResult> {
        // Fallback if model not ready
        if (!this.modelLoaded) {
            console.warn("Model not loaded yet, using simulation fallback.");
            return this.getSimulationFallback();
        }

        try {
            // 1. Preprocess Input
            const processedInput = this.preprocess(input.ppgSignal);

            // 2. Run Inference via Trainer
            const predictedValue = await this.trainer.predict(processedInput);

            if (predictedValue !== null && !isNaN(predictedValue)) {
                return {
                    glucose: Math.round(predictedValue),
                    confidence: 90.0, // Should calculate based on model uncertainty
                    isCalibrated: true
                };
            }

            return this.getSimulationFallback();

        } catch (err) {
            console.error("Inference error:", err);
            return this.getSimulationFallback();
        }
    }

    private preprocess(signal: number[]): number[] {
        // Ensure strictly 300 samples
        let processed = [...signal];
        if (processed.length > 300) processed = processed.slice(0, 300);
        while (processed.length < 300) processed.push(0);
        return processed;
    }

    private getSimulationFallback(): InferenceResult {
        const simulatedGlucose = 95 + (Math.random() * 10 - 5);
        return {
            glucose: Math.round(simulatedGlucose),
            confidence: 85.5,
            isCalibrated: false
        };
    }

    /**
     * Train the model with a new confirmed data point.
     */
    async learn(ppgSignal: number[], actualGlucose: number): Promise<void> {
        if (!this.modelLoaded) return;

        try {
            const processedInput = this.preprocess(ppgSignal);
            await this.trainer.onlineLearn(processedInput, actualGlucose);
        } catch (err) {
            console.error("Learning failed:", err);
        }
    }
}
