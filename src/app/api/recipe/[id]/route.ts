import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Recipe ID is required' },
                { status: 400 }
            );
        }

        const recipeDoc = await getDoc(doc(db, 'recipes', id));

        if (!recipeDoc.exists()) {
            return NextResponse.json(
                { error: 'Recipe not found' },
                { status: 404 }
            );
        }

        const data = recipeDoc.data();
        const recipe = {
            id: recipeDoc.id,
            ...data,
            generatedAt: data.generatedAt?.toDate().toISOString(),
            savedAt: data.savedAt?.toDate().toISOString()
        };

        return NextResponse.json({ recipe });

    } catch (error: any) {
        console.error('[Recipe Fetch API Error]:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch recipe' },
            { status: 500 }
        );
    }
}
