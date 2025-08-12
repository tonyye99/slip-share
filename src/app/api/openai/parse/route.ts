import { OpenAI } from 'openai'
import { NextRequest, NextResponse } from 'next/server'

function generatePromptText(enableTranslation: boolean): string {
  const basePrompt =
    'You are a bill-parsing assistant. First, determine if this image contains a valid receipt or bill. If it does: 1) Detect the original language of the receipt text and provide the ISO 639-1 language code (e.g., "th" for Thai, "en" for English). 2) Identify the currency used in the receipt by looking for currency symbols (฿, $, €, £, ¥, etc.) or text indicators, and provide the 3-letter ISO currency code (e.g., THB, USD, EUR, GBP, JPY). 3) Extract the merchant name, line items, and charges from the receipt in the original language.'

  if (enableTranslation) {
    return `${basePrompt} 4) Provide English translations for the merchant name and all item names. If the text is already in English, use the same value for both original and English fields. 5) For item names, provide clear, descriptive English translations that would help users understand what they ordered. If the image is not a receipt (e.g., random photo, document, screenshot), set is_receipt to false and provide empty/default values for other fields.`
  }

  return `${basePrompt} If the image is not a receipt (e.g., random photo, document, screenshot), set is_receipt to false and provide empty/default values for other fields.`
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface OpenAIRequest {
  imageBase64: string
  enableTranslation?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, enableTranslation = false } =
      (await request.json()) as OpenAIRequest

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let baseProperties: Record<string, any> = {
      is_receipt: {
        type: 'boolean',
        description:
          'Whether the image contains a valid receipt or bill. Set to false if the image is not a receipt (e.g., random photo, document, etc.)',
      },
      original_language: {
        type: 'string',
        description:
          'The detected language of the receipt text (ISO 639-1 code, e.g., "th", "en", "ja", "ko")',
      },
      currency: {
        type: 'string',
        description:
          'The currency used in the receipt (3-letter ISO code, e.g., "THB", "USD", "EUR", "GBP", "JPY"). Look for currency symbols (฿, $, €, £, ¥) or text indicators in the receipt.',
      },
      merchant_name: {
        type: 'string',
        description:
          'The name of the restaurant, business, or merchant from the receipt in original language',
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: {
              type: 'string',
              description: 'Item name in original language',
            },
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
    }

    const baseRequired = [
      'is_receipt',
      'original_language',
      'currency',
      'merchant_name',
      'items',
      'tax_percent',
      'service_percent',
      'total',
      'subtotal',
      'rounding',
    ]

    if (enableTranslation) {
      baseProperties = {
        ...baseProperties,
        merchant_name_en: {
          type: 'string',
          description:
            'English translation of the merchant name. If already in English, use the same value as merchant_name',
        },
      }
      baseRequired.push('merchant_name_en')

      baseProperties.items.items.properties = {
        ...baseProperties.items.items.properties,
        name_en: {
          type: 'string',
          description:
            'English translation of item name. If already in English, use the same value as name',
        },
      }
      baseProperties.items.items.required.push('name_en')
    }

    const parseBillSchema = {
      type: 'object',
      properties: baseProperties,
      required: baseRequired,
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
              text: generatePromptText(enableTranslation),
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
