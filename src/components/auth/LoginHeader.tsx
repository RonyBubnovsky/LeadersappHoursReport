import { Clock } from 'lucide-react'

export function LoginHeader() {
  return (
    <div className="text-center space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600">
        <Clock className="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">דיווח שעות LeadersApp</h1>
        <p className="text-gray-500 mt-2">התחבר כדי לנהל את שעות העבודה שלך</p>
      </div>
    </div>
  )
}
