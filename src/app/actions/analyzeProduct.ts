'use server';

import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface AnalysisResult {
    productName: string;
    sugarContent: number; // in grams
    healthVerdict: 'Healthy' | 'Moderate' | 'Unhealthy';
    notes: string;
}

export async function analyzeProduct(imageBase64: string): Promise<AnalysisResult> {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured');
    }

    try {
        // Remove data URL prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        // Debug log
        console.log("Starting Groq Analysis with model: llama-3.2-11b-vision-preview");

        const chatCompletion = await groq.chat.completions.create({
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Anda adalah asisten kesehatan ahli. Analisis gambar produk ini dengan sangat teliti. \n1. Identifikasi nama produk yang tepat.\n2. Cari tabel informasi nilai gizi dan ambil jumlah 'Gula' (Sugar) per sajian.\n3. Jika tabel tidak ada/tidak jelas, berikan estimasi yang edukatif berdasarkan basis data produk serupa.\n4. BERIKAN PENJELASAN (notes) YANG SANGAT DETAIL DALAM BAHASA INDONESIA. Penjelasan harus mencakup apakah produk ini aman untuk penderita diabetes, berapa batas konsumsi harian yang disarankan, dan apa dampaknya jika dikonsumsi berlebihan.\n\nKembalikan respons HANYA dalam format JSON: { \"productName\": \"string\", \"sugarContent\": number, \"healthVerdict\": \"Healthy\" | \"Moderate\" | \"Unhealthy\", \"notes\": \"string\" }."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": `data:image/jpeg;base64,${base64Data}`
                            }
                        }
                    ]
                }
            ],
            "model": "meta-llama/llama-4-scout-17b-16e-instruct",
            "temperature": 0.1,
            "max_tokens": 1024,
            "response_format": { type: "json_object" }
        });

        const content = chatCompletion.choices[0].message.content;
        if (!content) {
            console.error("Groq returned empty content");
            throw new Error('No content from Groq');
        }

        const result = JSON.parse(content) as AnalysisResult;
        console.log("Analysis successful:", result.productName);
        return result;

    } catch (error: any) {
        console.error("Groq Analysis Failed Detail:", error?.message || error);

        // Return a more descriptive error if it's a known issue
        if (error?.status === 401) throw new Error('API Key Groq tidak valid atau belum dikonfigurasi.');
        if (error?.status === 429) throw new Error('Batas penggunaan API tercapai. Silakan coba lagi nanti.');

        throw new Error('Gagal menganalisis produk. Pastikan gambar jelas dan coba lagi.');
    }
}
