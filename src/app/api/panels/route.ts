import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lesson_id')

    if (!lessonId) {
        return NextResponse.json({ error: 'lesson_id required' }, { status: 400 })
    }

    try {
        const supabase = createClient()

        const { data: panels, error } = await supabase
            .from('comic_panels')
            .select('panel_order, image_url, narration, dialogue, concept_tag')
            .eq('lesson_id', lessonId)
            .order('panel_order', { ascending: true })

        if (error) throw error

        return NextResponse.json({ panels: panels ?? [] })
    } catch (err) {
        console.error('Panels fetch error:', err)
        return NextResponse.json({ error: 'Failed to fetch panels' }, { status: 500 })
    }
}
