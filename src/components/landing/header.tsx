import { FileText } from 'lucide-react'

export default function Header() {
  return (
    <div className="text-center mb-8 sm:mb-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
        <FileText className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
        Split Bills Effortlessly
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Upload your receipt, share with friends, and calculate exact portions
        instantly
      </p>
    </div>
  )
}
