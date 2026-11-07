import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { X, Mail, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, User, ShoppingBag } from 'lucide-react'
import { useCustomerAuth } from '../context/CustomerAuthContext'

export default function CustomerAuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, sendEmailOtp, verifyEmailOtp, loading } = useCustomerAuth()

  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup'
  const [step, setStep] = useState('input') // 'input' | 'otp'
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  if (!isAuthModalOpen) return null

  // Start 45s resend timer
  const startTimer = () => {
    setCountdown(45)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Handle Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')

    if (authMode === 'signup' && !name.trim()) {
      setError('Please enter your full name to register.')
      return
    }

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    const res = await sendEmailOtp(email.trim())
    if (res.success) {
      setStep('otp')
      startTimer()
    } else {
      setError(res.error || 'Failed to send OTP')
    }
  }

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    const res = await verifyEmailOtp(email.trim(), otp.trim(), name.trim())
    if (!res.success) {
      setError(res.error || 'Incorrect code. Please try again.')
    }
  }

  // Handle Google OAuth
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    if (credentialResponse.credential) {
      const res = await loginWithGoogle(credentialResponse.credential)
      if (!res.success) {
        setError(res.error || 'Google login failed')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-[#EDE4D8] w-full max-w-md shadow-2xl relative overflow-hidden text-left">
        {/* Top Gold Border */}
        <div className="h-1 bg-gradient-to-r from-[#DEA53B] via-[#6D021B] to-[#DEA53B]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-3.5 right-3.5 p-1.5 text-stone-400 hover:text-stone-900 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Friendly Prompt Header */}
        <div className="bg-[#FAF7F2] p-4 sm:p-5 border-b border-[#EDE4D8] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#6D021B]/10 flex items-center justify-center text-[#6D021B] shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-base sm:text-lg font-bold text-[#1F1713]">
              Sign in to add to your bag
            </h4>
            <p className="text-[11px] sm:text-xs text-stone-500">
              Please sign in or create an account to reserve and purchase your selected saree.
            </p>
          </div>
        </div>

        {/* Mode Switch Tabs (Login vs Sign Up) */}
        {step === 'input' && (
          <div className="grid grid-cols-2 border-b border-[#EDE4D8] bg-[#FAF7F2]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login')
                setError('')
              }}
              className={`py-2.5 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-[#6D021B] border-b-2 border-[#6D021B]'
                  : 'text-stone-500 hover:text-[#1F1713]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup')
                setError('')
              }}
              className={`py-2.5 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-[#6D021B] border-b-2 border-[#6D021B]'
                  : 'text-stone-500 hover:text-[#1F1713]'
              }`}
            >
              New Customer
            </button>
          </div>
        )}

        <div className="p-6 sm:p-7 space-y-4">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              ⚠ {error}
            </div>
          )}

          {step === 'input' && (
            <>
              {/* 1. Google OAuth Button */}
              <div className="flex justify-center pt-1">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign in failed. Please try Email OTP.')}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text={authMode === 'login' ? 'continue_with' : 'signup_with'}
                  width="320"
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 border-t border-[#EDE4D8]" />
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  OR WITH EMAIL OTP
                </span>
                <div className="flex-1 border-t border-[#EDE4D8]" />
              </div>

              {/* 2. Email OTP Form */}
              <form onSubmit={handleSendOtp} className="space-y-3">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ananya Sharma"
                        className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] text-xs text-stone-900 focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] text-xs text-stone-900 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#6D021B] hover:bg-[#520117] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{authMode === 'login' ? 'Get Sign In Code' : 'Send Registration Code'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1 text-center">
                  6-Digit Verification Code sent to {email}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.5em] text-lg font-bold py-2.5 bg-[#FAF7F2] border border-[#EDE4D8] focus:outline-none focus:bg-white"
                />
                <p className="mt-1 text-[10px] text-stone-400 text-center">
                  Development test code: <span className="font-mono font-bold text-stone-600">999999</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-2.5 bg-[#6D021B] hover:bg-[#520117] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#DEA53B]" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="hover:text-stone-900 underline cursor-pointer text-[11px]"
                >
                  Change Email
                </button>

                {countdown > 0 ? (
                  <span className="text-[11px] text-stone-400">Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-[#6D021B] font-bold hover:underline cursor-pointer text-[11px]"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="pt-2 text-center text-[10px] text-stone-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
            <span>Secure 256-bit encrypted authentication. No passwords required.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
