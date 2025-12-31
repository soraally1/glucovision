import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    try {
        const { recipeId, userId } = await req.json();

        if (!recipeId || !userId) {
            return NextResponse.json(
                { error: 'Recipe ID and User ID are required' },
                { status: 400 }
            );
        }

        const recipeRef = doc(db, 'recipes', recipeId);

        await updateDoc(recipeRef, {
            isSaved: true,
            savedAt: serverTimestamp()
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Recipe Save API Error]:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to save recipe' },
            { status: 500 }
        );
    }
}
