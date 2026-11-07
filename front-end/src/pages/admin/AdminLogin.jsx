import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Mail, ArrowRight, RotateCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import notify from '../../utils/toast'
import vastraaLogo from '../../../public/slides/logo.png'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminLogin() {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP
  const [emailInput, setEmailInput] = useState('admin@vastraa.com')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(45)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()

  const { requestOtp, verifyOtp, loading, isAuthenticated } = useAdminAuth()

  // If already authenticated, redirect to admin studio
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin')
    }
  }, [isAuthenticated, navigate])

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [step, timer])

  // 1. Send OTP Request to Backend
  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!emailInput.trim()) {
      setErrorMsg('Please enter your admin email')
      notify.error('Please enter your admin email')
      return
    }

    try {
      const response = await requestOtp(emailInput.trim())
      const msg = response?.message || 'Verification code sent to your email!'
      setSuccessMsg(msg)
      notify.success(msg)
      setOtp(['', '', '', '', '', ''])
      setTimer(45)
      setStep(2)
    } catch (err) {
      const errMsg = err.message || 'Failed to dispatch verification code.'
      setErrorMsg(errMsg)
      notify.error(errMsg)
    }
  }

  // 2. Resend OTP
  const handleResendOtp = async () => {
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const response = await requestOtp(emailInput.trim())
      const msg = 'A new verification code has been dispatched to your email!'
      setSuccessMsg(msg)
      notify.success(msg)
      setOtp(['', '', '', '', '', ''])
      setTimer(45)
    } catch (err) {
      const errMsg = err.message || 'Failed to resend code.'
      setErrorMsg(errMsg)
      notify.error(errMsg)
    }
  }

  // 3. OTP inputs management with Paste Support
  const handleOtpChange = (val, idx) => {
    setErrorMsg('')
    if (val.length > 1) val = val.slice(-1)
    const newOtp = [...otp]
    newOtp[idx] = val
    setOtp(newOtp)

    if (val && idx < 5) {
      const nextInput = document.getElementById(`otp-input-${idx + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    setErrorMsg('')
    const pastedData = e.clipboardData.getData('text/plain').trim()
    // Extract only digits from the pasted text
    const digitsOnly = pastedData.replace(/\D/g, '').slice(0, 6)

    if (!digitsOnly) return

    const newOtp = [...otp]
    for (let i = 0; i < 6; i++) {
      newOtp[i] = digitsOnly[i] || ''
    }
    setOtp(newOtp)

    // Focus on the next empty box or the last box
    const focusIndex = Math.min(digitsOnly.length, 5)
    const targetInput = document.getElementById(`otp-input-${focusIndex}`)
    if (targetInput) targetInput.focus()
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      const prevInput = document.getElementById(`otp-input-${idx - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  // 4. Verify OTP with Backend
  const handleVerify = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    const enteredOtp = otp.join('')
    if (enteredOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.')
      notify.error('Please enter all 6 digits of the verification code.')
      return
    }

    try {
      await verifyOtp(emailInput.trim(), enteredOtp)
      notify.success('Welcome back, Admin!')
      navigate('/admin')
    } catch (err) {
      const errMsg = err.message || 'Invalid or expired verification code.'
      setErrorMsg(errMsg)
      notify.error(errMsg)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-[#EDE4D8] p-7 sm:p-8 shadow-sm">
        {/* Brand Emblem */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={vastraaLogo}
            alt="Vastraa"
            className="w-14 h-14 object-cover shadow-xs mb-2.5"
          />
          <h1 className="font-normal text-2xl font-bold tracking-[0.15em] text-[#6D021B] uppercase">
            VASTRAA
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#DEA53B] mt-0.5">
            Admin Management Portal
          </p>
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-none flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-none flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Step 1: Request OTP via Email */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div className="text-center pb-1">
              <h2 className="text-base font-bold text-stone-800">Admin Sign In</h2>
              <p className="text-stone-500 mt-1">
                Enter your registered admin email address to receive an authentication OTP.
              </p>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  placeholder="admin@vastraa.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#EDE4D8] text-stone-800 focus:outline-none focus:border-[#6D021B] text-xs font-medium bg-[#FAF7F2]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#6D021B] text-white font-bold text-xs hover:bg-[#580115] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-70"
            >
              {loading ? (
                <span>Requesting Code...</span>
              ) : (
                <>
                  <span>Request Login OTP</span>
                  <ArrowRight className="w-4 h-4 text-[#DEA53B]" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Verify OTP */
          <form onSubmit={handleVerify} className="space-y-5 text-xs">
            <div className="text-center">
              <h2 className="text-base font-bold text-stone-800">Enter Verification Code</h2>
              <p className="text-stone-500 mt-1">
                We sent a 6-digit code to <strong className="text-stone-800">{emailInput}</strong>
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                Please check your inbox (and spam folder) for the verification code.
              </p>
            </div>

            {/* 6 Digit Input Boxes with Paste Support */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onPaste={handlePaste}
                  className="w-10 h-12 text-center text-lg font-bold border border-[#EDE4D8] focus:outline-none focus:border-[#6D021B] focus:ring-1 focus:ring-[#6D021B] bg-[#FAF7F2]"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#6D021B] text-white font-bold text-xs hover:bg-[#580115] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-70"
            >
              {loading ? 'Sendng OTP...' : 'Verify & Open Admin Portal'}
            </button>

            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setErrorMsg('')
                  setSuccessMsg('')
                }}
                className="hover:text-[#6D021B] font-semibold cursor-pointer"
              >
                ← Change Email
              </button>

              <span className="text-stone-400">
                {timer > 0 ? (
                  <>Resend in <strong className="text-stone-700">00:{timer < 10 ? `0${timer}` : timer}</strong></>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[#6D021B] font-bold hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </span>
            </div>
          </form>
        )}

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-[#EDE4D8] flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-[#DEA53B]" />
          <span>Vastraa Official Administrative Security</span>
        </div>
      </div>
    </div>
  )
}
