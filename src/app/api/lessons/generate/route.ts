import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

// ─── AI PIPELINE ─────────────────────────────────────────────────────────────
// 3-tier LLM chain: Groq (fast) → Groq fallback → Gemini 1.5-flash (free)
// Set either Groq_API_KEY or GEMINI_API_KEY (or both) in .env.local

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_API_KEY = process.env.Groq_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const GROQ_MODELS = ['llama-3.1-8b-instant', 'gemma2-9b-it']

// ─── Gemini Embeddings (for caching) ─────────────────────────────────────────
async function getEmbedding(text: string): Promise<number[] | null> {
    if (!GEMINI_API_KEY) return null;
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (err) {
        console.error("Embedding generation failed:", err);
        return null;
    }
}

// ─── Gemini fallback ─────────────────────────────────────────────────────────
async function callGemini(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error('No AI keys configured. Set Groq_API_KEY or GEMINI_API_KEY in .env.local')
    }
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    return result.response.text()
}

// ─── Primary callAI — Groq first, Gemini fallback ────────────────────────────
async function callAI(prompt: string, jsonMode: boolean = true): Promise<string> {
    // TEMPORARY: Disabled Groq to use Google AI Studio Free Tier
    if (false && GROQ_API_KEY) {
        let lastGroqError: Error | null = null
        for (const model of GROQ_MODELS) {
            try {
                const res = await fetch(GROQ_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model,
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.7,
                        max_tokens: 2500,
                    }),
                    signal: AbortSignal.timeout(60000),
                })

                if (!res.ok) {
                    const err = await res.text()
                    if (res.status === 429) {
                        console.warn(`Groq model ${model} rate-limited, trying next...`)
                        lastGroqError = new Error(`Groq 429 on ${model}: ${err}`)
                        continue
                    }
                    throw new Error(`Groq error (${res.status}): ${err}`)
                }

                const data = await res.json()
                return data.choices?.[0]?.message?.content ?? ''
            } catch (err) {
                const e = err as any;
                if (e instanceof Error && (e.message.includes('429') || e.message.includes('rate-limited'))) {
                    lastGroqError = e
                    continue
                }
                // Non-rate-limit Groq error — fall through to Gemini
                console.warn(`Groq model ${model} failed, falling back to Gemini:`, e instanceof Error ? e.message : e)
                break
            }
        }
        if (lastGroqError) {
            console.warn('All Groq models rate-limited, falling back to Gemini...')
        }
    } else {
        console.log('Groq_API_KEY not set — using Gemini 2.5-flash directly')
    }

    // Gemini fallback (or primary if no Groq key)
    return callGemini(prompt)
}

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Strip markdown fences that Groq/Gemini sometimes wraps JSON in
function extractJSON(raw: string): string {
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (fenceMatch) return fenceMatch[1].trim()
    const firstBrace = raw.indexOf('{')
    const lastBrace = raw.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1) return raw.slice(firstBrace, lastBrace + 1)
    return raw.trim()
}

// ─── Comic Style — Pollinations config (FREE, no key needed) ────
const STYLE_CONFIG: Record<string, { stylePrompt: string; model: string }> = {
    american: {
        stylePrompt: 'american comic book style, bold cel-shaded ink outlines, halftone dot shading, vibrant primary colors, dynamic action poses, Marvel Comics aesthetic, highly detailed, professional illustration',
        model: 'flux'
    },
    manga: {
        stylePrompt: 'japanese manga style, clean ink linework, expressive emotive faces, speed-line backgrounds, Shonen Jump aesthetic, black and white with spot color highlights, highly detailed',
        model: 'flux-anime'
    },
    webtoon: {
        stylePrompt: 'korean webtoon style, clean full-color digital art, soft rounded character designs, bright pastel palette, LINE Webtoon aesthetic, highly detailed',
        model: 'flux-anime'
    },
    franco: {
        stylePrompt: 'bande dessinee franco-belge ligne claire style, thin precise ink outlines, flat primary colors, Tintin-inspired aesthetic, clear unambiguous compositions, highly detailed',
        model: 'flux'
    },
    dc: {
        stylePrompt: 'DC Comics style, high-contrast dramatic shadows, gritty realism, heavy bold inking, Jim Lee-inspired aesthetic, cinematic lighting, highly detailed',
        model: 'flux-realism'
    },
}

const NANOBANANA_KEY = process.env.NANOBANANA_API_KEY
const NANOBANANA_GENERATE = 'https://api.nanobananaapi.ai/api/v1/nanobanana/generate'
const NANOBANANA_POLL = 'https://api.nanobananaapi.ai/api/v1/nanobanana/record-info'
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
const FAL_API_KEY = process.env.FAL_API_KEY

