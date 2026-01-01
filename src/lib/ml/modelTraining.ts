import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import { createGlucoseModel } from './glucoseModel';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

// Model Metadata
const MODEL_VERSION = 'v3';
const MODEL_DOC_ID = `global_glucose_model_${MODEL_VERSION}`;
const MODELS_COLLECTION = 'ai_models';

// Warmup: Pre-train model with synthetic data
export async function warmupModel(model: tf.LayersModel) {
    console.log('[Warmup] Generating synthetic training data...');

    const numSamples = 100;
    const signalLength = 300; // Match model input: 10 sec * 30 fps

    const xs: number[][] = [];
    const ys: number[] = [];

    // Expanded range: 90-160 mg/dL for better high glucose detection
    for (let i = 0; i < numSamples; i++) {
        const mockGlucose = 90 + Math.random() * 70; // 90-160 range
        const mockSignal = Array(signalLength).fill(0).map(() =>
            Math.sin(Math.random() * Math.PI * 2) * 0.1 + mockGlucose / 200
        );
        xs.push(mockSignal);
        ys.push(mockGlucose);
    }

    // Reshape to 3D for Conv1D: [batchSize, sequenceLength, channels]
    const xTensor = tf.tensor3d(xs.map(x => x.map(v => [v])), [numSamples, signalLength, 1]);
    const yTensor = tf.tensor2d(ys, [numSamples, 1]);

    await model.fit(xTensor, yTensor, {
        epochs: 5,
        batchSize: 16,
        verbose: 0
    });

    xTensor.dispose();
    yTensor.dispose();

    console.log('[Warmup] Model calibrated with synthetic data');
}

