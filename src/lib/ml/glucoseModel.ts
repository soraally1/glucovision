
import * as tf from '@tensorflow/tfjs';

/**
 * Creates the Hybrid CNN-LSTM model for Glucose Estimation.
 * 
 * Architecture:
 * 1. Input Layer: Takes raw PPG signal window (e.g., 300 frames).
 * 2. Conv1D Layers: Extract morphological features (systolic peaks, dicrotic notches).
 * 3. LSTM Layer: Captures temporal dependencies and HRV trends over the window.
 * 4. Dense Layers: Regress the extracted features to a scalar glucose value.
 */
export const createGlucoseModel = (): tf.LayersModel => {
    const inputShape = [300, 1]; // 300 time steps, 1 feature (signal intensity)

    const model = tf.sequential();

    // --- Feature Extraction (CNN) ---
    model.add(tf.layers.conv1d({
        inputShape: inputShape,
        filters: 32,
        kernelSize: 5,
        strides: 1,
        activation: 'relu',
        padding: 'same',
        kernelInitializer: 'heNormal'
    }));

    model.add(tf.layers.maxPooling1d({ poolSize: 2 }));

    model.add(tf.layers.conv1d({
        filters: 64,
        kernelSize: 3,
        strides: 1,
        activation: 'relu',
        padding: 'same'
    }));

    model.add(tf.layers.maxPooling1d({ poolSize: 2 }));

    // --- Temporal Analysis (LSTM) ---
    // We return sequences=false because we want one vector representing the whole window
    model.add(tf.layers.lstm({
        units: 64,
        returnSequences: false
    }));

    // --- Regression Head (FC) ---
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Output: Single scalar value (Glucose mg/dL)
    model.add(tf.layers.dense({ units: 1, activation: 'linear' }));

    // Compile
    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae'] // Mean Absolute Error is easier to interpret for glucose (mg/dL)
    });

    return model;
};