// Style-specific prompts that produce real comic art
const STYLE_SYSTEM_PROMPTS: Record<string, string> = {
    american: 'Professional American superhero comic book panel. Bold cel-shaded ink outlines, vibrant halftone dot shading, dynamic action composition, Marvel/DC aesthetic. Vivid primary colors. Highly detailed professional illustration.',
    manga: 'Japanese manga comic panel. Clean precise ink linework, expressive emotive faces, speed-line backgrounds, Shonen Jump aesthetic. Black-ink dominated with selective screen-tone shading.',
    webtoon: 'Korean webtoon vertical comic panel. Soft full-color digital illustration, rounded cute character designs, bright pastel palette, LINE Webtoon style.',
    franco: 'Franco-Belgian bande dessinee comic panel. Thin precise ink outlines, flat Hergé ligne claire style, Tintin-inspired clean composition, clear primary colors.',
    dc: 'DC Comics dark superhero panel. Heavy dramatic ink, high-contrast chiaroscuro shadows, Jim Lee cinematic style. Deep blacks, gritty urban backgrounds.',
}

const POLLINATIONS_MODELS: Record<string, string> = {
    american: 'flux', manga: 'flux-anime', webtoon: 'flux-anime', franco: 'flux', dc: 'flux-realism'
}

// ─── Fal AI Flux Image Generation ──────────────────────────
async function callFalFlux(prompt: string, seed: number): Promise<string> {
    if (!FAL_API_KEY) throw new Error('No FAL_API_KEY')

    console.log(`[Fal AI] Submitting to fal.run/fal-ai/flux/schnell...`)
    const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
        method: 'POST',
        headers: {
            'Authorization': `Key ${FAL_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: prompt.slice(0, 1000),
            image_size: { width: 512, height: 768 },
            num_images: 1,
            seed: seed,
            output_format: 'webp',
            num_inference_steps: 4
        }),
        signal: AbortSignal.timeout(60000),
    })

    if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Fal API error ${res.status}: ${errText.slice(0, 200)}`)
    }

    const data = await res.json()
    if (data.images && data.images.length > 0) {
        console.log(`[Fal AI] Completed → ${data.images[0].url}`)
        return data.images[0].url
    }
    throw new Error('No image returned from Fal AI')
}

