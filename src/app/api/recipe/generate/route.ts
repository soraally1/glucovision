import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: NextRequest) {
    try {
        const { foodName, answers, userId } = await req.json();

        if (!foodName) {
            return NextResponse.json(
                { error: 'Food name is required' },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const sugarLevel = parseInt(answers['q1'] || '0');
        const isHighSugar = sugarLevel > 180;
        const medication = answers['q2'] || 'Tidak';
        const hunger = answers['q3'] || 'Sedang';
        const allergies = answers['q4'] || 'Tidak ada';
        const preferences = answers['q5'] || 'Gurih Asin';

        const systemPrompt = `Kamu adalah ahli gizi profesional dan chef yang spesialis dalam resep ramah diabetes.

PENTING:
- JANGAN GUNAKAN EMOJI SAMA SEKALI
- Gunakan Bahasa Indonesia
- Berikan resep yang SANGAT DETAIL dan LENGKAP
- Ikuti struktur markdown yang EXACT seperti di bawah

STRUKTUR OUTPUT WAJIB:
## Resep Personal: [Nama Makanan]
Disesuaikan untuk kondisi Anda

### Informasi Umum
- Porsi: [jumlah]
- Waktu Persiapan: [menit]
- Waktu Memasak: [menit]
- Tingkat Kesulitan: [Mudah/Sedang/Sulit]
- Status Gula Darah: [nilai] mg/dL [status]
- Medikasi: [jenis]

### Bahan-Bahan

#### Bahan Utama
- [bahan]: [takaran] ([keterangan])
- ...

#### Sayuran
- [sayuran]: [takaran] ([keterangan])
- ...

#### Bumbu dan Rempah
- [bumbu]: [takaran]
- ...

### Instruksi Memasak

#### Persiapan ([waktu] menit)
1. [langkah detail]
2. ...

#### Memasak ([waktu] menit)
1. [langkah detail dengan timing]
2. ...

### Informasi Nutrisi Per Porsi

#### Makronutrien
- Kalori Total: [nilai] kkal
- Protein: [nilai]g
- Karbohidrat: [nilai]g
- Lemak: [nilai]g
- Serat: [nilai]g
- Gula: [nilai]g (dari sumber alami)

#### Mikronutrien Penting
- Vitamin A: [persentase]% kebutuhan harian ([sumber])
- Vitamin C: [persentase]% kebutuhan harian ([sumber])
- ...

### Analisis untuk Diabetes

#### Indeks Glikemik
- Nilai IG Keseluruhan: [kategori] ([angka])
- Beban Glikemik: [kategori] ([angka])
- Prediksi Kenaikan Gula Darah: +[angka] mg/dL dalam 2 jam

#### Rekomendasi Konsumsi
- Waktu Terbaik: [waktu]
- Kombinasi: [saran]
- Urutan Makan: [urutan]
- Setelah Makan: [aktivitas]

### Tips & Catatan

#### Tips Memasak
- [tip 1]
- ...

#### Variasi Protein (Alternatif)
- [alternatif 1]
- ...

#### Penyimpanan
- [cara penyimpanan]
- ...

#### Catatan Penting
- [catatan khusus berdasarkan kondisi user]
- ...`;

        const userPrompt = `Buatkan resep untuk: ${foodName}

Informasi Pengguna:
- Kadar Gula Darah: ${sugarLevel} mg/dL ${isHighSugar ? '(TINGGI - butuh resep rendah karbohidrat)' : '(Normal)'}
- Medikasi: ${medication}
- Tingkat Kelaparan: ${hunger}
- Alergi/Pantangan: ${allergies}
- Preferensi Rasa: ${preferences}

${isHighSugar ? 'PENTING: Gula darah tinggi! Gunakan pengganti karbohidrat rendah IG seperti nasi kembang kol, shirataki, atau beras merah dalam porsi kecil.' : 'Gunakan karbohidrat kompleks seperti beras merah dalam porsi wajar.'}

Buatkan resep LENGKAP dengan semua detail yang diminta di struktur.`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 4096,
        });

        const recipe = completion.choices[0]?.message?.content || '';

        // Save to Firestore


        // Just return the recipe (saving is now done client-side)
        return NextResponse.json({
            recipe
        });

    } catch (error: any) {
        console.error('[Recipe Generate API Error]:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate recipe' },
            { status: 500 }
        );
    }
}
