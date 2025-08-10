'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import ParsedResults from '@/components/parsed-results'
import type { CreateReceiptRequest, ParsedReceiptData } from '@/types/api'
import { fileToBase64 } from '@/lib/utils/helpers'
import { createReceipt } from '@/lib/services/receipts'
import { parseReceipt } from '@/lib/services/openai'
import { UserType } from '@/types/common'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedReceiptData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleConfirm = async (userType: UserType) => {
    if (!parsedData) return

    setIsSaving(true)
    try {
      const payload: CreateReceiptRequest = {
        currency: 'THB',
        tax_percent: parsedData.tax_percent,
        service_percent: parsedData.service_percent,
        rounding: parsedData.rounding,
        raw_json: JSON.stringify(parsedData),
        user_type: userType,
        items: parsedData.items,
      }

      const result = await createReceipt(payload)
      if (result) {
        router.push(`/receipts/${result.receipt_id}`)
      }
    } catch (err) {
      console.error('Error creating receipt:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setParsedData(null)
    setFile(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    setIsProcessing(true)
    try {
      const base64 = await fileToBase64(file)
      const data = await parseReceipt(base64)

      if (data.result) {
        const output = JSON.parse(data.result.output_text)
        setParsedData(output)
      }
    } catch (err) {
      console.error('Error converting or uploading file:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
  }

  if (parsedData) {
    return (
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <ParsedResults
          data={parsedData}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          loading={isSaving}
        />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Upload Your Bill</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-3">
          <Label htmlFor="bill">Bill Image</Label>
          <Input
            id="bill"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <Button type="submit" disabled={!file || isProcessing}>
          {isProcessing ? 'Processing...' : 'Upload & Parse'}
        </Button>
      </form>
    </div>
  )
}
