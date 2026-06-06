import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'NO FILE DETECTED' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = '';
        const filename = file.name.toLowerCase();

        // Dynamically import to bypass Webpack ESM/CJS interop issues for external packages
        // eval('require') completely hides the import from Webpack's static analyzer
        const nativeRequire = eval('require');
        
        const { PDFParse } = nativeRequire('pdf-parse');
        
        const officeReq = nativeRequire('officeparser');
        const officeParser = officeReq.default || officeReq;

        if (filename.endsWith('.pdf')) {
            const pdf = new PDFParse({ data: new Uint8Array(buffer) });
            const data = await pdf.getText();
            text = data.text;
        } else if (filename.match(/\.(docx|pptx|xlsx|odt|odp|ods)$/)) {
            text = await (officeParser as any).parseOfficeAsync(buffer);
        } else if (filename.endsWith('.txt')) {
            text = buffer.toString('utf-8');
        } else {
            return NextResponse.json({ error: 'UNSUPPORTED DOCUMENT FORMAT. Please provide PDF, DOCX, PPTX, or TXT.' }, { status: 400 });
        }

        // Clean up excessive whitespace safely
        text = text.replace(/\s+/g, ' ').trim();

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error('Extraction Error:', error);
        return NextResponse.json({ error: `EXTRACTION FAILURE: ${error.message} \n ${error.stack}` }, { status: 500 });
    }
}
