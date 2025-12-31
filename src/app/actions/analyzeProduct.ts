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

        const chatCompletion = await groq.chat.completions.create({
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this beverage product image. identify the product name and estimate the sugar content per serving (or per container if it looks like a single-serve bottle/can). If you cannot see nutritional info, estimate based on the product type (e.g. Cola ~39g). Return strictly valid JSON: { \"productName\": \"string\", \"sugarContent\": number, \"healthVerdict\": \"Healthy\" | \"Moderate\" | \"Unhealthy\", \"notes\": \"string\" }."
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
            "model": "meta-llama/llama-4-maverick-17b-128e-instruct",
            "temperature": 0.1,
            "max_tokens": 1024,
            "top_p": 1,
            "stream": false,
            "stop": null,
            "response_format": { type: "json_object" }
        });

        const content = chatCompletion.choices[0].message.content;
        if (!content) throw new Error('No content from Groq');

        const result = JSON.parse(content) as AnalysisResult;
        return result;

    } catch (error) {
        console.error("Groq Analysis Failed:", error);
        // Fallback/Mock for demo if it fails or API key is invalid (optional, but good for robustness)
        throw new Error('Failed to analyze product. Please try again.');
    }
}
