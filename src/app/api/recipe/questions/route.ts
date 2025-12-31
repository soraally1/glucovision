import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: NextRequest) {
    try {
        const { foodName } = await req.json();

        if (!foodName) {
            return NextResponse.json(
                { error: 'Food name is required' },
                { status: 400 }
            );
        }

        const systemPrompt = `Kamu adalah ahli gizi yang membantu membuat pertanyaan kontekstual untuk resep diabetes-friendly.

PENTING:
- Generate 5 pertanyaan yang relevan
- Output HARUS dalam format JSON yang EXACT
- JANGAN tambahkan text lain selain JSON
- Pertanyaan harus spesifik untuk makanan yang diminta

FORMAT OUTPUT (JSON):
[
  {
    "id": "q1",
    "text": "Berapa kadar gula darah terakhirmu (mg/dL)?",
    "type": "text"
  },
  {
    "id": "q2",
    "text": "Apakah kamu sedang minum obat diabetes?",
    "type": "choice",
    "options": ["Ya, Insulin", "Ya, Obat Oral", "Tidak"]
  },
  ...
]

RULES:
- id: q1, q2, q3, q4, q5
- type: "text" atau "choice"
- options: hanya untuk type "choice"
- text: pertanyaan dalam Bahasa Indonesia`;

        const userPrompt = `Generate 5 pertanyaan kontekstual untuk membuat resep: ${foodName}

Pertanyaan harus mencakup:
1. Kadar gula darah (type: text)
2. Medikasi diabetes (type: choice)
3. Tingkat kelaparan (type: choice)
4. Alergi/pantangan (type: text)
5. Preferensi rasa yang cocok untuk makanan ini (type: choice)

Return ONLY valid JSON array, no other text.`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.3, // Lower for more consistent JSON
            max_tokens: 1024,
        });

        const response = completion.choices[0]?.message?.content || '[]';

        // Parse JSON response
        let questions;
        try {
            // Remove markdown code blocks if present
            const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            questions = JSON.parse(cleaned);
        } catch (parseError) {
            console.error('[Questions Parse Error]:', parseError);
            console.error('[Raw Response]:', response);
            // Fallback to default questions if parsing fails
            questions = [
                { id: 'q1', text: 'Berapa kadar gula darah terakhirmu (mg/dL)?', type: 'text' },
                { id: 'q2', text: 'Apakah kamu sedang minum obat diabetes?', type: 'choice', options: ['Ya, Insulin', 'Ya, Obat Oral', 'Tidak'] },
                { id: 'q3', text: 'Seberapa lapar kamu sekarang?', type: 'choice', options: ['Sedikit', 'Sedang', 'Sangat Lapar'] },
                { id: 'q4', text: 'Apakah ada alergi makanan atau pantangan?', type: 'text' },
                { id: 'q5', text: 'Kamu lebih suka rasa yang gimana?', type: 'choice', options: ['Gurih Asin', 'Pedas', 'Manis (sedikit)', 'Segar Asam'] }
            ];
        }

        return NextResponse.json({ questions });

    } catch (error: any) {
        console.error('[Questions API Error]:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate questions' },
            { status: 500 }
        );
    }
}
