import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const limitCount = parseInt(searchParams.get('limit') || '20');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const recipesRef = collection(db, 'recipes');
        const q = query(
            recipesRef,
            where('userId', '==', userId),
            where('isSaved', '==', true),
            orderBy('savedAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const recipes = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                foodName: data.foodName,
                generatedAt: data.generatedAt?.toDate().toISOString(),
                savedAt: data.savedAt?.toDate().toISOString(),
                metadata: data.metadata
            };
        });

        return NextResponse.json({ recipes });

    } catch (error: any) {
        console.error('[Saved Recipes API Error]:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch saved recipes' },
            { status: 500 }
        );
    }
}
