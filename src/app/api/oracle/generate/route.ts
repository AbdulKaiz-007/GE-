import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { context, markers, mode = 'exam' } = await req.json();

        if (!context) {
            return NextResponse.json({ error: 'MISSING CORE DATA PROTOCOLS' }, { status: 400 });
        }

        let prompt = '';

        if (mode === 'flashcards') {
            prompt = `You are the EXAM ORACLE, an elite academic AI tasked with generating precise examination flashcards.

CONTEXT PAYLOAD (Syllabus/Notes):
"""
${context.substring(0, 10000)}
"""

INSTRUCTIONS:
1. Generate 10 high-yield review flashcards based strictly on the provided CONTEXT PAYLOAD.
2. DO NOT wrap the response in markdown blocks like \`\`\`json. Return pure JSON.
3. Provide the output strictly in this JSON format:
{
  "flashcards": [
    { "front": "Concept or Question", "back": "Definition or Answer" }
  ]
}`;
        } else if (mode === 'summary') {
            prompt = `You are the EXAM ORACLE, an elite academic AI tasked with summarizing complex notes.

CONTEXT PAYLOAD (Syllabus/Notes):
"""
${context.substring(0, 10000)}
"""

INSTRUCTIONS:
1. Generate a comprehensive summary strictly based on the provided CONTEXT PAYLOAD.
2. DO NOT wrap the response in markdown blocks like \`\`\`json. Return pure JSON.
3. Provide the output strictly in this JSON format:
{
  "title": "Main Topic Title",
  "bulletPoints": ["Key point 1", "Key point 2", ...],
  "keyTerms": ["Term 1", "Term 2", ...]
}`;
        } else {
            // mode === 'exam'
            if (!markers || !Array.isArray(markers)) {
                return NextResponse.json({ error: 'MISSING MARKER PROTOCOLS' }, { status: 400 });
            }

            const rules = markers.map(m => {
                if (m <= 3) return `For ${m} markers: Generate concise, objective or definition-based questions. Exactly 3 questions.`;
                if (m <= 6) return `For ${m} markers: Generate explanatory, mechanism, or comparative questions. Exactly 2 questions.`;
                return `For ${m} markers: Generate long-form, essay-style, or comprehensive analytical questions. Exactly 1 question.`;
            }).join('\n');

            prompt = `You are the EXAM ORACLE, an elite academic AI tasked with generating precise examination papers.

CONTEXT PAYLOAD (Syllabus/Notes):
"""
${context.substring(0, 10000)} // Truncating to avoid massive overload
"""

REQUIRED MARKERS: ${markers.join(', ')}

INSTRUCTIONS:
1. Generate high-quality examination questions strictly based on the provided CONTEXT PAYLOAD. Do not invent facts outside the context.
2. Adhere exactly to the required marker weights requested.
3. Use the following generation rules:
${rules}
4. DO NOT wrap the response in markdown blocks like \`\`\`json. Return pure JSON.
5. Provide the output strictly in this JSON format:
{
  "1_markers": ["Q1 string", "Q2 string", ...], 
  "5_markers": ["Q1 string", ...]
}`;
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'system', content: prompt }],
                temperature: 0.3,
                max_tokens: 3000,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            console.error('Groq API Error:', await response.text());
            throw new Error('Groq generation failed');
        }

        const data = await response.json();
        const rawContent = data.choices[0]?.message?.content || '{}';
        const parsedResponse = JSON.parse(rawContent);

        return NextResponse.json(parsedResponse);

    } catch (error) {
        console.error('Oracle Generation Error:', error);
        return NextResponse.json({ error: 'ORACLE CORE OVERLOADED' }, { status: 500 });
    }
}
