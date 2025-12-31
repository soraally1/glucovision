
require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function uploadCalibration() {
    console.log("--- Uploading Algorithm Parameters to Firestore ---");

    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // These values are derived from our analysis of the 'hearatedataset'
        // RMSSD Mean: ~15, Skew: ~0, Kurt: ~0.5
        const heartRateConfig = {
            description: "Parameters derived from 369k record dataset validation",
            lastUpdated: Date.now(),
            validation: {
                skewness_min: -1.5,
                skewness_max: 1.5,
                kurtosis_max: 5.0, // Somewhat loose to allow for real-world noise
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

        await setDoc(doc(db, "system_config", "heart_rate"), heartRateConfig);

        console.log("Success! Calibration data saved to 'system_config/heart_rate'.");
        console.log("The app will now pull these 'smart' params from the cloud.");
        process.exit(0);
    } catch (error) {
        console.error("Upload failed:", error.message);
        process.exit(1);
    }
}

uploadCalibration();