// ─── Replicate Flux Image Generation ──────────────────────────
async function callReplicateFlux(prompt: string, seed: number): Promise<string> {
    if (!REPLICATE_API_TOKEN) throw new Error('No REPLICATE_API_TOKEN')

    // Use flux-schnell (fast, high-quality) via Replicate's predictions API
    const createRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
            'Prefer': 'wait',  // Synchronous mode — waits up to 60s for result
        },
        body: JSON.stringify({
            version: '5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637',
            input: {
                prompt: prompt.slice(0, 2000),
                num_outputs: 1,
                aspect_ratio: '9:16',
                output_format: 'webp',
                output_quality: 80,
                go_fast: true,
                seed: seed,
            },
        }),
        signal: AbortSignal.timeout(90000),
    })

    if (!createRes.ok) {
        const errText = await createRes.text()
        throw new Error(`Replicate API error ${createRes.status}: ${errText}`)
    }

    const prediction = await createRes.json()

    // If 'Prefer: wait' returned completed prediction
    if (prediction.status === 'succeeded' && prediction.output) {
        const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
        console.log(`[Replicate Flux] Completed → ${outputUrl}`)
        return outputUrl
    }

    // If not yet completed, poll
    const predictionId = prediction.id
    if (!predictionId) throw new Error('No prediction ID from Replicate')

    console.log(`[Replicate Flux] Prediction ${predictionId} — polling...`)
    const pollStart = Date.now()
    while (Date.now() - pollStart < 120_000) {
        await new Promise(r => setTimeout(r, 2000))
        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` },
            signal: AbortSignal.timeout(10000),
        })
        if (!pollRes.ok) continue
        const pollData = await pollRes.json()
        if (pollData.status === 'succeeded' && pollData.output) {
            const outputUrl = Array.isArray(pollData.output) ? pollData.output[0] : pollData.output
            console.log(`[Replicate Flux] Prediction ${predictionId} complete → ${outputUrl}`)
            return outputUrl
        }
        if (pollData.status === 'failed' || pollData.status === 'canceled') {
            throw new Error(`Replicate prediction ${predictionId} ${pollData.status}: ${pollData.error || ''}`)
        }
    }
    throw new Error(`Replicate prediction ${predictionId} timed out after 120s`)
}

// ─── NanoBanana Image Generation (Gemini-powered) ────────────
// Phase 1: POST /generate → returns taskId
// Phase 2: Poll GET /record-info?taskId until successFlag == 1 → return resultImageUrl
// Falls back to Replicate Flux → Pollinations if NanoBanana fails.
async function generatePanelImage(topic: string, prompt: string, style: string, seed: number): Promise<string> {
    const styleSystem = STYLE_SYSTEM_PROMPTS[style] || STYLE_SYSTEM_PROMPTS.american
    const fullPrompt = `Topic: ${topic}\n${styleSystem}\nScene: ${prompt}\nEducational content, safe for all ages, SFW. No logos, no watermarks.`

    if (!FAL_API_KEY) {
        throw new Error('FAL_API_KEY is not set')
    }

    try {
        return await callFalFlux(fullPrompt, seed)
    } catch (err) {
        console.warn('[Fal AI] Failed:', (err as Error).message)
        throw new Error(`Comic image generation failed: ${(err as Error).message}`)
    }
}


// ─── AGENT 0: Safety & Relevance Check ───────────────────────
async function isTopicSafeAndEducational(topic: string): Promise<boolean> {
    // If it's very long, scan the first 1000 chars for safety
    const scanText = topic.slice(0, 1000)
    const prompt = `You are a content moderator for an educational application.
Evaluate the following text for general safety and educational potential: "${scanText}..."

Rules:
1. This is likely raw study material (PDF/PPTX extraction). Be VERY PERMISSIVE with technical, academic, or professional terminology.
2. educational subject = Anything informative (science, engineering, medical, law, art, history, etc).
3. STRICTLY FORBIDDEN: Child abuse, graphic sexual violence, explicit pornography, or direct hate speech.
4. If the text looks like raw notes, it is likely educational.

Return a JSON object: {"safe": true, "reason": "why it is safe/unsafe"}
Return ONLY valid JSON.`

    try {
        const raw = await callAI(prompt, true)
        const parsed = JSON.parse(extractJSON(raw))
        return parsed.safe === true
    } catch (err) {
        console.warn('Safety check parsing failed or model rejected prompt:', err)
        // Highly permissive fallback for students: if it's over 100 chars, it's likely a note/doc.
        if (topic.length > 100) return true
        if (topic.length > 2 && !/sex|porn|gore|kill|hate/i.test(topic)) return true
        return false
    }
}

// ─── AGENT 0.5: Source Material Cleaner ───────────────────────
// When students upload PDFs/notes, the raw extracted text is messy:
// random line breaks, headers, footers, page numbers, duplicated text, etc.
// This agent distills it into clean, concise bullet points BEFORE
// it reaches the comic script engine.
async function cleanSourceMaterial(rawText: string): Promise<string> {
    if (rawText.length <= 300) return rawText // Short topics don't need cleaning

    const prompt = `You are an expert academic summarizer. A student uploaded their study notes/PDF.
The raw extracted text below is messy and contains formatting artifacts.

Your task: Distill this into a CLEAN, CONCISE summary of the key educational points.

RULES:
1. Output 8-15 bullet points, each ONE sentence (max 20 words per bullet).
2. Remove ALL formatting noise: page numbers, headers, footers, random symbols, repeated text.
3. Keep ONLY the core educational facts, definitions, and key relationships.
4. Use simple, clear language a student would understand.
5. Do NOT include the raw source text in your output.

RAW TEXT:
"""${rawText.slice(0, 4000)}"""

Return ONLY the clean bullet-point summary (no JSON, no markdown fences):
• Point 1
• Point 2
...`

    try {
        const cleaned = await callAI(prompt, false)
        console.log(`[Cleaner] Reduced ${rawText.length} chars → ${cleaned.length} chars`)
        return cleaned.slice(0, 2000)
    } catch (err) {
        console.warn('[Cleaner] Failed, using raw text:', (err as Error).message)
        return rawText.slice(0, 2000)
    }
}

// ─── Text Clamping Utility ────────────────────────────────────
// Hard-truncates any text that exceeds the character limit.
// Ensures comic panels never become walls of text.
function clampText(text: string, maxChars: number): string {
    if (!text || text.length <= maxChars) return text
    // Find the last complete sentence or clause within the limit
    const truncated = text.slice(0, maxChars)
    const lastPeriod = truncated.lastIndexOf('.')
    const lastExclaim = truncated.lastIndexOf('!')
    const lastQuestion = truncated.lastIndexOf('?')
    const bestBreak = Math.max(lastPeriod, lastExclaim, lastQuestion)
    if (bestBreak > maxChars * 0.5) return truncated.slice(0, bestBreak + 1)
    return truncated + '...'
}

// ─── AGENT 1: Concept Breakdown ──────────────────────────────
async function conceptAgent(topic: string, difficulty: string, panelCount: number = 8): Promise<string[]> {
    const isSourceMaterial = topic.length > 300
    // Dynamic concept count: 1 concept per 2 panels, min 4, max 16
    const conceptCount = Math.max(4, Math.min(16, Math.floor(panelCount / 2)))

    const prompt = `You are an educational expert.
${isSourceMaterial ? 'Analyze the following source material' : 'Break down the educational topic'} "${isSourceMaterial ? topic.slice(0, 3000) : topic}" (${difficulty} level) into exactly ${conceptCount} key concepts for a ${panelCount}-panel comic book lesson.

STRICT RULES:
1. No NSFW, violence, or inappropriate material in the concepts.
2. Focus on clear, informative, and engaging concepts.
3. Each concept must be a SHORT phrase (3-8 words max).
4. ${isSourceMaterial ? 'Distill the most important educational points from the source material.' : 'Ensure concepts are progressive and logical.'}

Return ONLY valid JSON: { "concepts": ["concept1", "concept2", ...] }`
    const raw = await callAI(prompt, true)
    try {
        const parsed = JSON.parse(extractJSON(raw))
        return parsed.concepts && parsed.concepts.length > 0 ? parsed.concepts : [topic.slice(0, 50), `Core principles`, `Practical extraction`, `Summary`]
    } catch (error) {
        console.error('Concept Agent Parse Error:', error)
        return [`Overview of the material`, `Key principles`, `Application`, `Conclusion`]
    }
}

// ─── AGENT 2+3: GAMMA ENGINE — Neuro-Adaptive Narrative Engine v2.0 ──────────
// The Gamma Engine treats the LLM as a compiler, not a chatbot.
// It enforces: anti-anime defaults, total thematic immersion, educational
// fidelity, and deterministic panel output.
async function scriptAgent(
    topic: string, concepts: string[], difficulty: string, style: string,
    panelCount: number = 8, visualTheme: string = ''
): Promise<Array<{
    panel_order: number; caption: string; speech: string; concept_tag: string; scene_desc: string
}>> {
    const isSourceMaterial = topic.length > 300
    const sourceMaterial = isSourceMaterial ? topic.slice(0, 3000) : topic

    // Art-style note embedded in image prompts, but NOT used for character archetypes
    const artStyleNote = style === 'manga' ? 'japanese manga ink linework style'
        : style === 'dc' ? 'DC Comics high-contrast cinematic style'
            : style === 'webtoon' ? 'Korean webtoon clean digital art style'
                : style === 'franco' ? 'Franco-Belgian ligne claire flat-color style'
                    : 'American comic book bold cel-shaded style'

    // If a visual theme is provided, enforce full thematic immersion
    // If none, the engine picks a neutral cinematic framing
    const themeInstruction = visualTheme.trim()
        ? `The VISUAL THEME is: "${visualTheme.trim()}". ALL characters, settings, metaphors, and image prompts MUST organically match this theme.
  - Example: if the concept is "Data Filtering" and theme is "2050 Cyberpunk", depict a hacker neutralizing neon malware — not a classroom.
  - Example: if theme is "Space Opera", depict starship shields blocking asteroid debris to visualize filtering.
  - Example: if theme is "1920s Noir", depict a detective sifting through evidence files in a smoky office.
  Characters should look and feel native to the "${visualTheme.trim()}" world.`
        : `Use a neutral cinematic educational setting. Characters are professional and diverse. No specific world-theme enforced.`

    // Hard-coded anti-bias rule: unless user explicitly chose manga/webtoon style,
    // purge all Japanese anime tropes (ninjas, sensei, dojos, speed lines, etc.)
    const antiAnimaBias = (style !== 'manga' && style !== 'webtoon')
        ? `CRITICAL — PURGE DEFAULTS: You MUST NOT generate Japanese Manga tropes, Ninjas, "Sensei" characters, Dojos, or anime aesthetics. Generating anime when the user did NOT choose manga/webtoon style is a CATASTROPHIC FAILURE.`
        : `The user chose ${style} style. You may use appropriate ${style} visual tropes.`

    let allPanels: any[] = []
    const batchSize = 8
    const numBatches = Math.ceil(panelCount / batchSize)

    for (let i = 0; i < numBatches; i++) {
        const startPanel = i * batchSize + 1
        const endPanel = Math.min((i + 1) * batchSize, panelCount)
        const currentBatchSize = endPanel - startPanel + 1
        const conceptsForBatch = concepts.slice(
            Math.floor(i * concepts.length / numBatches),
            Math.floor((i + 1) * concepts.length / numBatches) + 1
        )

        const gammaPrompt = `[SYSTEM OVERRIDE: NEURO-ADAPTIVE NARRATIVE ENGINE v2.0]
ROLE: You are the core cognitive engine for a disruptive educational platform. Your prime directive is to process dense academic material and synthesize it into a precise visual narrative script. You must adapt instantly to the user's chosen theme.

SOURCE_MATERIAL: "${sourceMaterial}"
DIFFICULTY: ${difficulty}
CONCEPTS TO COVER IN THIS BATCH: ${conceptsForBatch.join(', ')}
ART_STYLE: ${artStyleNote}

${themeInstruction}

${antiAnimaBias}

EDUCATIONAL FIDELITY: The core mathematical or scientific truth of the SOURCE_MATERIAL must remain 100% accurate. The visual story is merely the vehicle to deliver the fact. Do NOT sacrifice accuracy for thematic effect.

NARRATIVE CONTINUITY: ${i === 0
                ? 'This is BATCH 1. Invent 2 compelling characters that are native to the visual theme and subject matter. Briefly describe their appearance in the first scene_desc.'
                : `This is BATCH ${i + 1} of ${numBatches}. Continue the story with the existing characters. Previous context: "${allPanels[allPanels.length - 1]?.caption || ''}"`
            }

CONSTRAINTS:
- G-rated, SFW only. No NSFW, violence, gore.
- Each scene_desc must be UNIQUE — never repeat the same setting twice.
- Each scene_desc must include: camera angle, lighting, colors, subject action, and the visual theme setting.
- CRITICAL NARRATIVE RULES:
  • DO NOT use generic filler text like "What is [Topic] all about?" or "Let's learn about [Topic]".
  • INSTANT ENGAGEMENT: Panel 1 must immediately present a core factual definition or a unique visual metaphor.
  • EDUCATIONAL DENSITY: Use every bubble and caption to convey a piece of actual information or a specific step in the process.
  • ADAPTATION: The speech should sound like characters living in the "${visualTheme || 'chosen'}" world discussing the technical details of "${topic}".
- CRITICAL TEXT LENGTH RULES (MANDATORY — VIOLATION IS FAILURE):
  • "caption" MUST be under 80 characters. Keep it to ONE short, punchy sentence.
  • "speech" MUST be under 120 characters. Keep it to ONE or TWO short, impactful sentences.
  • If you write more than 120 characters for speech, it will look broken.

Generate exactly ${currentBatchSize} panels (panels ${startPanel} to ${endPanel}).

Return ONLY valid JSON, no markdown fences, no explanations:
{
  "panels": [
    {
      "panel_order": ${startPanel},
      "caption": "SHORT narration (under 80 chars)",
      "speech": "SHORT speech bubble (under 120 chars)",
      "concept_tag": "concept name (3-6 words)",
      "scene_desc": "Highly detailed comma-separated image generation prompt: camera angle, lighting, colors, character action, setting — all matching the visual theme and ${artStyleNote}"
    }
  ]
}`

        const raw = await callAI(gammaPrompt, true)
        try {
            const parsed = JSON.parse(extractJSON(raw))
            const batchPanels = parsed.panels || []
            allPanels = [...allPanels, ...batchPanels.slice(0, currentBatchSize)]
        } catch (err) {
            console.error(`Gamma Engine Batch ${i + 1} parse error:`, err)
            for (let j = startPanel; j <= endPanel; j++) {
                allPanels.push({
                    panel_order: j,
                    caption: `Understanding ${conceptsForBatch[0] || topic}...`,
                    speech: `"Let me show you how ${conceptsForBatch[0] || topic} works."`,
                    concept_tag: conceptsForBatch[0] || 'Core Concept',
                    scene_desc: `${visualTheme || 'cinematic educational'} setting, character explaining ${topic}, ${artStyleNote}, dramatic lighting, educational scene`
                })
            }
        }
    }

    return allPanels.slice(0, panelCount)
}

// ─── AGENT 4: Question Generator ─────────────────────────────
async function questionAgent(
    topic: string, concepts: string[]
): Promise<Array<{
    question_text: string;
    options: Array<{ label: string; text: string; is_correct: boolean }>;
    correct_option: string;
    explanation: string;
    concept_tag: string;
    difficulty_tier: string;
}>> {
    const prompt = `Generate 9 multiple choice questions about "${topic}".
Concepts: ${concepts.join(', ')}
- 3 questions: difficulty_tier "minion" (easy)
- 3 questions: difficulty_tier "elite" (medium)
- 3 questions: difficulty_tier "boss" (hard)

Return ONLY valid JSON:
{
  "questions": [
    {
      "question_text": "Question text?",
      "options": [
        {"label": "A", "text": "Option A", "is_correct": false},
        {"label": "B", "text": "Option B", "is_correct": true},
        {"label": "C", "text": "Option C", "is_correct": false},
        {"label": "D", "text": "Option D", "is_correct": false}
      ],
      "correct_option": "B",
      "explanation": "Brief explanation why B is correct",
      "concept_tag": "related concept",
      "difficulty_tier": "minion"
    }
  ]
}
IMPORTANT: Ensure "is_correct" is strictly a boolean value (true or false). Do not use null or omit the colon.`
    const raw = await callAI(prompt, true)
    try {
        const parsed = JSON.parse(extractJSON(raw))
        return parsed.questions || []
    } catch {
        throw new Error('Question generation failed to parse JSON')
    }
}

// ─── DEMO FALLBACK ────────────────────────────────────────────
async function createDemoLesson(
    topic: string, difficulty: string, subject_tag: string | undefined,
    style: string, cacheKey: string, userId: string | null
) {
    const supabase = createClient()

    const { data: lesson, error: lessonErr } = await supabase
        .from('lessons')
        .insert({
            topic,
            cache_key: cacheKey,
            difficulty,
            subject_tag: subject_tag || null,
            panel_count: 6,
            style,
            user_id: userId,
        })
        .select('id')
        .single()

    if (lessonErr || !lesson || !lesson.id) throw new Error('Failed to create demo lesson: ' + lessonErr?.message)

    const demoPanels = [
        { panel_order: 1, caption: `The world of ${topic}...`, speech: `"So, what exactly is ${topic}?"`, concept_tag: 'Introduction', scene_desc: `An eager curious student asking a knowledgeable professor about ${topic}, classroom background, educational setting` },
        { panel_order: 2, caption: `The core principles explained.`, speech: `"${topic} is built on some key ideas. Let me show you."`, concept_tag: 'Core Concept', scene_desc: `A wise teacher with a glowing holographic diagram explaining the fundamentals of ${topic}` },
        { panel_order: 3, caption: `A closer look at the details.`, speech: `"Look — when this happens, it changes everything about ${topic}!"`, concept_tag: 'Key Mechanic', scene_desc: `A detailed diagram or scene illustrating the key mechanism of ${topic}, educational, scientific style` },
        { panel_order: 4, caption: `Putting it into practice.`, speech: `"Now I understand how to apply ${topic} in real life!"`, concept_tag: 'Application', scene_desc: `A student experimenting and applying ${topic} in a real-world scenario, hands-on, energetic scene` },
        { panel_order: 5, caption: `Overcoming the challenge.`, speech: `"This is the tricky part of ${topic} — but we can handle it!"`, concept_tag: 'Challenge', scene_desc: `Characters working together to solve a complex problem related to ${topic}, teamwork, exciting scene` },
        { panel_order: 6, caption: `Knowledge unlocked!`, speech: `"We've mastered ${topic}! The adventure continues..."`, concept_tag: 'Summary', scene_desc: `A triumphant student and teacher celebrating their understanding of ${topic}, wide smile, bright setting` },
    ]

    // Generate images in parallel for the demo panels
    const demoPanelRows = await Promise.all(
        demoPanels.map(async p => ({
            lesson_id: lesson!.id,
            panel_order: p.panel_order,
            image_url: await generatePanelImage(topic, p.scene_desc, style, p.panel_order * 42),
            image_prompt: p.scene_desc,
            scene_desc: p.scene_desc,
            dialogue: p.speech,
            narration: p.caption,
            concept_tag: p.concept_tag,
        }))
    )

    await supabase.from('comic_panels').insert(demoPanelRows)

    const demoQuestions = [
        {
            question_text: `What is the main focus of ${topic}?`,
            options: [
                { label: 'A', text: `Understanding the core principles of ${topic}`, is_correct: true },
                { label: 'B', text: 'Memorizing random facts', is_correct: false },
                { label: 'C', text: 'Ignoring the details', is_correct: false },
                { label: 'D', text: 'None of the above', is_correct: false },
            ],
            correct_option: 'A', explanation: `${topic} is primarily about understanding its core principles.`,
            concept_tag: 'Introduction', difficulty_tier: 'minion',
        },
        {
            question_text: `How can ${topic} be applied in practice?`,
            options: [
                { label: 'A', text: 'Only in theoretical scenarios', is_correct: false },
                { label: 'B', text: 'In real-world situations and problem solving', is_correct: true },
                { label: 'C', text: 'It has no practical applications', is_correct: false },
                { label: 'D', text: 'Only in academic settings', is_correct: false },
            ],
            correct_option: 'B', explanation: `${topic} has many real-world practical applications.`,
            concept_tag: 'Application', difficulty_tier: 'elite',
        },
        {
            question_text: `What makes ${topic} challenging to master?`,
            options: [
                { label: 'A', text: 'It requires no effort', is_correct: false },
                { label: 'B', text: 'It is too simple', is_correct: false },
                { label: 'C', text: 'It requires deep understanding and practice', is_correct: true },
                { label: 'D', text: 'It is not challenging at all', is_correct: false },
            ],
            correct_option: 'C', explanation: `Mastering ${topic} requires sustained effort and deep understanding.`,
            concept_tag: 'Challenge', difficulty_tier: 'boss',
        },
    ]

    // Save demo questions to Supabase
    const supabaseQuestions = demoQuestions.map(q => ({
        lesson_id: lesson!.id,
        question_text: q.question_text,
        options: q.options,
        correct_option: q.correct_option,
        explanation: q.explanation,
        concept_tag: q.concept_tag,
        difficulty_tier: q.difficulty_tier
    }))

    await supabase.from('questions').insert(supabaseQuestions)

    return NextResponse.json({ lesson_id: lesson!.id, topic, cached: false, demo: true, panels: demoPanelRows })
}

// ─── MAIN ROUTE ───────────────────────────────────────────────
export async function POST(request: NextRequest) {
    let topic = 'Unknown Topic'
    try {
        const body = await request.json()
        const { topic: bodyTopic, difficulty = 'beginner', subject_tag, style = 'american', panelCount = 8, visualTheme = '' } = body
        topic = bodyTopic

        if (!topic || typeof topic !== 'string' || topic.length < 2) {
            return NextResponse.json({ error: 'Invalid topic' }, { status: 400 })
        }

        // ── Safety check (uses Groq, not Supabase — always works) ──
        const isSafe = await isTopicSafeAndEducational(topic)
        if (!isSafe) {
            return NextResponse.json(
                { error: 'Topic must be strictly educational and safe for work. Inappropriate or non-educational topics are not allowed by the AI.' },
                { status: 400 }
            )
        }

        // ── Try to get a DB client (Supabase may be down — that's OK) ──
        // ── Try to identify the user via Supabase Session ──
        let userId: string | null = null
        let dbReady = false
        const supabase = createClient()
        dbReady = true

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                userId = user.id
                console.log('[Supabase] Authenticated user:', user.email)
            }
        } catch (authErr) {
            console.warn('[Supabase] Auth check failed — guest mode:', authErr instanceof Error ? authErr.message : String(authErr))
        }

        // ── Try cache lookup via Supabase ──
        const cacheKey = createHash('sha256').update(`${topic.toLowerCase()}${difficulty}${style}${panelCount}`).digest('hex')
        let embedding: number[] | null = null;
        
        if (dbReady) {
            embedding = await getEmbedding(topic);

            try {
                // Feature: Vector Semantic Cache Search
                if (embedding) {
                    const { data: matches } = await supabase.rpc('match_lessons_exact', {
                        query_embedding: `[${embedding.join(',')}]`,
                        match_threshold: 0.88,
                        match_count: 1,
                        p_difficulty: difficulty,
                        p_style: style,
                        p_panel_count: panelCount
                    });

                    if (matches && matches.length > 0) {
                        const cached = matches[0];
                        console.log(`[Cache Hit] Vector match found: ${cached.topic} (similarity: ${cached.similarity})`)
                        
                        if (userId) {
                            const { error: libErr } = await supabase.from('user_library').upsert(
                                { user_id: userId, lesson_id: cached.id },
                                { onConflict: 'user_id,lesson_id' }
                            );
                            if (libErr) console.warn('Library upsert error (vector hit):', libErr);
                        }
                        return NextResponse.json({ lesson_id: cached.id, topic: cached.topic, cached: true })
                    }
                }

                // Fallback: Exact String Cache Search
                const { data: cached } = await supabase
                    .from('lessons')
                    .select('id, topic')
                    .eq('cache_key', cacheKey)
                    .single()

                if (cached) {
                    if (userId) {
                        const { error: libErr } = await supabase.from('user_library').upsert(
                            { user_id: userId, lesson_id: cached.id },
                            { onConflict: 'user_id,lesson_id' }
                        );
                        if (libErr) console.warn('Library upsert error (exact hit):', libErr);
                    }
                    return NextResponse.json({ lesson_id: cached.id, topic: cached.topic, cached: true })
                }
            } catch (cacheErr) {
                console.warn('Cache lookup failed (continuing):', cacheErr instanceof Error ? cacheErr.message : String(cacheErr))
            }
        }

        // ── Clean source material if it's a PDF/notes upload ──
        let cleanedTopic = topic
        if (topic.length > 300) {
            console.log(`[Pipeline] Detected uploaded notes (${topic.length} chars). Running source cleaner...`)
            cleanedTopic = await cleanSourceMaterial(topic)
        }

        // ── Run Groq AI pipeline (this always runs, DB-independent) ──
        let concepts: string[], panels: Array<{ panel_order: number; caption: string; speech: string; concept_tag: string; scene_desc: string }>, questions: Awaited<ReturnType<typeof questionAgent>>
        try {
            concepts = await conceptAgent(cleanedTopic, difficulty, panelCount)
            const [p, q] = await Promise.all([
                scriptAgent(cleanedTopic, concepts, difficulty, style, panelCount, visualTheme),
                questionAgent(cleanedTopic, concepts)
            ])
            panels = p
            questions = q
        } catch (aiErr) {
            console.error('Groq AI pipeline failed:', aiErr)
            return staticFallback(topic, aiErr instanceof Error ? aiErr.message : String(aiErr))
        }

        // ── Generate panel images via NanoBanana (parallel) ──
        // Post-process: clamp all text fields to enforce comic-friendly lengths
        const panelInserts = await Promise.all(panels.map(async (panel, i) => {
            let imageUrl = '';
            try {
                imageUrl = await generatePanelImage(
                    topic,
                    panel.scene_desc,
                    style,
                    i * 7 + (Date.now() % 9999)
                );
            } catch (err) {
                console.warn(`[Image Fallback] Panel ${panel.panel_order} failed:`, err instanceof Error ? err.message : String(err));
                const shortPrompt = encodeURIComponent(`${panel.scene_desc.slice(0, 200)}, comic panel, educational`);
                const model = (typeof POLLINATIONS_MODELS !== 'undefined' && POLLINATIONS_MODELS[style]) ? POLLINATIONS_MODELS[style] : 'flux';
                imageUrl = `https://image.pollinations.ai/prompt/${shortPrompt}?model=${model}&width=512&height=768&nologo=true&seed=${i * 7 + (Date.now() % 9999)}`;
            }

            return {
                panel_order: panel.panel_order,
                dialogue: clampText(panel.speech || '', 120),
                narration: clampText(panel.caption || '', 80),
                concept_tag: clampText(panel.concept_tag || '', 40),
                scene_desc: panel.scene_desc || '',
                image_prompt: panel.scene_desc,
                image_url: imageUrl,
            };
        }))



        // ── Try to persist to Supabase (optional — skip on failure) ──
        let savedLessonId: string | null = null
        if (dbReady) {
            try {
                // Check for existing cached lesson
                const { data: existing } = await supabase
                    .from('lessons')
                    .select('id')
                    .eq('cache_key', cacheKey)
                    .single()

                let lessonId: string
                if (existing?.id) {
                    lessonId = existing.id
                } else {
                    const { data: newLesson, error: insertErr } = await supabase
                        .from('lessons')
                        .insert({
                            topic,
                            cache_key: cacheKey,
                            difficulty,
                            subject_tag: subject_tag || null,
                            panel_count: panels.length,
                            style,
                            concepts,
                            user_id: userId,
                            embedding: embedding ? `[${embedding.join(',')}]` : null
                        })
                        .select('id')
                        .single()

                    if (insertErr || !newLesson) throw new Error('Lesson insert failed: ' + insertErr?.message)
                    lessonId = newLesson.id
                }
                savedLessonId = lessonId

                // Save panels 
                const panelsToInsert = panelInserts.map(p => ({ ...p, lesson_id: lessonId }))
                await supabase.from('comic_panels').insert(panelsToInsert)

                // Save questions
                if (questions.length > 0) {
                    const questionsToInsert = questions.map(q => ({ ...q, lesson_id: lessonId }))
                    await supabase.from('questions').insert(questionsToInsert)
                }

                // Add to user library
                if (userId && savedLessonId) {
                    const { error: libErr } = await supabase.from('user_library').upsert(
                        { user_id: userId, lesson_id: savedLessonId },
                        { onConflict: 'user_id,lesson_id' }
                    );
                    if (libErr) console.warn('Library upsert failed:', libErr);
                }

                // Increment user comic count - Supabase doesn't have FieldValue.increment easily from REST,
                // so we can call a Postgres RPC function if created, or skip it for now.
                // Skipped RPC implementation to ensure fast migration.

            } catch (saveErr) {
                console.warn('Supabase save failed (comic still returned to user):', saveErr instanceof Error ? saveErr.message : String(saveErr))
            }
        }

        // ── Always return the AI-generated panels to the client ──
        return NextResponse.json({
            lesson_id: savedLessonId,
            topic,
            cached: false,
            panels: panelInserts,
        })

    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : (typeof err === 'object' && err !== null ? JSON.stringify(err, Object.getOwnPropertyNames(err)) : String(err))
        console.error('Lesson generation outer catch:', err)

        try {
            return staticFallback(topic ?? 'Unknown Topic', msg)
        } catch (fallbackErr) {
            console.error('Even staticFallback crashed:', fallbackErr)
            return NextResponse.json({
                error: 'Internal Server Error during comic generation',
                details: msg,
                fallbackError: String(fallbackErr)
            }, { status: 500 })
        }
    }
}

