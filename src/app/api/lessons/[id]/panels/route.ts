import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const lessonId = params.id
    if (!lessonId) {
        return NextResponse.json({ error: 'Missing lesson ID' }, { status: 400 })
    }

    try {
        const supabase = createClient()

        // Fetch lesson
        const { data: lesson, error: lessonError } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .single()

        if (lessonError || !lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
        }

        // Fetch panels
        const { data: panels, error: panelsError } = await supabase
            .from('comic_panels')
            .select('*')
            .eq('lesson_id', lessonId)
            .order('panel_order', { ascending: true })

        if (panelsError) {
            throw panelsError
        }

        return NextResponse.json({
            lesson,
            panels,
        })
    } catch (err) {
        console.error('Panel fetch error:', err)
        return NextResponse.json(
            { error: 'Failed to load panels', details: String(err) },
            { status: 500 }
        )
    }
}
