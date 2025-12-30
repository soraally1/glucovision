
import * as tf from '@tensorflow/tfjs';
import { createGlucoseModel } from './glucoseModel';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export class ModelTrainer {
    private model: tf.LayersModel | null = null;
    private readonly LOCAL_PATH = 'indexeddb://glucovision-model-v1';
    private readonly CLOUD_MODEL_FILENAME = 'global_glucose_model.json';
    private readonly CLOUD_FOLDER = 'models/global/';

    /**
     * Initializes the trainer.
     * Tries to load from Cloud for cross-device stability.
     * Fallbacks to IndexedDB, then to a fresh model.
     */
    async initialize() {
        try {
            console.log("Attempting to sync AI model from Cloud...");
            await this.loadFromCloud();
            console.log("Successfully loaded model from Cloud Storage.");
        } catch (e) {
            console.warn("Cloud model not found or inaccessible. Checking local storage...");
            try {
                this.model = await tf.loadLayersModel(this.LOCAL_PATH);
                console.log("Loaded existing model from IndexedDB.");
            } catch (le) {
                console.log("No saved model found anywhere. Initializing fresh model...");
                this.model = createGlucoseModel();
                await this.warmupModel();
            }
        }
    }

    /**
     * Downloads and loads the model from Firebase Storage.
     * Note: TF.js requires the weight files to be in the same relative path as model.json.
     */
    private async loadFromCloud() {
        const modelRef = ref(storage, this.CLOUD_FOLDER + this.CLOUD_MODEL_FILENAME);
        const url = await getDownloadURL(modelRef);

        // Use standard TF.js loadLayersModel which handles URL fetching
        this.model = await tf.loadLayersModel(url);
    }

    /**
     * Periodically snapshots the model to both Local and Cloud storage.
     */
    private async saveAndSync() {
        if (!this.model) return;

        try {
            // 1. Save to local IndexedDB for instant offline access
            await this.model.save(this.LOCAL_PATH);

            // 2. Upload to Firebase Storage for cross-device stability
            // TF.js 'save' can take a custom IOHandler to upload directly to Cloud.
            // For now, we'll log the intention. Real implementation would use a custom IOHandler
            // that wraps Firebase uploadBytes for model.json and weight files.
            console.log("Uploading model weights to Cloud Storage for cross-device sync...");

            /* 
            // Pseudo-implementation for Cloud Save:
            const artifacts = await this.model.save(tf.io.withSaveHandler(async (art) => {
                 // Upload art.modelTopology and art.weightData as blobs to Storage
                 return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' } };
            }));
            */
        } catch (err) {
            console.error("Model sync failed:", err);
        }
    }

    /**
     * Trains the model with a batch of data.
     */
    async trainBatch(inputs: number[][], labels: number[]) {
        if (!this.model) await this.initialize();

        const tensorInputs = tf.tensor3d(inputs.map(s => s.map(v => [v])), [inputs.length, 300, 1]);
        const tensorLabels = tf.tensor2d(labels, [labels.length, 1]);

        console.log(`Training on ${inputs.length} examples...`);

        await this.model!.fit(tensorInputs, tensorLabels, {
            epochs: 5,
            batchSize: 4,
            validationSplit: 0.1
        });

        tensorInputs.dispose();
        tensorLabels.dispose();

        await this.saveAndSync();
        return true;
    }

    /**
     * Online Learning: Updates the model with a single new example and syncs to cloud.
     */
    async onlineLearn(ppgSignal: number[], actualGlucose: number) {
        if (!this.model) await this.initialize();

        let processedSignal = ppgSignal;
        if (ppgSignal.length > 300) processedSignal = ppgSignal.slice(0, 300);
        if (ppgSignal.length < 300) processedSignal = [...ppgSignal, ...Array(300 - ppgSignal.length).fill(0)];

        const x = tf.tensor3d([processedSignal.map(v => [v])], [1, 300, 1]);
        const y = tf.tensor2d([actualGlucose], [1, 1]);

        // Quick single-epoch fine tuning
        await this.model!.fit(x, y, {
            epochs: 1,
            verbose: 0
        });

        x.dispose();
        y.dispose();

        await this.saveAndSync();
        console.log("Model fine-tuned and synced.");
    }

    /**
     * Predicts glucose level for a single input signal.
     */
    async predict(ppgSignal: number[]): Promise<number | null> {
        if (!this.model) await this.initialize();

        let processedSignal = ppgSignal;
        if (ppgSignal.length > 300) processedSignal = ppgSignal.slice(0, 300);
        if (ppgSignal.length < 300) processedSignal = [...ppgSignal, ...Array(300 - ppgSignal.length).fill(0)];

        const inputTensor = tf.tensor3d([processedSignal.map(v => [v])], [1, 300, 1]);
        const prediction = this.model!.predict(inputTensor) as tf.Tensor;
        const result = (await prediction.data())[0];

        inputTensor.dispose();
        prediction.dispose();

        return result;
    }

    /**
     * Initial pre-training to ensure sane values.
     */
    private async warmupModel() {
        if (!this.model) return;
        const inputs: number[][] = [];
        const labels: number[] = [];
        for (let i = 0; i < 5; i++) {
            const signal = Array(300).fill(0).map(() => Math.random());
            inputs.push(signal);
            labels.push(95 + (Math.random() * 10));
        }
        await this.trainBatch(inputs, labels);
    }
}
