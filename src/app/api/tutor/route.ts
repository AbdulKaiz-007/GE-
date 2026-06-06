import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBH7ZSuzJ0xM2YLQK2scOjDN6zCI6_jkN4";
const genAI = new GoogleGenerativeAI(apiKey);

const PERSONA_MAP: Record<string, { identity: string, promptStyle: string }> = {
    'arc': { identity: 'an expert holographic tutor in a futuristic learning facility (ARC Studios)', promptStyle: 'a futuristic holographic female tutor, glowing blue elements, dark sci-fi background' },
    'stark': { identity: 'Tony Stark (Iron Man). You are brilliant, slightly arrogant, sarcastic but supportive, using high-tech MCU terminology.', promptStyle: 'Tony Stark in high-tech laboratory, holographic displays, Marvel Cinematic Universe photography style' },
    'batman': { identity: 'Batman (Bruce Wayne). You are absolute brooding, highly analytical, extremely serious and prepared. Use detective terminology.', promptStyle: 'Batman standing in the dark batcave looking at the batcomputer, grim lighting, DC comics cinematic style' },
    'gojo': { identity: 'Gojo Satoru from Jujutsu Kaisen. You are overly confident, playful, acting like the strongest teacher, casually dropping JJK terminology.', promptStyle: 'Gojo Satoru smiling confidently, infinity domain expansion background, high quality anime art style' },
    'yoda': { identity: 'Master Yoda from Star Wars. You speak in inverted object-subject-verb syntax. You are wise, cryptic, and patient.', promptStyle: 'Master yoda glowing as a blue force ghost, ancient jedi temple background cinematic' }
};

export async function POST(req: Request) {
    try {
        const { context, history, currentInput, personaId } = await req.json();

        if (!context) {
            return NextResponse.json({ error: 'Missing knowledge context' }, { status: 400 });
        }

        const activePersona = PERSONA_MAP[personaId] || PERSONA_MAP['arc'];

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: `You are ${activePersona.identity}. 
            You are teaching the user based strictly on the provided DOCUMENT_CONTEXT.
            
            Format your response as a JSON object with the following structure:
            {
              "dialogue": "What you say next. Keep it concise, engaging, and deeply in character. Limit to 3-4 sentences.",
              "emotion": "Choose one: confident | curious | serious | happy | analytical",
              "choices": ["2 or 3 brief options for the user to reply with to drive the conversation forward"],
              "avatarPrompt": "A highly detailed prompt for an image generator to show your current state based on this aesthetic: '${activePersona.promptStyle}'"
            }
            
            Rules:
            1. Validate their knowledge, then push them forward.
            2. Never break character. Adopt your persona fully in dialogue.
            3. Do not just summarize the document; ask them questions to verify they understand.
            `
        });

        const prompt = `DOCUMENT_CONTEXT:\n${context.substring(0, 8000)}\n\nCHAT_HISTORY:\n${JSON.stringify(history)}\n\nUSER_SAYS:\n${currentInput}`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.8,
            }
        });

        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('TUTOR_API_ERROR:', error);
        return NextResponse.json({ error: 'Failed to generate tutor response.' }, { status: 500 });
    }
}
