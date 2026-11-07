import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { AlertTriangle, AlertCircle, LogOut, Trash2, CheckCircle2 } from 'lucide-react'

const ConfirmModalContext = createContext(null)

/**
 * Universal Confirmation Modal Provider
 * Allows any component in the app to ask for user confirmation asynchronously:
 *
 * const confirm = useConfirm()
 * const ok = await confirm({
 *   title: 'Confirm Logout',
 *   message: 'Are you sure you want to log out?',
 *   confirmText: 'Logout',
 *   type: 'danger' // 'danger' | 'warning' | 'info'
 * })
 * if (ok) { ... }
 */
export function ConfirmModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: 'Confirm Action',
    message: 'Are you sure you want to continue?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger', // danger | warning | info
    onConfirm: null,
    onCancel: null,
  })

  const resolverRef = useRef(null)

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setModalState({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure you want to proceed?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'danger',
      })
    })
  }, [])

  const handleConfirm = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }))
    if (resolverRef.current) {
      resolverRef.current(true)
      resolverRef.current = null
    }
  }

  const handleCancel = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }))
    if (resolverRef.current) {
      resolverRef.current(false)
      resolverRef.current = null
    }
  }

  // Pick suitable theme icon & color
  const getIcon = () => {
    switch (modalState.type) {
      case 'logout':
        return <LogOut className="w-5 h-5 text-red-700" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-700" />
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-700" />
      case 'danger':
      default:
        return <Trash2 className="w-5 h-5 text-[#6D021B]" />
    }
  }

  const getIconBg = () => {
    switch (modalState.type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200'
      case 'success':
        return 'bg-emerald-50 border-emerald-200'
      case 'logout':
      case 'danger':
      default:
        return 'bg-red-50 border-red-200'
    }
  }

  return (
    <ConfirmModalContext.Provider value={confirm}>
      {children}

      {/* Single centralized rendered modal */}
      {modalState.isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#EDE4D8] max-w-sm w-full p-6 shadow-2xl rounded-none space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 flex items-center justify-center shrink-0 border rounded-none ${getIconBg()}`}>
                {getIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-normal text-base font-bold text-[#1F1713]">
                  {modalState.title}
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {modalState.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EDE4D8]">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold rounded-none cursor-pointer transition-colors"
              >
                {modalState.cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-5 py-2 text-[#FAF7F2] text-xs font-bold rounded-none cursor-pointer tracking-wider uppercase transition-colors shadow-xs ${
                  modalState.type === 'danger' || modalState.type === 'logout'
                    ? 'bg-[#6D021B] hover:bg-[#580115]'
                    : 'bg-[#1F1713] hover:bg-black'
                }`}
              >
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmModalContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmModalContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmModalProvider')
  }
  return context
}

export default ConfirmModalProvider

