'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import { ArrowLeft, Clock, Users, ChevronDown, ChevronUp, Bookmark, Check, Loader2, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import { aiService } from '@/lib/ai/aiClient';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function RecipePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const recipeId = searchParams.get('id');
    const recipeDataParam = searchParams.get('data');

    const [user, setUser] = useState<User | null>(null);
    const [decodedRecipe, setDecodedRecipe] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>('ingredients');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const loadRecipe = async () => {
            setIsLoading(true);
            try {
                if (recipeId) {
                    // Fetch from Firestore
                    const recipe = await aiService.getRecipeById(recipeId);
                    setDecodedRecipe(recipe.content);
                    setIsSaved(recipe.isSaved);
                } else if (recipeDataParam) {
                    // Legacy: Decode from URL params
                    let decoded: string;
                    try {
                        decoded = atob(recipeDataParam);
                    } catch {
                        try {
                            decoded = decodeURIComponent(recipeDataParam);
                        } catch {
                            decoded = recipeDataParam;
                        }
                    }
                    setDecodedRecipe(decoded);
                }
            } catch (error) {
                console.error('Failed to load recipe:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadRecipe();
    }, [recipeId, recipeDataParam]);

    const handleSave = async () => {
        if (!user || !recipeId) return;

        setIsSaving(true);
        try {
            await aiService.saveRecipe(recipeId, user.uid);
            setIsSaved(true);
        } catch (error) {
            console.error('Failed to save recipe:', error);
            alert('Gagal menyimpan resep. Coba lagi.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-full min-h-screen bg-white">
                <TopNav />
                <main className="flex-1 flex items-center justify-center pt-24 pb-32">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                </main>
            </div>
        );
    }

    if (!decodedRecipe) {
        return (
            <div className="flex flex-col h-full min-h-screen bg-white">
                <TopNav />
                <main className="flex-1 flex items-center justify-center pt-24 pb-32 px-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-900 mb-4">Resep Tidak Ditemukan</h1>
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
                        >
                            Kembali
                        </button>
                    </div>
                </main>
            </div>
        );
    }




    // Parse markdown sections
    const sections = parseRecipeSections(decodedRecipe);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="flex flex-col h-full min-h-screen bg-white">
            <TopNav />

            <main className="flex-1 overflow-y-auto pt-24 pb-32 px-6 lg:px-8 max-w-4xl mx-auto w-full">
                {/* Header Controls */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali
                    </button>

                    {recipeId && user && (
                        <button
                            onClick={handleSave}
                            disabled={isSaved || isSaving}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${isSaved
                                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isSaved ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <Bookmark className="w-4 h-4" />
                            )}
                            {isSaved ? 'Tersimpan' : 'Simpan Resep'}
                        </button>
                    )}
                </div>

                {/* Recipe Header */}
                <div className="mb-8 pb-6 border-b-2 border-slate-200">
                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                        {sections.title || 'Resep Personal'}
                    </h1>

                    {sections.info && (
                        <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                            {sections.info.porsi && (
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>{sections.info.porsi}</span>
                                </div>
                            )}
                            {sections.info.waktuTotal && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{sections.info.waktuTotal}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/*Section: Overview */}
                {sections.overview && (
                    <div className="mb-8">
                        <div className="p-6 border-l-4 border-orange-500 bg-slate-50">
                            <div className="text-slate-800 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mb-3 [&>h4]:text-base [&>h4]:font-semibold [&>h4]:text-slate-900 [&>h4]:mt-3 [&>h4]:mb-2 [&>p]:text-slate-800 [&>p]:leading-relaxed [&>p]:mb-2 [&>ul]:my-2 [&>li]:text-slate-800 [&>li]:mb-1 [&>strong]:font-bold [&>strong]:text-slate-900">
                                <ReactMarkdown>{sections.overview}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}

                {/* Accordion Sections */}
                <div className="space-y-4">
                    {/* Ingredients */}
                    {sections.ingredients && (
                        <AccordionSection
                            title="Bahan-Bahan"
                            isExpanded={expandedSection === 'ingredients'}
                            onToggle={() => toggleSection('ingredients')}
                        >
                            <div className="text-slate-800 [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mb-2 [&>h4]:text-base [&>h4]:font-semibold [&>h4]:text-slate-900 [&>h4]:mt-4 [&>h4]:mb-2 [&>ul]:my-2 [&>li]:text-slate-800 [&>li]:mb-1.5 [&>li]:leading-relaxed">
                                <ReactMarkdown>{sections.ingredients}</ReactMarkdown>
                            </div>
                        </AccordionSection>
                    )}

                    {/* Instructions */}
                    {sections.instructions && (
                        <AccordionSection
                            title="Instruksi Memasak"
                            isExpanded={expandedSection === 'instructions'}
                            onToggle={() => toggleSection('instructions')}
                        >
                            <div className="text-slate-800 [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mb-2 [&>h4]:text-base [&>h4]:font-semibold [&>h4]:text-slate-900 [&>h4]:mt-4 [&>h4]:mb-2 [&>ol]:my-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:text-slate-800 [&>li]:mb-2 [&>li]:leading-relaxed">
                                <ReactMarkdown>{sections.instructions}</ReactMarkdown>
                            </div>
                        </AccordionSection>
                    )}

                    {/* Nutrition */}
                    {sections.nutrition && (
                        <AccordionSection
                            title="Informasi Nutrisi"
                            isExpanded={expandedSection === 'nutrition'}
                            onToggle={() => toggleSection('nutrition')}
                        >
                            <div className="text-slate-800 [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mb-2 [&>h4]:text-base [&>h4]:font-semibold [&>h4]:text-slate-900 [&>h4]:mt-4 [&>h4]:mb-2 [&>ul]:my-2 [&>li]:text-slate-800 [&>li]:mb-1.5 [&>li]:leading-relaxed">
                                <ReactMarkdown>{sections.nutrition}</ReactMarkdown>
                            </div>
                        </AccordionSection>
                    )}

                    {/* Diabetes Analysis */}
                    {sections.diabetesAnalysis && (
                        <AccordionSection
                            title="Analisis untuk Diabetes"
                            isExpanded={expandedSection === 'diabetes'}
                            onToggle={() => toggleSection('diabetes')}
                        >
                            <div className="text-slate-800 [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mb-2 [&>h4]:text-base [&>h4]:font-semibold [&>h4]:text-slate-900 [&>h4]:mt-4 [&>h4]:mb-2 [&>ul]:my-2 [&>li]:text-slate-800 [&>li]:mb-1.5 [&>li]:leading-relaxed">
                                <ReactMarkdown>{sections.diabetesAnalysis}</ReactMarkdown>
                            </div>
                        </AccordionSection>
                    )}

                    {/* Tips */}
                    {sections.tips && (
                        <AccordionSection
                            title="Tips & Catatan"
                            isExpanded={expandedSection === 'tips'}
                            onToggle={() => toggleSection('tips')}
                        >
                            <div className="text-slate-800 [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mb-2 [&>h4]:text-base [&>h4]:font-semibold [&>h4]:text-slate-900 [&>h4]:mt-4 [&>h4]:mb-2 [&>ul]:my-2 [&>li]:text-slate-800 [&>li]:mb-1.5 [&>li]:leading-relaxed">
                                <ReactMarkdown>{sections.tips}</ReactMarkdown>
                            </div>
                        </AccordionSection>
                    )}
                </div>

                {/* Full Content - for food image analysis */}
                {!sections.ingredients && (
                    <div className="text-slate-800 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-6 [&>h3]:mb-3 [&>h4]:text-base [&>h4]:font-semibold [&>h4]:text-slate-900 [&>h4]:mt-4 [&>h4]:mb-2 [&>p]:text-slate-800 [&>p]:leading-relaxed [&>p]:mb-3 [&>ul]:my-3 [&>li]:text-slate-800 [&>li]:mb-2 [&>li]:leading-relaxed [&>strong]:font-bold [&>strong]:text-slate-900">
                        <ReactMarkdown>{decodedRecipe}</ReactMarkdown>
                    </div>
                )}

                {/* Action Button */}
                <div className="mt-12 pt-8 border-t-2 border-slate-200">
                    <button
                        onClick={() => router.push('/consult')}
                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
                    >
                        Buat Resep Lain
                    </button>
                </div>
            </main>
        </div>
    );
}

// Accordion Component
function AccordionSection({
    title,
    children,
    isExpanded,
    onToggle
}: {
    title: string;
    children: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="border-2 border-slate-200">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
            >
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-slate-400 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-6 h-6 text-slate-400 flex-shrink-0" />
                )}
            </button>
            {isExpanded && (
                <div className="p-6 pt-0">
                    {children}
                </div>
            )}
        </div>
    );
}

// Helper function to parse recipe sections
function parseRecipeSections(markdown: string) {
    if (!markdown) return {};
    const sections: any = {};

    // Extract title - flexible match
    // Matches "## Resep Personal: Name" until next "###" or end
    const titleMatch = markdown.match(/##\s+Resep Personal:?\s*([\s\S]*?)(?=\s*###|$)/i);
    if (titleMatch) {
        sections.title = titleMatch[1].trim();
    }

    // Extract overview (Informasi Umum section)
    const overviewMatch = markdown.match(/###\s+Informasi Umum\s*([\s\S]*?)(?=\s*###|$)/i);
    if (overviewMatch) {
        sections.overview = overviewMatch[1].trim();
        // Also extract structured info within the overview block
        const porsiMatch = sections.overview.match(/-\s+Porsi:\s*(.+)/i);
        const prepTimeMatch = sections.overview.match(/-\s+Waktu Persiapan:\s*(.+)/i);
        const cookTimeMatch = sections.overview.match(/-\s+Waktu Memasak:\s*(.+)/i);
        sections.info = {
            porsi: porsiMatch ? porsiMatch[1].trim() : null,
            waktuPersiapan: prepTimeMatch ? prepTimeMatch[1].trim() : null,
            waktuMemasak: cookTimeMatch ? cookTimeMatch[1].trim() : null,
            waktuTotal: prepTimeMatch && cookTimeMatch ? `${prepTimeMatch[1].trim()} + ${cookTimeMatch[1].trim()}` : null
        };
    }

    // Extract ingredients
    const ingredientsMatch = markdown.match(/###\s+Bahan-Bahan\s*([\s\S]*?)(?=\s*###|$)/i);
    if (ingredientsMatch) {
        sections.ingredients = ingredientsMatch[1].trim();
    }

    // Extract instructions
    const instructionsMatch = markdown.match(/###\s+Instruksi Memasak\s*([\s\S]*?)(?=\s*###|$)/i);
    if (instructionsMatch) {
        sections.instructions = instructionsMatch[1].trim();
    }

    // Extract nutrition
    const nutritionMatch = markdown.match(/###\s+Informasi Nutrisi(?: Per Porsi)?\s*([\s\S]*?)(?=\s*###|$)/i);
    if (nutritionMatch) {
        sections.nutrition = nutritionMatch[1].trim();
    }

    // Extract diabetes analysis
    const diabetesMatch = markdown.match(/###\s+Analisis untuk Diabetes\s*([\s\S]*?)(?=\s*###|$)/i);
    if (diabetesMatch) {
        sections.diabetesAnalysis = diabetesMatch[1].trim();
    }

    // Extract tips
    const tipsMatch = markdown.match(/###\s+Tips & Catatan\s*([\s\S]*?)$/i);
    if (tipsMatch) {
        sections.tips = tipsMatch[1].trim();
    }

    return sections;
}
