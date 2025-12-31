
import { db } from "./config";
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp, where } from "firebase/firestore";

// Define the shape of our data
export interface MeasurementData {
    id?: string;
    timestamp: number;
    glucose: number;
    bpm: number;
    confidence: number;
    rawPPG?: number[];
    isSynced?: boolean;
    userId?: string; // Linked to Auth User
}

const COLLECTION_NAME = "measurements";

/**
 * Saves a new measurement to Firestore.
 */
export const saveMeasurement = async (data: MeasurementData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            createdAt: Timestamp.now()
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
 * Optionally filters by userId if provided.
 */
export const getMeasurements = async (limitCount: number = 50, userId?: string): Promise<MeasurementData[]> => {
    try {
        let q;

        if (userId) {
            q = query(
                collection(db, COLLECTION_NAME),
                where("userId", "==", userId),
                orderBy("timestamp", "desc"),
                limit(limitCount)
            );
        } else {
            // Fallback for global view or legacy data
            q = query(
                collection(db, COLLECTION_NAME),
                orderBy("timestamp", "desc"),
                limit(limitCount)
            );
        }

        const querySnapshot = await getDocs(q);
        const results: MeasurementData[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            results.push({
                id: doc.id,
                timestamp: data.timestamp,
                glucose: data.glucose,
                bpm: data.bpm,
                confidence: data.confidence,
                userId: data.userId
            } as MeasurementData);
        });
        return results;
    } catch (e) {
        console.error("Error getting documents: ", e);
        return [];
    }
};
