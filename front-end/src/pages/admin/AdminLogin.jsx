import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Mail, ArrowRight, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react'
import vastraaLogo from '../../../public/slides/logo.png'

export default function AdminLogin() {
  const [step, setStep] = useState(1) // 1: Enter Email, 2: Enter OTP
  const [emailInput, setEmailInput] = useState('admin@vastraa.com')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [timer, setTimer] = useState(45)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  // Generate a random 6-digit OTP
  const createRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  useEffect(() => {
    let interval
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [step, timer])

  const handleSendOtp = (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!emailInput.trim()) {
      setErrorMsg('Please enter your admin email')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailInput.trim())) {
      setErrorMsg('Please enter a valid email address')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const newRandomOtp = createRandomOtp()
      setGeneratedOtp(newRandomOtp)
      setOtp(['', '', '', '', '', ''])
      setTimer(45)
      setLoading(false)
      setStep(2)
    }, 700)
  }

  const handleResendOtp = () => {
    const newRandomOtp = createRandomOtp()
    setGeneratedOtp(newRandomOtp)
    setOtp(['', '', '', '', '', ''])
    setTimer(45)
    setErrorMsg('')
  }

  const handleOtpChange = (val, idx) => {
    setErrorMsg('')
    if (val.length > 1) val = val.slice(-1)
    const newOtp = [...otp]
    newOtp[idx] = val
    setOtp(newOtp)

    // Auto-focus next input
    if (val && idx < 5) {
      const nextInput = document.getElementById(`otp-input-${idx + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      const prevInput = document.getElementById(`otp-input-${idx - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleFillDummyOtp = () => {
    if (generatedOtp) {
      setOtp(generatedOtp.split(''))
      setErrorMsg('')
    }
  }

  const handleVerify = (e) => {
    e.preventDefault()
    setErrorMsg('')
    const enteredOtp = otp.join('')
    if (enteredOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP')
      return
    }
    if (enteredOtp !== generatedOtp) {
      setErrorMsg('Incorrect OTP entered. Please check the code shown above and try again.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/admin')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-[#EDE4D8] p-8 shadow-sm">
        {/* Brand Emblem */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={vastraaLogo}
            alt="Vastraa"
            className="w-16 h-16  object-cover shadow-xs mb-3"
          />
          <h1 className="font-normal text-2xl font-bold tracking-[0.15em] text-[#6D021B] uppercase">
            VASTRAA
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#DEA53B] mt-0.5">
            Admin Management Portal
          </p>
        </div>

        {/* Step 1: Request OTP via Email */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div className="text-center pb-2">
              <h2 className="text-base font-bold text-stone-800">Admin Sign In</h2>
              <p className="text-stone-500 mt-1">
                Enter your registered admin email address
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
                  className="w-full pl-9 pr-3 py-2.5 border border-[#EDE4D8] text-stone-800 focus:outline-none focus:border-[#6D021B] text-xs font-medium"
                />
              </div>
              {errorMsg && (
                <p className="mt-1.5 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#6D021B] text-white font-bold text-xs hover:bg-[#580115] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {loading ? (
                <span> OTP Sending...</span>
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

              {/* Generated Random Dummy OTP Badge */}
              <div className="mt-3 flex flex-col items-center justify-center gap-1.5 p-3  bg-[#FAF7F2] border border-[#DEA53B]/50 shadow-2xs">
                <span className="text-[11px] text-stone-500 font-medium">Your Generated Security OTP:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono font-extrabold tracking-[0.25em] text-[#6D021B] px-3 py-0.5 bg-white  border border-[#EDE4D8]">
                    {generatedOtp}
                  </span>
                  <button
                    type="button"
                    onClick={handleFillDummyOtp}
                    className="px-2.5 py-1 text-[11px] bg-[#6D021B] text-white font-bold hover:bg-[#580115] transition-colors cursor-pointer"
                  >
                    Auto-fill
                  </button>
                </div>
              </div>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-10 h-12 text-center text-lg font-bold border border-[#EDE4D8] focus:outline-none focus:border-[#6D021B] focus:ring-1 focus:ring-[#6D021B] bg-[#FAF7F2]"
                />
              ))}
            </div>

            {errorMsg && (
              <p className="text-[11px] text-red-600 font-semibold flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#6D021B] text-white  font-bold text-xs hover:bg-[#580115] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {loading ? 'Validating Passcode...' : 'Verify & Open Admin Portal'}
            </button>

            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setErrorMsg('')
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
                    Resend New Code
                  </button>
                )}
              </span>
            </div>
          </form>
        )}

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-[#EDE4D8] flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-[#DEA53B]" />
          <span>Vastraa Official Admin Security Portal</span>
        </div>
      </div>

     
    </div>
  )
}

