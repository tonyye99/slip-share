'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { Upload } from 'lucide-react'
import ParsedResults from '@/components/parsed-results'
import RecentReceipts from '@/components/recent-receipts'
import ImagePreview from '@/components/image-preview'
import ImageValidationDisplay from '@/components/image-validation-display'
import type { CreateReceiptRequest, ParsedReceiptData } from '@/types/api'
import { fileToBase64 } from '@/lib/utils/helpers'
import { createReceipt } from '@/lib/services/receipts'
import { parseReceipt } from '@/lib/services/openai'
import { UserType } from '@/types/common'
import {
  validateReceiptImage,
  type ValidationResult,
} from '@/lib/utils/image-validation'
import Header from '@/components/landing/header'
import LandingDropZone from '@/components/landing/drop-zone'

const TRANSLATION_PREFERENCE_KEY = 'slip-share-translation-preference'

const formSchema = z.object({
  receiptImage: z
    .instanceof(File)
    .refine((file) => file.type.startsWith('image/'), {
      message: 'Only image files are allowed',
    })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size must be less than 10MB',
    })
    .optional(),
  enableTranslation: z.boolean().default(false).optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function Home() {
  const [parsedData, setParsedData] = useState<ParsedReceiptData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableTranslation: false,
    },
  })

  const { watch, setValue, handleSubmit } = form
  const receiptImage = watch('receiptImage')

  useEffect(() => {
    const stored = localStorage.getItem(TRANSLATION_PREFERENCE_KEY)
    if (stored === 'true') {
      setValue('enableTranslation', true)
    }
  }, [setValue])

  const handleConfirm = async (userType: UserType) => {
    if (!parsedData) return

    setIsSaving(true)
    try {
      const isEnglishReceipt = parsedData.original_language === 'en'

      const payload: CreateReceiptRequest = {
        merchant_name: parsedData.merchant_name,
        merchant_name_en: isEnglishReceipt
          ? undefined
          : parsedData.merchant_name_en,
        original_language: parsedData.original_language,
        currency: parsedData.currency,
        tax_percent: parsedData.tax_percent,
        service_percent: parsedData.service_percent,
        rounding: parsedData.rounding,
        raw_json: JSON.stringify(parsedData),
        user_type: userType,
        items: parsedData.items.map((item) => ({
          name: item.name,
          name_en: isEnglishReceipt ? undefined : item.name_en,
          qty: item.qty,
          unit_price: item.unit_price,
        })),
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
    form.reset()
    setValidationResult(null)
  }

  const onSubmit = async (values: FormValues) => {
    if (!values.receiptImage || !validationResult?.isValid) {
      return
    }

    setIsProcessing(true)
    try {
      const base64 = await fileToBase64(values.receiptImage)
      const data = await parseReceipt(base64, values.enableTranslation)

      if (data.result) {
        const output = JSON.parse(data.result.output_text)

        if (output.is_receipt === false) {
          setValidationResult({
            isValid: false,
            errors: [
              'This image does not appear to be a receipt. Please upload a clear photo of a receipt or bill.',
            ],
          })
          return
        }

        setParsedData(output)
      }
    } catch (err) {
      console.error('Error converting or uploading file:', err)
      form.setError('receiptImage', {
        message: 'Failed to process the image. Please try again.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const processFile = useCallback(
    (selected: File | null) => {
      if (selected) {
        setValue('receiptImage', selected)
        const result = validateReceiptImage(selected)
        setValidationResult(result)
      } else {
        setValue('receiptImage', undefined)
        setValidationResult(null)
      }
      setParsedData(null)
    },
    [setValue]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    processFile(selected)
  }

  const handleRemoveFile = () => {
    setValue('receiptImage', undefined)
    setValidationResult(null)
    setParsedData(null)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const imageFile = files.find((file) => file.type.startsWith('image/'))

      if (imageFile) {
        processFile(imageFile)
      }
    },
    [processFile]
  )

  if (parsedData) {
    return (
      <div className="max-w-3xl mx-auto mt-10 px-4">
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
    <>
      <Header />

      <div className="space-y-8 sm:space-y-12">
        <div className="w-full">
          <RecentReceipts limit={5} />
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Your Receipt
              </h2>
              <p className="text-gray-600">
                Drag and drop or click to select your bill image
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="receiptImage"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        {!receiptImage ? (
                          <LandingDropZone
                            isDragOver={isDragOver}
                            handleDragOver={handleDragOver}
                            handleDragLeave={handleDragLeave}
                            handleDrop={handleDrop}
                            handleFileChange={handleFileChange}
                          />
                        ) : null}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Preview */}
                {receiptImage && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <ImagePreview
                      file={receiptImage}
                      onRemove={handleRemoveFile}
                    />
                  </div>
                )}

                {/* Validation Display */}
                {validationResult && (
                  <ImageValidationDisplay
                    result={validationResult}
                    fileName={receiptImage?.name}
                  />
                )}

                {/* Translation Option */}
                <FormField
                  control={form.control}
                  name="enableTranslation"
                  render={({ field }) => (
                    <FormItem className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked)
                              localStorage.setItem(
                                TRANSLATION_PREFERENCE_KEY,
                                checked.toString()
                              )
                            }}
                            className="mt-0.5"
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                            Enable translation to English
                          </FormLabel>
                          <FormDescription className="text-xs text-gray-600">
                            {field.value
                              ? 'Non-English receipts will be translated to English during processing.'
                              : 'Receipt text will be preserved in its original language only.'}
                          </FormDescription>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={
                    !receiptImage || !validationResult?.isValid || isProcessing
                  }
                  size="lg"
                  className="w-full h-12 text-lg font-medium"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>Parse Receipt</span>
                    </div>
                  )}
                </Button>

                {validationResult && !validationResult.isValid && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600 font-medium">
                      Please fix the image issues above before processing.
                    </p>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  )
}
