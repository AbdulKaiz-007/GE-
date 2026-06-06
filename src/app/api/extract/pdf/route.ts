import { NextResponse } from 'next/server'
const pdfParse = require('pdf-parse')

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // To keep this 100% secure, we DO NOT save to disk.
        // We parse the ArrayBuffer completely in memory.
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        const data = await pdfParse(buffer)

        // Return extracted text. The buffer is garbage collected after.
        return NextResponse.json({ 
            text: data.text,
            pages: data.numpages,
            info: data.info
        })
    } catch (error: any) {
        console.error('PDF_PARSE_ERROR:', error)
        return NextResponse.json({ error: 'Failed to decrypt document matrix', details: error.message }, { status: 500 })
    }
}