// ─── STATIC IN-MEMORY FALLBACK (no Supabase or Groq needed) ──
function staticFallback(topic: string, errorMsg?: string): NextResponse {
    const t = encodeURIComponent(topic || 'educational topic')
    console.warn('Serving static fallback for topic:', topic, 'Error:', errorMsg)
    return NextResponse.json({
        lesson_id: null,
        topic,
        cached: false,
        demo: true,
        offline: true,
        panels: [
            { panel_order: 1, narration: `Observation: ${topic} detected in the local sector.`, dialogue: `"Scanning ${topic} parameters... Defining core vectors now."`, concept_tag: 'Initialization', image_url: `https://image.pollinations.ai/prompt/${t}%20cinematic%20tech%20scanning%20concept?width=512&height=768&nologo=true` },
            { panel_order: 2, narration: `Extraction: Key principles identifying ${topic} structure.`, dialogue: `"The fundamental architecture of ${topic} is becoming clear."`, concept_tag: 'Core Logic', image_url: `https://image.pollinations.ai/prompt/${t}%20schematic%20blueprint%20digital?width=512&height=768&nologo=true` },
            { panel_order: 3, narration: `Analysis: Internal mechanisms of ${topic} processed.`, dialogue: `"Notice how these components synchronize to stabilize ${topic}."`, concept_tag: 'Structural Analysis', image_url: `https://image.pollinations.ai/prompt/${t}%20complex%20mechanism%20internal%20view?width=512&height=768&nologo=true` },
            { panel_order: 4, narration: `Integration: ${topic} applied to operational scenarios.`, dialogue: `"Applying ${topic} logic to real-world neural grids."`, concept_tag: 'Implementation', image_url: `https://image.pollinations.ai/prompt/${t}%20world%20connection%20energy%20network?width=512&height=768&nologo=true` },
            { panel_order: 5, narration: `Resolution: Optimizing ${topic} for complex resolution.`, dialogue: `"Tactical challenge neutralized. ${topic} mastery complete."`, concept_tag: 'Conflict Resolution', image_url: `https://image.pollinations.ai/prompt/${t}%20glowing%20core%20energy%20success?width=512&height=768&nologo=true` },
            { panel_order: 6, narration: `Finality: ${topic} data strictly synchronized.`, dialogue: `"Mission success. The ${topic} module is now fully operational."`, concept_tag: 'Data Sync', image_url: `https://image.pollinations.ai/prompt/${t}%20futuristic%20knowledge%20success%20portrait?width=512&height=768&nologo=true` },
        ],
        questions: [],
        error: errorMsg || 'AI generator offline — serving adaptive legacy module',
    })
}
