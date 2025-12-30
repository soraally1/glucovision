// modelLoader.ts
import * as tf from '@tensorflow/tfjs';

export class ModelLoader {
    private static instance: ModelLoader;
    private model: tf.LayersModel | null = null;

    private constructor() { }

    static getInstance(): ModelLoader {
        if (!ModelLoader.instance) {
            ModelLoader.instance = new ModelLoader();
        }
        return ModelLoader.instance;
    }

    async loadModel(path: string = '/models/model.json'): Promise<tf.LayersModel | null> {
        try {
            this.model = await tf.loadLayersModel(path);
            console.log("Model loaded successfully");
            return this.model;
        } catch (error) {
            console.warn("Failed to load model:", error);
            return null;
        }
    }

    getModel(): tf.LayersModel | null {
        return this.model;
    }
}
