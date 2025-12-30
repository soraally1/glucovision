
import { db } from "./config";
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";

// Define the shape of our data
export interface MeasurementData {
    id?: string; // Optional because Firestore provides it
    timestamp: number; // Unix timestamp for easy sorting/charting
    glucose: number;
    bpm: number;
    confidence: number;
    rawPPG?: number[]; // ADDED: Raw signal data for AI Dataset
    isSynced?: boolean; // For future offline sync usage
}

const COLLECTION_NAME = "measurements";

/**
 * Saves a new measurement to Firestore.
 */
export const saveMeasurement = async (data: MeasurementData) => {
    try {
        // We ensure we save it to a subcollection if we had auth, 
        // but for now let's save to a root collection or a single user for staging?
        // User requested "staging" so maybe just a flat list is easier for them to debug.
        // However, standard practice is `users/{userId}/measurements`.
        // Let's use a flat collection for simplicity in this Staging MVP unless Auth is ready.
        // Checking config.ts, auth is exported.
        // If no user is logged in, this might fail if rules require auth.
        // But for Staging/Dev usually rules are open.
        // Let's stick to the root collection 'measurements' for now.

        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            createdAt: Timestamp.now() // Server timestamp for auditing
        });
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

/**
 * Retrieves the latest measurements from Firestore.
 */
export const getMeasurements = async (limitCount: number = 50): Promise<MeasurementData[]> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            orderBy("timestamp", "desc"),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const results: MeasurementData[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            results.push({
                id: doc.id,
                timestamp: data.timestamp,
                glucose: data.glucose,
                bpm: data.bpm,
                confidence: data.confidence
            } as MeasurementData);
        });
        return results;
    } catch (e) {
        console.error("Error getting documents: ", e);
        return [];
    }
};
