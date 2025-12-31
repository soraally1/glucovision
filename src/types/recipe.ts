import { Timestamp } from 'firebase/firestore';

export interface Recipe {
    id: string;
    userId: string;
    foodName: string;
    content: string;
    answers: Record<string, string>;
    generatedAt: Timestamp;
    savedAt?: Timestamp;
    isSaved: boolean;
    metadata: {
        sugarLevel: number;
        medication: string;
        preferences: string;
    };
}

export interface RecipeCreateInput {
    userId: string;
    foodName: string;
    content: string;
    answers: Record<string, string>;
    metadata: {
        sugarLevel: number;
        medication: string;
        preferences: string;
    };
}

export interface SavedRecipeListItem {
    id: string;
    foodName: string;
    generatedAt: Date;
    savedAt: Date;
    metadata: {
        sugarLevel: number;
    };
}
