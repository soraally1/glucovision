
import * as tf from '@tensorflow/tfjs';
import { createGlucoseModel } from './glucoseModel';

export class ModelTrainer {
    private model: tf.LayersModel | null = null;
    private readonly MODEL_PATH = 'indexeddb://glucovision-model-v1';

    /**
     * Initializes the trainer. Tries to load existing model, or creates a new one.
     */
    async initialize() {
        try {
            this.model = await tf.loadLayersModel(this.MODEL_PATH);
            console.log("Loaded existing model from IndexedDB.");
        } catch (e) {
            console.log("No saved model found, creating new instance.");
            this.model = createGlucoseModel();
            // Warmup with synthetic data to avoid garbage predictions (random weights) in the beginning
            await this.warmupModel();
        }
    }

    /**
     * Fine-tunes the initial model with synthetic 'normal range' data.
     * This ensures the model outputs sane values (e.g. 90-110) instead of 0 or NaN on first run.
     */
    private async warmupModel() {
        if (!this.model) return;
        console.log("Warming up model with synthetic data...");

        // Generate 20 synthetic samples mapping to "Healthy" range (80 - 120)
        const inputs: number[][] = [];
        const labels: number[] = [];

        for (let i = 0; i < 20; i++) {
            // Create a fake PPG signal (sine wave + noise)
            const signal = Array(300).fill(0).map((_, idx) => Math.sin(idx * 0.1) * 0.5 + 0.5 + (Math.random() * 0.1));
            const targetGlucose = 85 + (Math.random() * 30); // 85 - 115 range

            inputs.push(signal);
            labels.push(targetGlucose);
        }

        await this.trainBatch(inputs, labels);
        console.log("Model warmup complete.");
    }

    /**
     * Trains the model with a batch of data.
     * @param inputs Array of PPG signals (each is number[])
     * @param labels Array of actual glucose values (number[])
     */
    async trainBatch(inputs: number[][], labels: number[]) {
        if (!this.model) await this.initialize();

        // Convert to Tensors
        const tensorInputs = tf.tensor3d(inputs.map(s => s.map(v => [v])), [inputs.length, 300, 1]);
        const tensorLabels = tf.tensor2d(labels, [labels.length, 1]);

        console.log(`Training on ${inputs.length} examples...`);

        const history = await this.model!.fit(tensorInputs, tensorLabels, {
            epochs: 5,
            batchSize: 4,
            validationSplit: 0.2,
            callbacks: {
                onEpochEnd: (epoch, logs) => console.log(`Epoch ${epoch}: loss=${logs?.loss.toFixed(4)}`)
            }
        });

        // Cleanup tensors
        tensorInputs.dispose();
        tensorLabels.dispose();

        // Save updated weights
        await this.model!.save(this.MODEL_PATH);
        console.log("Model updated and saved.");

        return history;
    }

    /**
     * Online Learning: Updates the model with a single new example.
     * Use this after every calibration or confirmed measurement.
     */
    async onlineLearn(ppgSignal: number[], actualGlucose: number) {
        if (!this.model) await this.initialize();

        // Ensure input length is 300
        let processedSignal = ppgSignal;
        if (ppgSignal.length > 300) processedSignal = ppgSignal.slice(0, 300);
        if (ppgSignal.length < 300) processedSignal = [...ppgSignal, ...Array(300 - ppgSignal.length).fill(0)];

        const x = tf.tensor3d([processedSignal.map(v => [v])], [1, 300, 1]);
        const y = tf.tensor2d([actualGlucose], [1, 1]);

        await this.model!.fit(x, y, {
            epochs: 1,
            verbose: 0
        });

        x.dispose();
        y.dispose();

        await this.model!.save(this.MODEL_PATH);
        console.log("Model fine-tuned with new sample.");
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
}
