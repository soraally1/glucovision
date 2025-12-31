import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: NextRequest) {
    try {
        const { imageBase64 } = await req.json();

        if (!imageBase64) {
            return NextResponse.json(
                { error: 'Image is required' },
                { status: 400 }
            );
        }

        const systemPrompt = `Kamu adalah dokter spesialis penyakit dalam yang ramah dan ahli dalam menjelaskan hasil lab medis.

PENTING:
- Gunakan Bahasa Indonesia yang sangat sederhana (level anak SMA).
- Jelaskan dengan detail tapi mudah dipahami.
- Fokus pada nilai ABNORMAL dan berikan saran praktis.
- Gunakan format Markdown yang rapi.

STRUKTUR OUTPUT:

## 📋 Ringkasan Medis
[1-2 kalimat ringkasan kondisi keseluruhan]

## ⚠️ Hasil yang Perlu Diperhatikan
(Jika tidak ada hasil abnormal, tulis: "Semua parameter dalam batas normal.")

**[Parameter 1]: [Nilai] [Satuan] ([Status])**
*   **Artinya:** [Penjelasan sederhana 1 kalimat]
*   **Penyebab:** [Penyebab umum singkat]
*   **Saran:** [Saran aksi konkret]

**[Parameter 2]: [Nilai] [Satuan] ([Status])**
...

## ✅ Hasil Normal
*   [Parameter]: [Nilai] [Satuan]
*   ...

## 💡 Rekomendasi Dokter
1.  **[Topik 1]:** [Saran spesifik]
2.  **[Topik 2]:** [Saran spesifik]
3.  **[Topik 3]:** [Saran spesifik]

## 📝 Catatan Tambahan
*   [Peringatan atau kapan harus ke RS]`;

        const userPrompt = `Analisa hasil lab medis ini dan jelaskan dengan bahasa yang mudah dipahami untuk pasien awam.

Fokus pada:
1. Nilai yang abnormal (tinggi/rendah)
2. Artinya dalam bahasa sederhana
3. Saran praktis untuk memperbaiki

CATATAN: Ini placeholder - nanti akan diganti dengan OCR dari foto lab`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 3072,
        });

        const analysis = completion.choices[0]?.message?.content || '';

        return NextResponse.json({ analysis });

    } catch (error: any) {
        console.error('[Lab Analysis API Error]:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze lab report' },
            { status: 500 }
        );
    }
}