// Helper: Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Helper: Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export class ModelTrainer {
    model: tf.LayersModel | null = null;
    private isInitializing = false;
    private initPromise: Promise<void> | null = null;

    async initialize() {
        if (this.model) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            console.log('[ModelTrainer] Initializing model...');
            try {
                // Try IndexedDB first
                console.log('[ModelTrainer] Trying to load from IndexedDB...');
                this.model = await tf.loadLayersModel(`indexeddb://${MODEL_DOC_ID}`);

                // CRITICAL: Re-compile model to enable training
                this.model.compile({
                    optimizer: tf.train.adam(0.001),
                    loss: 'meanSquaredError',
                    metrics: ['mse']
                });

                console.log('[ModelTrainer] Loaded from IndexedDB successfully');
            } catch (e) {
                console.log('[ModelTrainer] IndexedDB load failed, trying Firestore...');
                try {
                    await this.loadFromFirestore();
                    console.log('[ModelTrainer] Loaded from Firestore successfully');

                    // Save to IndexedDB for next time
                    if (this.model) {
                        try {
                            await this.model.save(`indexeddb://${MODEL_DOC_ID}`);
                            console.log('[ModelTrainer] Saved to IndexedDB for caching');
                        } catch (saveErr) {
                            console.warn('[ModelTrainer] IndexedDB save failed:', saveErr);
                        }
                    }
                } catch (firestoreErr) {
                    console.warn('[ModelTrainer] Firestore load failed, creating new local model.');
                    this.model = createGlucoseModel();
                    await warmupModel(this.model);
                    console.log('[ModelTrainer] Created fresh cold-start model', MODEL_VERSION);

                    // Save new model to IndexedDB
                    try {
                        await this.model.save(`indexeddb://${MODEL_DOC_ID}`);
                    } catch (saveErr) {
                        console.warn('[ModelTrainer] IndexedDB save failed for fresh model');
                    }
                }
            }
        })();

        return this.initPromise;
    }

    async loadFromFirestore() {
        const modelRef = doc(db, MODELS_COLLECTION, MODEL_DOC_ID);
        const modelSnap = await getDoc(modelRef);

        if (!modelSnap.exists()) {
            throw new Error('Model not found in Firestore');
        }

        const modelData = modelSnap.data();

        console.log('[ModelTrainer] Loading model from Firestore...');

        // Reconstruct model from saved data
        const modelTopology = modelData.modelTopology;
        const weightSpecs = modelData.weightSpecs;
        const weightDataBase64 = modelData.weightDataBase64;

        // Convert base64 back to ArrayBuffer
        const weightData = base64ToArrayBuffer(weightDataBase64);

        // Load model using tf.js IOHandler
        this.model = await tf.loadLayersModel({
            load: async () => ({
                modelTopology,
                weightSpecs,
                weightData,
                format: 'layers-model',
                generatedBy: 'TensorFlow.js tfjs-layers v4.0.0',
                convertedBy: null,
                userDefinedMetadata: {}
            })
        });

        // CRITICAL: Re-compile model to enable training (fit)
        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
            metrics: ['mse']
        });

        console.log('[ModelTrainer] Model loaded from Firestore');
    }

    async saveAndSync() {
        if (!this.model) {
            console.warn('[ModelTrainer] No model to save');
            return;
        }

        console.log('[ModelTrainer] Saving model to Firestore...');

        // Save model and extract artifacts
        const saveResult = await this.model.save(tf.io.withSaveHandler(async (artifacts) => {
            // Extract model data
            const modelTopology = artifacts.modelTopology;
            const weightSpecs = artifacts.weightSpecs || [];
            let weightData = artifacts.weightData;

            // Handle WeightData type (can be ArrayBuffer or ArrayBuffer[])
            if (!weightData) {
                throw new Error('No weight data in model');
            }

            // If it's an array of ArrayBuffers, concatenate them
            let weightBuffer: ArrayBuffer;
            if (Array.isArray(weightData)) {
                // Concatenate multiple ArrayBuffers
                const totalLength = weightData.reduce((sum, buf) => sum + buf.byteLength, 0);
                const combined = new Uint8Array(totalLength);
                let offset = 0;
                for (const buf of weightData) {
                    combined.set(new Uint8Array(buf), offset);
                    offset += buf.byteLength;
                }
                weightBuffer = combined.buffer;
            } else {
                weightBuffer = weightData;
            }

            // Convert ArrayBuffer to Base64
            const weightDataBase64 = arrayBufferToBase64(weightBuffer);

            // Save to Firestore
            try {
                const modelRef = doc(db, MODELS_COLLECTION, MODEL_DOC_ID);
                await setDoc(modelRef, {
                    version: MODEL_VERSION,
                    modelTopology,
                    weightSpecs,
                    weightDataBase64,
                    updatedAt: Timestamp.now(),
                    sizeBytes: weightBuffer.byteLength
                });
                console.log(`[ModelTrainer] Model saved to Firestore (${(weightBuffer.byteLength / 1024).toFixed(2)} KB)`);
            } catch (e: any) {
                if (e.code === 'permission-denied') {
                    throw e; // Re-throw to caller for "Local only" handling
                }
                console.warn("[ModelTrainer] Save skipped:", e.message);
                // Don't throw for other errors to keep app running
            }

            return {
                modelArtifactsInfo: {
                    dateSaved: new Date(),
                    modelTopologyType: 'JSON',
                    modelTopologyBytes: JSON.stringify(modelTopology).length,
                    weightSpecsBytes: JSON.stringify(weightSpecs).length,
                    weightDataBytes: weightBuffer.byteLength
                }
            };
        }));

        return saveResult;
    }

    private isTraining = false;

    async train(ppgSignal: number[], glucoseLabel: number) {
        if (!this.model) {
            // If model missing, try init or skip
            console.warn('[ModelTrainer] Model not ready for training');
            return;
        }

        if (this.isTraining) {
            console.warn('[ModelTrainer] Training already in progress, skipping frame.');
            return;
        }

        this.isTraining = true;

        try {
            // Reshape to 3D for Conv1D: [1, sequenceLength, 1]
            const x = tf.tensor3d([ppgSignal.map(v => [v])], [1, ppgSignal.length, 1]);
            const y = tf.tensor2d([[glucoseLabel]], [1, 1]);

            // Train
            await this.model.fit(x, y, {
                epochs: 1, // Reduce to 1 for real-time speed
                batchSize: 1,
                verbose: 0
            });

            // Cleanup
            x.dispose();
            y.dispose();

            // Auto-sync to cloud and local cache
            try {
                await this.saveAndSync();
                // Also update local cache
                if (this.model) {
                    await this.model.save(`indexeddb://${MODEL_DOC_ID}`);
                }
            } catch (e: any) {
                // Ignore permission errors - typical for end users
                if (e.code === 'permission-denied') {
                    console.log('[ModelTrainer] Local training only (No cloud write permission).');
                } else {
                    console.warn('[ModelTrainer] Cloud sync failed:', e);
                }
            }

        } catch (err) {
            console.error("Training loop error:", err);
        } finally {
            this.isTraining = false;
        }
    }

    async predict(ppgSignal: number[]): Promise<number> {
        if (!this.model) {
            await this.initialize();
        }

        if (!this.model) {
            throw new Error('Model initialization failed');
        }

        // Reshape to 3D for Conv1D: [1, sequenceLength, 1]
        const input = tf.tensor3d([ppgSignal.map(v => [v])], [1, ppgSignal.length, 1]);
        const prediction = this.model.predict(input) as tf.Tensor;
        const value = (await prediction.data())[0];

        input.dispose();
        prediction.dispose();

        return value;
    }
}
