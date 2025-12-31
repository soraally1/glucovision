import { db } from './config';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    isDev: boolean;
    createdAt: number;
    lastLogin: number;
}

const USERS_COLLECTION = 'users';

/**
 * Create or update user profile in Firestore
 */
export const createUserProfile = async (user: User): Promise<UserProfile> => {
    const userRef = doc(db, USERS_COLLECTION, user.uid);

    // Check if user already exists
    const userSnap = await getDoc(userRef);

    const now = Date.now();

    if (userSnap.exists()) {
        // Update last login
        const existingData = userSnap.data() as UserProfile;
        const updatedProfile: UserProfile = {
            ...existingData,
            lastLogin: now,
            // Update display info in case they changed it
            displayName: user.displayName,
            photoURL: user.photoURL,
        };

        await setDoc(userRef, {
            ...updatedProfile,
            updatedAt: Timestamp.now()
        }, { merge: true });

        return updatedProfile;
    } else {
        // Create new user profile
        const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            isDev: false, // Default to false, admin can manually set to true
            createdAt: now,
            lastLogin: now,
        };

        await setDoc(userRef, {
            ...newProfile,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        return newProfile;
    }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
};
