import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ERROR_CODES, ERROR_MESSAGES } from '@/lib/constants/error-message'
import type { CreateReceiptResponse } from '@/types/api'
import { z } from 'zod'

const Item = z.object({
  name: z.string().min(1),
  qty: z.number().int().positive(),
  unit_price: z.number().int().min(0),
})

const Payload = z.object({
  merchant_name: z.string().optional(),
  currency: z
    .string()
    .length(3)
    .transform((s) => s.toUpperCase())
    .default('THB'),
  tax_percent: z.number().min(0).max(100),
  service_percent: z.number().min(0).max(100),
  rounding: z.number().optional(),
  raw_json: z.unknown().optional(),
  parser_version: z.string().optional(),
  issued_at: z.string().optional(),
  storage_key: z.string().optional(),
  user_type: z.enum(['payer', 'sharer']).default('payer'),
  items: z.array(Item),
  total: z.number().optional(),
  subtotal: z.number().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = Payload.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: ERROR_CODES.RECEIPT_INVALID,
        message: ERROR_MESSAGES.RECEIPT_INVALID,
        details: parsed.error.issues,
      },
      { status: 400 }
    )
  }
  const p = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      {
        code: ERROR_CODES.UNAUTHORIZED,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      },
      { status: 401 }
    )
  }

  // Use provided totals or calculate from items
  const subtotal =
    p.subtotal ??
    p.items.reduce((sum, item) => sum + item.qty * item.unit_price, 0)
  const total =
    p.total ??
    subtotal +
      (subtotal * p.tax_percent) / 100 +
      (subtotal * p.service_percent) / 100 +
      (p.rounding ?? 0)

  const { data: receipt, error: rErr } = await supabase
    .from('receipts')
    .insert({
      user_id: user.id,
      merchant_name: p.merchant_name ?? null,
      currency: p.currency,
      tax_percent: p.tax_percent,
      service_percent: p.service_percent,
      rounding: p.rounding ?? 0,
      subtotal: subtotal,
      total: total,
      raw_json: p.raw_json ?? null,
      parser_version: p.parser_version ?? null,
      issued_at: p.issued_at ?? new Date(),
      storage_key: p.storage_key ?? null,
      user_type: p.user_type,
    })
    .select('id')
    .single()

  if (rErr || !receipt) {
    return NextResponse.json(
      {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      },
      { status: 500 }
    )
  }

  const rows = p.items.map((i, idx) => ({
    receipt_id: receipt.id,
    name: i.name,
    qty: i.qty,
    unit_price: i.unit_price,
    position: idx + 1,
  }))

  const { error: iErr } = await supabase.from('receipts_items').insert(rows)
  if (iErr) {
    await supabase.from('receipts').delete().eq('id', receipt.id)
    return NextResponse.json(
      {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      },
      { status: 500 }
    )
  }

  const response: CreateReceiptResponse = { receipt_id: receipt.id }
  return NextResponse.json(response, { status: 201 })
}
