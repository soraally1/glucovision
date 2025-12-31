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

        // For now, analyze based on mock data since vision API might not be available
        // You can replace this with actual vision API call when available

        const systemPrompt = `Kamu adalah ahli gizi yang dapat menganalisis foto makanan.

PENTING:
- JANGAN GUNAKAN EMOJI
- Gunakan Bahasa Indonesia
- Berikan analisis DETAIL dan AKURAT
- Fokus pada dampak untuk penderita diabetes

STRUKTUR OUTPUT:
## Analisis Makanan dari Foto

### Identifikasi Makanan
[Nama makanan yang terdeteksi]

### Estimasi Porsi
- [komponen 1]: [porsi] ([ukuran])
- ...

### Analisis Nutrisi Detail

#### Makronutrien Total
- Kalori: [nilai] kkal
- Karbohidrat: [nilai]g
- Protein: [nilai]g
- Lemak: [nilai]g
- Serat: [nilai]g

#### Breakdown Per Komponen
**[Komponen 1] ([porsi])**
- Kalori: [nilai] kkal
- Karbohidrat: [nilai]g
- IG: [kategori] ([angka])
...

### Dampak untuk Diabetes

#### Prediksi Kenaikan Gula Darah
- Estimasi kenaikan: +[angka] mg/dL dalam 1-2 jam
- Beban Glikemik Total: [kategori] ([angka])
- Status: [AMAN/PERHATIAN/BAHAYA]

#### Komponen Berisiko
1. [komponen] ([alasan])
...

### Rekomendasi Modifikasi

#### Langkah Segera (Jika Belum Makan)
1. [saran]
...

#### Langkah Setelah Makan
1. [saran]
...

### Alternatif Lebih Sehat
- [alternatif dengan detail]
...

### Tips Penting
- [tip penting]
...`;

        const userPrompt = `Analisa makanan dalam foto ini untuk penderita diabetes. Berikan informasi lengkap tentang nutrisi dan dampaknya.

CATATAN: Ini adalah placeholder - nanti akan diganti dengan actual vision API`;

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
        console.error('[Food Analysis API Error]:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze food' },
            { status: 500 }
        );
    }
}
