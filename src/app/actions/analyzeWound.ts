'use server';

import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface WoundAnalysisResult {
    detected: boolean;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    signs: {
        redness: boolean;
        swelling: boolean;
        pus: boolean;
        blackening: boolean; // Gangrene sign
        openWound: boolean;
    };
    analysis: string; // Deskripsi detail
    recommendation: string; // Saran tindakan
}

export async function analyzeWound(imageBase64: string): Promise<WoundAnalysisResult> {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured');
    }

    try {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const chatCompletion = await groq.chat.completions.create({
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": `Anda adalah sistem AI skrining awal untuk komplikasi kaki diabetik (Diabetic Foot Ulcer Screening). Tugas Anda adalah menganalisis gambar kaki pasien untuk mencari tanda-tanda infeksi atau luka.

PENTING: Anda BUKAN pengganti dokter. Bahasa Anda harus bersifat "screening" (mendeteksi potensi risiko), bukan mendiagnosis penyakit.

Analisis gambar ini untuk tanda-tanda berikut:
1. Kemerahan (Redness/Erythema)
2. Pembengkakan (Swelling/Edema)
3. Nanah/Cairan (Pus/Discharge)
4. Jaringan Hitam/Mati (Blackening/Gangrene/Necrosis) - INI SANGAT KRITIS.
5. Luka Terbuka (Open Wound/Ulcer)

Tentukan tingkat risiko:
- Low: Kulit utuh, tidak ada tanda radang.
- Medium: Ada kemerahan ringan atau kulit kering pecah-pecah tanpa infeksi jelas.
- High: Ada luka terbuka, nanah, atau bengkak signifikan.
- Critical: Ada jaringan hitam (gangren) atau infeksi luas. SEGERA KE IGD.

Berikan output HANYA dalam format JSON berikut:
{
  "detected": boolean, // true jika ada abnormalitas apapun
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "signs": {
    "redness": boolean,
    "swelling": boolean,
    "pus": boolean,
    "blackening": boolean,
    "openWound": boolean
  },
  "analysis": "Penjelasan singkat 2-3 kalimat tentang apa yang terlihat visual.",
  "recommendation": "Saran tindakan (misal: 'Periksa rutin', 'Oleskan pelembab', 'Segera ke dokter hari ini')."
}`
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
            "max_tokens": 512,
            "response_format": { type: "json_object" }
        });

        const content = chatCompletion.choices[0].message.content;
        if (!content) throw new Error('No content from AI');

        const result = JSON.parse(content) as WoundAnalysisResult;
        return result;

    } catch (error: any) {
        console.error("Wound Analysis Error:", error);
        throw new Error('Gagal menganalisis foto. Pastikan foto jelas dan coba lagi.');
    }
}
