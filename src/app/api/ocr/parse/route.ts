import vision from '@google-cloud/documentai'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

const client = new vision.v1.DocumentProcessorServiceClient({
  keyFilename: path.join(process.cwd(), 'slipshare-3c33bb175e7b.json'),
})

interface OCRRequest {
  imageBase64: string
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = (await request.json()) as OCRRequest

    const [result] = await client.processDocument({
      name: 'projects/slipshare/locations/us/processors/d1349f1a878a3b5b',
      rawDocument: {
        content: imageBase64,
        mimeType: 'image/jpeg',
      },
    })
    console.log('result', result)
    const { document } = result

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Vision API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
