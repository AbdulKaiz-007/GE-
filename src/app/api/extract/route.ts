import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { createWorker } from 'tesseract.js'

// pdf-parse is marked as serverExternalPackages in next.config.js so it is
// never bundled. We import it lazily at call time to avoid module-init errors.
async function parsePdf(buffer: Buffer): Promise<string> {
    // eslint-disable-next-line
    const pdfPkg: any = await import('pdf-parse')
    const pdfFn = pdfPkg.default ?? pdfPkg
    const data = await pdfFn(buffer)
    return data.text
}


async function extractPptxText(buffer: Buffer) {
    const zip = await JSZip.loadAsync(buffer)
    const slideFiles = Object.keys(zip.files).filter(name =>
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
    )

    let fullText = ''
    for (const fileName of slideFiles) {
        const content = await zip.file(fileName)?.async('string')
        if (content) {
            const matches = content.match(/<a:t>([^<]+)<\/a:t>/g)
            if (matches) {
                fullText += matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ') + ' '
            }
        }
    }
    return fullText.trim()
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'NO_FILE_UPLOADED' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const contentType = file.type

        let extractedText = ''

        if (contentType === 'application/pdf') {
            extractedText = await parsePdf(buffer)
        } else if (contentType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
            contentType === 'application/vnd.ms-powerpoint' ||
            file.name.endsWith('.pptx')) {
            extractedText = await extractPptxText(buffer)
        } else if (contentType.startsWith('image/')) {
            const worker = await createWorker('eng')
            const { data: { text } } = await worker.recognize(buffer)
            await worker.terminate()
            extractedText = text
        } else if (contentType === 'text/plain') {
            extractedText = buffer.toString('utf8')
        } else {
            return NextResponse.json({ error: 'UNSUPPORTED_FILE_TYPE' }, { status: 400 })
        }

        // Clean up text (remove excessive whitespace)
        extractedText = extractedText.replace(/\s+/g, ' ').trim()

        return NextResponse.json({
            text: extractedText.slice(0, 5000), // Limit for AI seed
            fullLength: extractedText.length
        })

    } catch (error: any) {
        console.error('Extraction Error:', error)
        return NextResponse.json({ error: 'EXTRACTION_FAILURE', details: error.message }, { status: 500 })
    }
}
