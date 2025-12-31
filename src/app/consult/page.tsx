'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { ChefHat, FileText, Upload, Sparkles, ArrowRight, Loader2, Camera, X, AlertCircle, Bookmark } from 'lucide-react';
import { aiService, Question } from '@/lib/ai/aiClient';

export default function ConsultPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'recipe' | 'lab' | 'saved'>('recipe');
    const [isLoading, setIsLoading] = useState(false);

    // --- Recipe State ---
    const [step, setStep] = useState<'input' | 'questions'>('input');
    const [foodQuery, setFoodQuery] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [foodImage, setFoodImage] = useState<string | null>(null);
    const foodInputRef = useRef<HTMLInputElement>(null);

    // --- Lab State ---
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [labAnalysis, setLabAnalysis] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Saved State ---
    const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
    const [savedLabs, setSavedLabs] = useState<any[]>([]);
    const [savedTabFilter, setSavedTabFilter] = useState<'recipe' | 'lab'>('recipe');

    useEffect(() => {
        if (activeTab === 'saved' && user) {
            loadSavedItems();
        }
    }, [activeTab, user]);

    const loadSavedItems = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [recipes, labs] = await Promise.all([
                aiService.getSavedRecipes(user.uid),
                aiService.getSavedLabResults(user.uid)
            ]);
            setSavedRecipes(recipes);
            setSavedLabs(labs);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveLab = async () => {
        if (!labAnalysis || !selectedImage || !user) return;
        try {
            await aiService.saveLabAnalysis(labAnalysis, selectedImage, user.uid);
            alert('Hasil lab berhasil disimpan!');
        } catch (e) {
            console.error(e);
            alert('Gagal menyimpan hasil lab.');
        }
    };

    // Listen to auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });
        return () => unsubscribe();
    }, []);

    // --- Handlers: Recipe Flow ---
    const startConsultation = async () => {
        if (!foodQuery.trim() && !foodImage) return;
        setIsLoading(true);
        setStep('questions');

        try {
            const q = await aiService.generateContextualQuestions(foodQuery || 'Food Photo');
            setQuestions(q);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (qId: string, val: string) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const submitConsultation = async () => {
        const userId = user?.uid || 'anonymous';

        setIsLoading(true);
        try {
            if (foodImage) {
                // For food image analysis (placeholder - will be improved later)
                const result = await aiService.analyzeFoodFromImage(foodImage);
                const encodedRecipe = btoa(result);
                router.push(`/recipe?data=${encodedRecipe}`);
            } else {
                // Generate recipe and save to Firestore
                const { recipeId } = await aiService.generatePersonalizedRecipe(
                    foodQuery,
                    answers,
                    userId
                );

                // Navigate to recipe page with ID
                router.push(`/recipe?id=${recipeId}`);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to generate recipe. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    const handleFoodImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFoodImage(reader.result as string);
                setFoodQuery('');
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Handlers: Lab Flow ---
    const handleLabImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLabAnalyze = async () => {
        if (!selectedImage) return;
        setIsLoading(true);
        try {
            const result = await aiService.analyzeLabReport(selectedImage);
            setLabAnalysis(result);
        } catch (e) {
            console.error(e);
            alert('Gagal menganalisa foto. Coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetRecipe = () => {
        setStep('input');
        setFoodQuery('');
        setFoodImage(null);
        setAnswers({});
    };

    return (
        <div className="flex flex-col h-full min-h-screen bg-white">
            <TopNav />

            <main className="flex-1 flex flex-col pt-24 pb-32 px-6 lg:px-8 w-full max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">AI Health Consultant</h1>
                    <p className="text-slate-500">Dokter & Chef pribadi Anda</p>
                </div>

                {/* Tabs */}
                {/* Tabs */}
                <div className="flex border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('recipe')}
                        className={`flex items-center gap-2 px-4 py-3 md:px-6 font-semibold transition-colors border-b-2 whitespace-nowrap text-sm md:text-base ${activeTab === 'recipe'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <ChefHat className="w-5 h-5 flex-shrink-0" />
                        Chef AI
                    </button>
                    <button
                        onClick={() => setActiveTab('lab')}
                        className={`flex items-center gap-2 px-4 py-3 md:px-6 font-semibold transition-colors border-b-2 whitespace-nowrap text-sm md:text-base ${activeTab === 'lab'
                            ? 'border-emerald-500 text-emerald-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <FileText className="w-5 h-5 flex-shrink-0" />
                        Lab Reader
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`flex items-center gap-2 px-4 py-3 md:px-6 font-semibold transition-colors border-b-2 whitespace-nowrap text-sm md:text-base ${activeTab === 'saved'
                            ? 'border-emerald-500 text-emerald-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Bookmark className="w-5 h-5 flex-shrink-0" />
                        Resep Tersimpan
                    </button>
                </div>

                {/* --- CHEF AI TAB --- */}
                {activeTab === 'recipe' && (
                    <div className="max-w-2xl">

                        {/* Step 1: Input */}
                        {step === 'input' && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Mau makan apa?</h2>

                                {/* Photo Upload */}
                                <div
                                    onClick={() => foodInputRef.current?.click()}
                                    className={`mb-6 border-2 border-dashed p-8 cursor-pointer transition-colors ${foodImage ? 'border-orange-500 bg-orange-50' : 'border-slate-300 hover:border-orange-400'
                                        }`}
                                >
                                    <input type="file" ref={foodInputRef} className="hidden" accept="image/*" onChange={handleFoodImageUpload} />
                                    {foodImage ? (
                                        <div className="relative">
                                            <img src={foodImage} className="w-full h-48 object-cover" alt="Food" />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setFoodImage(null); }}
                                                className="absolute top-2 right-2 bg-black text-white p-2 hover:bg-slate-800"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                            <p className="font-semibold text-slate-700">Foto Makanan</p>
                                            <p className="text-sm text-slate-500 mt-1">AI akan analisa nutrisinya</p>
                                        </div>
                                    )}
                                </div>

                                <div className="text-center text-xs font-semibold text-slate-400 mb-6">
                                    ATAU KETIK MANUAL
                                </div>

                                {/* Text Input */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Makanan</label>
                                    <input
                                        type="text"
                                        value={foodQuery}
                                        onChange={(e) => { setFoodQuery(e.target.value); setFoodImage(null); }}
                                        placeholder="Contoh: Nasi Goreng Spesial..."
                                        className="w-full px-4 py-3 border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 outline-none transition-colors"
                                    />
                                </div>

                                <button
                                    onClick={startConsultation}
                                    disabled={(!foodQuery && !foodImage) || isLoading}
                                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                    LANJUT KONSULTASI
                                </button>

                                {/* Info */}
                                <div className="space-y-4 pt-8 mt-8 border-t border-slate-200">
                                    <div className="border-l-4 border-green-500 pl-4 py-2">
                                        <h3 className="font-semibold text-slate-900 mb-1">Rendah Gula</h3>
                                        <p className="text-sm text-slate-600">Resep khusus untuk diabetes</p>
                                    </div>
                                    <div className="border-l-4 border-orange-500 pl-4 py-2">
                                        <h3 className="font-semibold text-slate-900 mb-1">Kalori Terkontrol</h3>
                                        <p className="text-sm text-slate-600">Sesuai kebutuhan harian</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Questions */}
                        {step === 'questions' && (
                            <div>
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Sedikit Detail Lagi...
                                    </h2>
                                    <button
                                        onClick={resetRecipe}
                                        className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                                    >
                                        Ubah Makanan
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {questions.map((q, idx) => (
                                        <div key={q.id}>
                                            <label className="block text-sm font-semibold text-slate-800 mb-3">
                                                <span className="text-orange-600 mr-2">{idx + 1}.</span>
                                                {q.text}
                                            </label>

                                            {q.type === 'text' ? (
                                                <input
                                                    type="text"
                                                    placeholder="Ketik jawabanmu..."
                                                    className="w-full px-4 py-3 border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 outline-none transition-colors"
                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                />
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {q.options?.map(opt => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => handleAnswerChange(q.id, opt)}
                                                            className={`px-4 py-2 text-sm font-semibold border-2 transition-colors ${answers[q.id] === opt
                                                                ? 'bg-orange-500 border-orange-500 text-white'
                                                                : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                                                                }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={submitConsultation}
                                    disabled={isLoading}
                                    className="w-full mt-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    {foodImage ? 'ANALISA FOTO' : 'BUATKAN RESEP'}
                                </button>
                            </div>
                        )}
                    </div>
                )}



                {activeTab === 'lab' && (
                    <div className="max-w-2xl space-y-6">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed p-12 cursor-pointer transition-colors ${selectedImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400'
                                }`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleLabImageUpload}
                            />

                            {selectedImage ? (
                                <div>
                                    <img src={selectedImage} alt="Preview" className="max-h-80 mx-auto object-contain mb-4" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                                        className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                                    >
                                        Hapus Foto
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">Upload Foto Hasil Lab</h3>
                                    <p className="text-sm text-slate-500">AI akan jelaskan artinya</p>
                                </div>
                            )}
                        </div>


                        {selectedImage && !labAnalysis && (
                            <button
                                onClick={handleLabAnalyze}
                                disabled={isLoading}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                Analisa Hasil Lab
                            </button>
                        )}

                        {labAnalysis && (
                            <div className="bg-white border text-left rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-4 overflow-hidden">
                                {/* Header: Title + Actions */}
                                <div className="bg-emerald-50 p-4 flex items-center justify-between border-b border-emerald-100">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-emerald-600" />
                                        <h3 className="font-bold text-slate-800">Hasil Analisa AI</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleSaveLab}
                                            disabled={!user}
                                            className="px-3 py-1.5 bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <Bookmark className="w-4 h-4" />
                                            Simpan
                                        </button>
                                        <button
                                            onClick={() => { setLabAnalysis(null); setSelectedImage(null); }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 prose prose-sm md:prose-base max-w-none text-slate-700 
                                    prose-headings:text-slate-900 prose-headings:font-bold prose-headings:mb-3 prose-headings:mt-6
                                    prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4
                                    prose-strong:text-slate-900 prose-strong:font-bold
                                    prose-ul:list-disc prose-ul:pl-5 prose-li:mb-1
                                    first:prose-headings:mt-0">
                                    <ReactMarkdown>{labAnalysis}</ReactMarkdown>
                                </div>

                                {/* Footer: Next Action */}
                                <div className="p-4 bg-slate-50 border-t border-slate-100">
                                    <p className="text-xs text-slate-500 mb-3 text-center">Ingin menu makan yang sesuai hasil ini?</p>
                                    <button
                                        onClick={() => setActiveTab('recipe')}
                                        className="w-full py-3 bg-orange-500 text-white hover:bg-orange-600 font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98]"
                                    >
                                        <ChefHat className="w-5 h-5" />
                                        Buatkan Resep Khusus
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tips */}
                        {!labAnalysis && (
                            <div className="border-l-4 border-blue-500 pl-4 py-3">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-2">Tips Upload</h3>
                                        <ul className="text-sm text-slate-600 space-y-1">
                                            <li>• Pastikan foto jelas</li>
                                            <li>• Semua teks terlihat</li>
                                            <li>• Cahaya cukup terang</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- SAVED RECIPES TAB --- */}
                {activeTab === 'saved' && (
                    <div className="max-w-4xl w-full">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Resep Tersimpan Anda</h2>

                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                            </div>
                        ) : savedRecipes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {savedRecipes.map((recipe) => (
                                    <div
                                        key={recipe.id}
                                        onClick={() => router.push(`/recipe?id=${recipe.id}`)}
                                        className="border border-slate-200 rounded-lg p-4 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                                {recipe.foodName}
                                            </h3>
                                            <span className="text-xs text-slate-400">
                                                {new Date(recipe.generatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                                            <div className="px-2 py-1 bg-slate-100 rounded text-xs">
                                                Gula Darah: {recipe.metadata?.sugarLevel || '-'} mg/dL
                                            </div>
                                        </div>
                                        <div className="flex items-center text-emerald-500 text-sm font-medium">
                                            Lihat Resep <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">Belum ada resep tersimpan</p>
                                <button
                                    onClick={() => setActiveTab('recipe')}
                                    className="mt-4 text-emerald-600 font-semibold hover:underline"
                                >
                                    Buat Resep Baru
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </main>
            <BottomNav />
        </div>
    );
}
