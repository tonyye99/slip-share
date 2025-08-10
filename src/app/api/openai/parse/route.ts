import { OpenAI } from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface OpenAIRequest {
  imageBase64: string
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = (await request.json()) as OpenAIRequest

    const parseBillSchema = {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              qty: { type: 'integer' },
              unit_price: { type: 'number' },
            },
            required: ['id', 'name', 'qty', 'unit_price'],
            additionalProperties: false,
          },
        },
        tax_percent: { type: 'number' },
        service_percent: { type: 'number' },
        total: { type: 'number' },
        subtotal: { type: 'number' },
        rounding: { type: 'number' },
      },
      required: [
        'items',
        'tax_percent',
        'service_percent',
        'total',
        'subtotal',
        'rounding',
      ],
      additionalProperties: false,
    }

    const result = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'You are a bill-parsing assistant. Extract line items and charges from this receipt image.',
            },
            {
              detail: 'auto',
              type: 'input_image',
              image_url: `data:image/jpeg;base64,${imageBase64}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'parse_bill',
          schema: parseBillSchema,
          strict: true,
        },
      },
    })

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Vision API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
