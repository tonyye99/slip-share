import { ERROR_CODES, ERROR_MESSAGES } from '@/lib/constants/error-message'
import { createClient } from '@/lib/supabase/server'
import { ReceiptData, ReceiptWithItems } from '@/types/database'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const receiptId = params.id

    // Fetch receipt with items
    const { data: receiptResponse, error: receiptError } = await supabase
      .from('receipts')
      .select(
        `
        *,
        receipts_items (
          id,
          receipt_id,
          position,
          name,
          qty,
          unit_price,
          created_at,
          updated_at
        )
      `
      )
      .eq('id', receiptId)
      .single()

    if (receiptError) {
      console.error('Receipt fetch error:', receiptError)
      return NextResponse.json(
        {
          code: ERROR_CODES.RECEIPT_NOT_FOUND,
          message: ERROR_MESSAGES.RECEIPT_NOT_FOUND,
        },
        { status: 404 }
      )
    }
    const receipt = receiptResponse as ReceiptWithItems
    // Check if user has access (either created receipt or has made selections)
    const isCreator = receipt.user_id === user.id
    const isPayer = receipt.user_id === user.id && receipt.user_type === 'payer'

    if (!isCreator) {
      // Check if user has existing selections for this receipt
      const { data: userSelection } = await supabase
        .from('user_selections')
        .select('id')
        .eq('receipt_id', receiptId)
        .eq('user_id', user.id)
        .single()

      if (!userSelection) {
        return NextResponse.json(
          {
            code: ERROR_CODES.RECEIPT_ACCESS_DENIED,
            message: ERROR_MESSAGES.RECEIPT_ACCESS_DENIED,
          },
          { status: 403 }
        )
      }
    }

    // Fetch user's existing selections if any
    const { data: userSelection } = await supabase
      .from('user_selections')
      .select('*')
      .eq('receipt_id', receiptId)
      .eq('user_id', user.id)
      .single()

    // Sort items by position
    const sortedItems = receipt.receipts_items.sort(
      (a, b) => a.position - b.position
    )

    const response: ReceiptData = {
      receipt: {
        ...receipt,
        receipts_items: sortedItems,
      },
      userSelection,
      isCreator,
      isPayer,
    }

    return NextResponse.json(response)
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
