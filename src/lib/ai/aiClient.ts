// Client-side AI service that calls API routes
// This replaces the mock aiService.ts

export interface Question {
    id: string;
    text: string;
    type: 'text' | 'choice';
    options?: string[];
}

import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

export class AIClient {
    // Generate contextual questions using LLM
    async generateContextualQuestions(foodQuery: string): Promise<Question[]> {
        console.log(`[AI Client] Generating questions for ${foodQuery}`);

        const response = await fetch('/api/recipe/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ foodName: foodQuery })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate questions');
        }

        const data = await response.json();
        return data.questions;
    }

    // Generate personalized recipe using real LLM
    async generatePersonalizedRecipe(
        foodName: string,
        answers: Record<string, string>,
        userId: string
    ): Promise<{ recipeId: string; recipe: string }> {
        console.log(`[AI Client] Generating recipe for ${foodName}`);

        const response = await fetch('/api/recipe/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ foodName, answers, userId })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate recipe');
        }

        const data = await response.json();

        // Save to Firestore (Client-side)
        // This is safe because the client is authenticated (if logged in)
        // and our rules allow create if authenticated.
        let recipeId = 'temp-' + Date.now();

        try {
            if (userId && userId !== 'anonymous') {
                const recipeRef = await addDoc(collection(db, 'recipes'), {
                    userId: userId,
                    foodName: foodName,
                    content: data.recipe,
                    answers: answers,
                    generatedAt: serverTimestamp(),
                    isSaved: false, // Initially not "bookmarked", just generated history
                    metadata: {
                        sugarLevel: parseInt(answers['q1'] || '0'),
                        isHighSugar: parseInt(answers['q1'] || '0') > 180,
                        medication: answers['q2'] || 'Tidak'
                    }
                });
                recipeId = recipeRef.id;
                console.log(`[AI Client] Recipe saved to Firestore with ID: ${recipeId}`);
            }
        } catch (e) {
            console.error('[AI Client] Failed to save recipe to Firestore:', e);
            // We continue even if save fails, returning the recipe text
        }

        return {
            recipeId: recipeId,
            recipe: data.recipe
        };
    }

    // Analyze food from image using real LLM
    async analyzeFoodFromImage(imageBase64: string): Promise<string> {
        console.log(`[AI Client] Analyzing food image`);

        const response = await fetch('/api/recipe/analyze-food', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64 })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to analyze food');
        }

        const data = await response.json();
        return data.analysis;
    }

    // Analyze lab report using real LLM
    async analyzeLabReport(imageBase64: string): Promise<string> {
        console.log(`[AI Client] Analyzing lab report`);

        const response = await fetch('/api/lab/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64 })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to analyze lab report');
        }

        const data = await response.json();
        return data.analysis;
    }

    // Fetch recipe by ID from Firestore
    async getRecipeById(recipeId: string): Promise<any> {
        console.log(`[AI Client] Fetching recipe ${recipeId}`);

        const response = await fetch(`/api/recipe/${recipeId}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch recipe');
        }

        const data = await response.json();
        return data.recipe;
    }

    // --- Lab Results Methods ---

    // Save lab analysis
    async saveLabAnalysis(analysis: string, imageBase64: string, userId: string): Promise<string> {
        console.log(`[AI Client] Saving lab analysis for user ${userId}`);

        try {
            const docRef = await addDoc(collection(db, 'lab_results'), {
                userId,
                analysis,
                imageBase64, // Be careful with size, but for MVP it's okay (Firestore limit 1MB)
                createdAt: serverTimestamp(),
                title: 'Hasil Lab ' + new Date().toLocaleDateString('id-ID')
            });
            console.log(`[AI Client] Lab analysis saved with ID: ${docRef.id}`);
            return docRef.id;
        } catch (e) {
            console.error('[AI Client] Failed to save lab analysis:', e);
            throw new Error('Failed to save lab analysis');
        }
    }

    // Get saved lab results
    async getSavedLabResults(userId: string): Promise<any[]> {
        console.log(`[AI Client] Fetching saved lab results for user ${userId}`);
        try {
            const q = query(
                collection(db, 'lab_results'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
            }));
        } catch (e) {
            console.error('[AI Client] Failed to fetch saved lab results:', e);
            return [];
        }
    }

    // Save recipe
    // Save recipe (Client-side)
    async saveRecipe(recipeId: string, userId: string): Promise<void> {
        console.log(`[AI Client] Saving recipe ${recipeId}`);

        try {
            const recipeRef = doc(db, 'recipes', recipeId);
            await updateDoc(recipeRef, {
                isSaved: true,
                savedAt: serverTimestamp()
            });
            console.log(`[AI Client] Recipe ${recipeId} marked as saved`);
        } catch (e) {
            console.error('[AI Client] Failed to save recipe to Firestore:', e);
            throw new Error('Failed to save recipe');
        }
    }

    // Get saved recipes
    async getSavedRecipes(userId: string, limit: number = 20): Promise<any[]> {
        console.log(`[AI Client] Fetching saved recipes for user ${userId}`);

        const response = await fetch(`/api/recipe/saved?userId=${userId}&limit=${limit}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch saved recipes');
        }

        const data = await response.json();
        return data.recipes;
    }

    // Compatibility method
    async generateHealthyRecipe(foodName: string, currentGlucose: number): Promise<string> {
        // This now returns just the recipe string for backward compatibility
        const result = await this.generatePersonalizedRecipe(foodName, { 'q1': currentGlucose.toString() }, 'anonymous');
        return result.recipe;
    }
}

export const aiClient = new AIClient();

// Export for backward compatibility
export const aiService = aiClient;
