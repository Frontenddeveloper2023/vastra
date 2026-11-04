import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

/**
 * Reusable Admin & App Toast Notification Component
 * @param {string} message - Content message
 * @param {'success'|'error'|'info'} type - Toast type
 * @param {() => void} onClose - Close handler
 */
export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null

  

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
    }
  }

  return (
    <div className={`fixed top-6 right-6 z-50 bg-white border border-[#EDE4D8]  text-[#1F1713] px-4 py-3 shadow-xl flex items-center gap-2.5 rounded-none text-xs animate-in fade-in slide-in-from-top-2 duration-200 select-none`}>
      {getIcon()}
      <span className="font-semibold text-stone-800 pr-1">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-stone-400 hover:text-stone-700 ml-2 cursor-pointer p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
