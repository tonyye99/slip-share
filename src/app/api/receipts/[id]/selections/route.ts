import { ERROR_CODES, ERROR_MESSAGES } from '@/lib/constants/error-message'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { UserSelection, ReceiptWithItems } from '@/types/database'
import { z } from 'zod'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        {
          code: ERROR_CODES.UNAUTHORIZED,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        },
        { status: 401 }
      )
    }

    const receiptId = id

    const SelectionsSchema = z.object({
      selected_items: z.array(z.string()),
      item_shares: z.record(z.string(), z.number().int().min(1).max(99)),
    })

    const body = await request.json().catch(() => null)
    const parsed = SelectionsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          code: ERROR_CODES.INVALID_REQUEST_DATA,
          message: ERROR_MESSAGES.INVALID_REQUEST_DATA,
          details: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const { selected_items, item_shares } = parsed.data

    // Verify receipt exists and calculate totals
    const { data: receiptResponse, error: receiptError } = await supabase
      .from('receipts')
      .select(
        `
        *,
        receipts_items (*)
      `
      )
      .eq('id', receiptId)
      .single()

    if (receiptError || !receiptResponse) {
      return NextResponse.json(
        {
          code: ERROR_CODES.RECEIPT_NOT_FOUND,
          message: ERROR_MESSAGES.RECEIPT_NOT_FOUND,
        },
        { status: 404 }
      )
    }

    const receipt = receiptResponse as ReceiptWithItems

    // Calculate user's totals with sharing
    const selectedItemsData = receipt.receipts_items.filter((item) =>
      selected_items.includes(item.id)
    )

    const selectedSubtotal = selectedItemsData.reduce((sum: number, item) => {
      const itemTotal = item.qty * item.unit_price
      const shareCount = item_shares[item.id] || 1
      const userShare = itemTotal / shareCount
      return sum + userShare
    }, 0)

    const proportion =
      receipt.subtotal > 0 ? selectedSubtotal / receipt.subtotal : 0
    const taxAmount = (receipt.tax_percent / 100) * selectedSubtotal
    const serviceAmount = (receipt.service_percent / 100) * selectedSubtotal
    const roundingAmount = receipt.rounding * proportion
    const calculatedTotal =
      selectedSubtotal + taxAmount + serviceAmount + roundingAmount

    // Create user selection
    const { data: userSelection, error: insertError } = await supabase
      .from('user_selections')
      .insert({
        user_id: user.id,
        receipt_id: receiptId,
        selected_items,
        item_shares,
        calculated_total: calculatedTotal,
        tax_amount: taxAmount,
        service_amount: serviceAmount,
        rounding_amount: roundingAmount,
      })
      .select()
      .single()

    if (insertError || !userSelection) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        {
          code: ERROR_CODES.SELECTION_SAVE_FAILED,
          message: ERROR_MESSAGES.SELECTION_SAVE_FAILED,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(userSelection as UserSelection)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        {
          code: ERROR_CODES.UNAUTHORIZED,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        },
        { status: 401 }
      )
    }

    const receiptId = id

    const SelectionsSchema = z.object({
      selected_items: z.array(z.string()),
      item_shares: z.record(z.string(), z.number().int().min(1).max(99)),
    })

    const body = await request.json().catch(() => null)
    const parsed = SelectionsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          code: ERROR_CODES.INVALID_REQUEST_DATA,
          message: ERROR_MESSAGES.INVALID_REQUEST_DATA,
          details: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const { selected_items, item_shares } = parsed.data

    // Verify receipt exists and calculate totals
    const { data: receiptResponse, error: receiptError } = await supabase
      .from('receipts')
      .select(
        `
        *,
        receipts_items (*)
      `
      )
      .eq('id', receiptId)
      .single()

    if (receiptError || !receiptResponse) {
      return NextResponse.json(
        {
          code: ERROR_CODES.RECEIPT_NOT_FOUND,
          message: ERROR_MESSAGES.RECEIPT_NOT_FOUND,
        },
        { status: 404 }
      )
    }

    const receipt = receiptResponse as ReceiptWithItems

    // Calculate user's totals with sharing
    const selectedItemsData = receipt.receipts_items.filter((item) =>
      selected_items.includes(item.id)
    )

    const selectedSubtotal = selectedItemsData.reduce((sum: number, item) => {
      const itemTotal = item.qty * item.unit_price
      const shareCount = item_shares[item.id] || 1
      const userShare = itemTotal / shareCount
      return sum + userShare
    }, 0)

    const proportion =
      receipt.subtotal > 0 ? selectedSubtotal / receipt.subtotal : 0
    const taxAmount = (receipt.tax_percent / 100) * selectedSubtotal
    const serviceAmount = (receipt.service_percent / 100) * selectedSubtotal
    const roundingAmount = receipt.rounding * proportion
    const calculatedTotal =
      selectedSubtotal + taxAmount + serviceAmount + roundingAmount

    // Update user selection
    const { data: userSelection, error: updateError } = await supabase
      .from('user_selections')
      .update({
        selected_items,
        item_shares,
        calculated_total: calculatedTotal,
        tax_amount: taxAmount,
        service_amount: serviceAmount,
        rounding_amount: roundingAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('receipt_id', receiptId)
      .select()
      .single()

    if (updateError || !userSelection) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        {
          code: ERROR_CODES.SELECTION_UPDATE_FAILED,
          message: ERROR_MESSAGES.SELECTION_UPDATE_FAILED,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(userSelection as UserSelection)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      },
      { status: 500 }
    )
  }
}
