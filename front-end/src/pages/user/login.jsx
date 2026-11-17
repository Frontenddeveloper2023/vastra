import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import {
  Mail,
  CheckCircle2,
  User,
  RefreshCw,
  ChevronLeft,
  AlertTriangle,
  AlertCircle,
  KeyRound
} from 'lucide-react'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import loginBg from '../../assets/luxury-login-bg.jpg'

export default function CustomerLogin() {
  const { isAuthenticated, customer, loginWithGoogle, sendEmailOtp, verifyEmailOtp, loading, logout } = useCustomerAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Authentication Mode: 'login' | 'signup'
  const [authMode, setAuthMode] = useState('login')
  const [step, setStep] = useState('input') // 'input' | 'otp'

  // Input states
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    otp: ''
  })

  // Server error / dynamic switch prompt
  const [serverError, setServerError] = useState({
    type: '',
    message: '',
    actionText: '',
    actionMode: ''
  })

  const [countdown, setCountdown] = useState(0)
  const redirectPath = location.state?.from || '/'

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // Field Level Validation
  const validateField = (field, value) => {
    let err = ''

    if (field === 'name' && authMode === 'signup') {
      if (!value.trim()) {
        err = 'Please enter your name.'
      } else if (value.trim().length < 2) {
        err = 'Name must be at least 2 characters long.'
      }
    }

    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!value.trim()) {
        err = 'Please enter your email address.'
      } else if (!emailRegex.test(value.trim())) {
        err = 'Please enter a valid email address.'
      }
    }

    if (field === 'otp') {
      if (!value.trim()) {
        err = 'Please enter the 6-digit code.'
      } else if (value.trim().length < 6) {
        err = 'Please enter all 6 digits.'
      }
    }

    setFieldErrors((prev) => ({ ...prev, [field]: err }))
    return !err
  }

  // Handle Send OTP (works for both Login and Signup with Username)
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault()
    setServerError({ type: '', message: '', actionText: '', actionMode: '' })

    const isNameValid = authMode === 'signup' ? validateField('name', name) : true
    const isEmailValid = validateField('email', email)
    if (!isNameValid || !isEmailValid) return

    const res = await sendEmailOtp(email.trim(), authMode)
    if (res.success) {
      setStep('otp')
      setCountdown(45)
    } else {
      const errMsg = res.error || 'Failed to send verification code.'
      if (errMsg.toLowerCase().includes('already exists')) {
        setServerError({
          type: 'already_exists',
          message: 'An account with this email already exists.',
          actionText: 'Switch to Sign In',
          actionMode: 'login'
        })
      } else if (errMsg.toLowerCase().includes('no account found') || errMsg.toLowerCase().includes('register')) {
        setServerError({
          type: 'not_found',
          message: 'We could not find an account with this email address.',
          actionText: 'Create an Account',
          actionMode: 'signup'
        })
      } else {
        setServerError({
          type: 'error',
          message: errMsg,
          actionText: '',
          actionMode: ''
        })
      }
    }
  }

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault()
    setServerError({ type: '', message: '', actionText: '', actionMode: '' })

    const isOtpValid = validateField('otp', otp)
    if (!isOtpValid) return

    const res = await verifyEmailOtp(email.trim(), otp.trim(), name.trim())
    if (!res.success) {
      setServerError({
        type: 'error',
        message: res.error || 'Incorrect or expired code. Please try again.',
        actionText: '',
        actionMode: ''
      })
    } else {
      // Direct redirect to home page "/" upon successful authentication
      navigate('/', { replace: true })
    }
  }

  // Pure Google OAuth for both Sign In and Sign Up (No password needed)
  const triggerGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        const googleUser = await userInfoRes.json()
        if (googleUser && googleUser.email) {
          const res = await loginWithGoogle(googleUser)
          if (res.success) {
            navigate('/', { replace: true })
            return
          } else {
            setServerError({
              type: 'error',
              message: res.error || 'Google sign-in could not be completed.',
              actionText: '',
              actionMode: ''
            })
            return
          }
        }
      } catch (err) {
        console.error('Google Auth Error:', err)
      }
      setServerError({
        type: 'error',
        message: 'Google login was interrupted. Please continue with Email OTP.',
        actionText: '',
        actionMode: ''
      })
    },
    onError: () => {
      setServerError({
        type: 'error',
        message: 'Google sign-in failed. Please try with Email OTP.',
        actionText: '',
        actionMode: ''
      })
    }
  })

  // Switch cleanly between Sign In & Sign Up
  const switchMode = (mode) => {
    setAuthMode(mode)
    setFieldErrors({ name: '', email: '', otp: '' })
    setServerError({ type: '', message: '', actionText: '', actionMode: '' })
  }

  return (
    <div
      className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden font-sans select-none bg-stone-900"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* ─── TOP LEFT BRAND HEADER MATCHING NAVBAR ─── */}
      <header className="pt-6 sm:pt-8 px-6 sm:px-12 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 sm:gap-3 group tracking-wide select-none cursor-pointer"
        >
          {/* Brand Logo Emblem Image from Navbar */}
          <img
            src={`${import.meta.env.BASE_URL || '/'}slides/logo.png`}
            alt="Vastraa Emblem"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105 shrink-0 drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]"
          />

          {/* VASTRAA Brand Text from Navbar */}
          <div className="flex flex-col items-start justify-center text-left">
            <span className="font-normal text-[17px] sm:text-[20px] md:text-[23px] font-black tracking-[0.18em] transition-colors leading-none uppercase text-[#FFF8ED] drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] group-hover:text-[#DEA53B]">
              VASTRAA
            </span>
            <span className="text-[7.5px] sm:text-[9px] md:text-[10px] font-sans font-bold tracking-[0.24em] transition-colors uppercase mt-1 leading-none text-[#DEA53B] drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              THE HOUSE OF SAREES
            </span>
          </div>
        </Link>
      </header>

      {/* ─── CENTER FLOATING ROYAL LOGIN CARD ─── */}
      <main className="flex-1 flex items-center justify-center sm:justify-start px-4 sm:px-12 lg:px-24 py-8 z-20">
        <div
          className="w-full max-w-[420px] rounded-[24px] bg-[#FAF8F5]/96 backdrop-blur-md p-7 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.55),0_0_0_1px_rgba(216,180,109,0.35)] relative overflow-hidden transition-all duration-300 border border-[#E9DAC3]"
          style={{
            boxShadow: '0 20px 50px rgba(0,0,0,0.45), 0 0 0 1px rgba(220,185,120,0.4), inset 0 0 40px rgba(255,255,255,0.6)'
          }}
        >
          {/* Subtle Corner Ornament */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#DEA53B]/10 to-transparent pointer-events-none rounded-tr-[24px]" />

          {/* ─── CASE: USER ALREADY LOGGED IN ─── */}
          {isAuthenticated ? (
            <div className="text-center space-y-5 py-4">
              <div className="w-18 h-18 mx-auto rounded-full p-1 bg-gradient-to-r from-[#DEA53B] to-[#6D021B] shadow-md">
                {customer?.avatar ? (
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#6D021B]">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#A87B28]">
                  Exclusive Account
                </span>
                <h2 className="font-normal text-2xl font-normal text-[#2A1B0E] mt-1">
                  Welcome, {customer?.name || 'Patron'}
                </h2>
                <p className="text-xs text-stone-600 mt-1 font-normal">
                  Signed in as <span className="font-sans font-semibold">{customer?.email}</span>
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full py-3.5 rounded-lg text-xs font-bold tracking-[0.2em] uppercase text-[#FBF6E9] shadow-[0_4px_16px_rgba(109,2,27,0.4)] transition-all duration-200 cursor-pointer active:scale-98"
                  style={{
                    background: 'linear-gradient(180deg, #4F0013 0%, #2A000A 100%)',
                    border: '1px solid #7D152C'
                  }}
                >
                  Continue to Shop
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout()
                    switchMode('login')
                  }}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold tracking-wider text-stone-600 hover:text-stone-900 border border-stone-300 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Sign Out / Switch Account
                </button>
              </div>
            </div>
          ) : (
            /* ─── CASE: AUTHENTICATION FORM (SIGN IN / SIGN UP) ─── */
            <div className="space-y-6">
              {/* Card Title Matching Reference: SIGN IN vs CREATE ACCOUNT */}
              <div className="text-center space-y-1.5">
                <h1 className="font-normal text-2xl sm:text-3xl font-medium tracking-[0.14em] uppercase text-[#9B7637]">
                  {step === 'otp'
                    ? 'VERIFY OTP'
                    : authMode === 'login'
                    ? 'SIGN IN'
                    : 'SIGN UP'}
                </h1>
            
              </div>

              {/* Dynamic Error / Helper Message */}
              {serverError.message && (
                <div
                  className={`p-3 rounded-lg border text-xs flex flex-col gap-1 ${
                    serverError.type === 'already_exists' || serverError.type === 'not_found'
                      ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                      : 'bg-rose-50/90 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {serverError.type === 'already_exists' || serverError.type === 'not_found' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug">{serverError.message}</span>
                  </div>
                  {serverError.actionText && (
                    <div className="pl-6 pt-0.5">
                      <button
                        type="button"
                        onClick={() => switchMode(serverError.actionMode)}
                        className="font-bold underline text-[#4F0013] hover:text-[#2A000A] cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>[{serverError.actionText}]</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {step === 'input' ? (
                <div className="space-y-5">
                  <form onSubmit={handleSendOtp} noValidate className="space-y-4">
                    {/* Username / Full Name field: ONLY for Sign Up */}
                    {authMode === 'signup' && (
                      <div className="space-y-1">
                        <label className="block text-[11px] font-normal font-bold text-[#3B2C20]">
                          Your Name
                        </label>
                        <div className="relative border-b border-[#A68349] pb-1.5 focus-within:border-[#4F0013] transition-colors">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value)
                              if (fieldErrors.name) validateField('name', e.target.value)
                            }}
                            onBlur={() => validateField('name', name)}
                            placeholder="Enter your full name"
                            className="w-full bg-transparent text-xs sm:text-sm text-[#2A1B0E] placeholder-[#9E8B78] focus:outline-none pr-8"
                          />
                          <User className="w-4 h-4 text-[#A68349] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {fieldErrors.name && (
                          <p className="text-[10px] text-rose-600 pt-0.5 font-medium">{fieldErrors.name}</p>
                        )}
                      </div>
                    )}

                    {/* Email Field with Underline Style from Reference */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-normal font-bold text-[#3B2C20]">
                        Email Address
                      </label>
                      <div className="relative border-b border-[#A68349] pb-1.5 focus-within:border-[#4F0013] transition-colors">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            if (fieldErrors.email) validateField('email', e.target.value)
                          }}
                          onBlur={() => validateField('email', email)}
                          placeholder="Enter your registered email"
                          className="w-full bg-transparent text-xs sm:text-sm text-[#2A1B0E] placeholder-[#9E8B78] focus:outline-none pr-8"
                        />
                        <Mail className="w-4 h-4 text-[#A68349] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      {fieldErrors.email && (
                        <p className="text-[10px] text-rose-600 pt-0.5 font-medium">{fieldErrors.email}</p>
                      )}
                    </div>

                  

                    {/* Remember me & Quick Toggle */}
                    <div className="flex items-center justify-between text-[11px] font-normal text-[#3B2C20] pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-[#A68349] text-[#4F0013] accent-[#4F0013] cursor-pointer"
                        />
                        <span>Remember me</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => switchMode(authMode === 'login' ? 'signup' : 'login')}
                        className="text-[#8C682A] hover:text-[#4F0013] transition-colors cursor-pointer underline"
                      >
                        {authMode === 'login' ? 'New User Create account?' : 'Already registered?'}
                      </button>
                    </div>

                    {/* Regal Maroon Gradient Action Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg text-xs font-normal font-bold tracking-[0.2em] uppercase text-[#FBF6E9] shadow-[0_3px_12px_rgba(79,0,19,0.35)] transition-all duration-200 cursor-pointer hover:brightness-110 active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
                        style={{
                          background: 'linear-gradient(180deg, #4A0012 0%, #2A000A 100%)',
                          border: '1px solid #751428',
                          boxShadow: '0 3px 12px rgba(74, 0, 18, 0.35), inset 0 1px 1px rgba(255, 215, 140, 0.3)'
                        }}
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>{authMode === 'login' ? 'SIGN IN WITH OTP' : 'SIGN UP WITH OTP'}</span>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Divider: OR SIGN IN WITH */}
                  <div className="relative flex items-center justify-center pt-1">
                    <div className="border-t border-[#D9C4A5] w-full" />
                    <span className="bg-[#FAF8F5] px-3 text-[10px] uppercase font-normal tracking-[0.2em] text-[#7A695A] font-semibold whitespace-nowrap">
                      {authMode === 'login' ? 'OR SIGN IN WITH' : 'OR SIGN UP WITH'}
                    </span>
                    <div className="border-t border-[#D9C4A5] w-full" />
                  </div>

                  {/* Circular Luxury Google Button matching the reference UI */}
                  <div className="flex flex-col items-center justify-center pt-1.5">
                    <button
                      type="button"
                      onClick={() => triggerGoogleAuth()}
                      title={authMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
                      className="flex flex-col items-center gap-1.5 group cursor-pointer select-none"
                    >
                      <div className="w-12 h-12 rounded-full border border-[#D9C4A5] bg-white flex items-center justify-center shadow-sm group-hover:border-[#9B7637] group-hover:scale-105 group-hover:shadow-md transition-all">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      </div>
                      <span className="text-[11px] font-serif text-[#6C5B4C] group-hover:text-[#2A1B0E] font-medium">
                        Google
                      </span>
                    </button>
                  </div>

                  {/* Mode Switch Footnote Matching Reference: "New to Vastraa? [Create an Account]" */}
                  <div className="text-center pt-2">
                    <p className="text-xs font-normal text-[#6C5B4C]">
                      {authMode === 'login' ? 'New to Vastraa? ' : 'Already registered? '}
                      <button
                        type="button"
                        onClick={() => switchMode(authMode === 'login' ? 'signup' : 'login')}
                        className="font-bold text-[#8C682A] hover:text-[#4F0013] underline cursor-pointer"
                      >
                        [{authMode === 'login' ? 'Create an Account' : 'Sign In'}]
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                /* ─── STEP 2: VERIFICATION OTP ─── */
                <form onSubmit={handleVerifyOtp} noValidate className="space-y-5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-normal font-bold text-[#3B2C20]">
                        6-Digit Security Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('input')
                          setOtp('')
                          setFieldErrors((prev) => ({ ...prev, otp: '' }))
                        }}
                        className="text-[11px] text-[#8C682A] hover:text-[#4F0013] underline cursor-pointer inline-flex items-center gap-0.5"
                      >
                        <ChevronLeft className="w-3 h-3" /> Change email
                      </button>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        setOtp(val)
                        if (fieldErrors.otp) validateField('otp', val)
                      }}
                      onBlur={() => validateField('otp', otp)}
                      placeholder="• • • • • •"
                      autoFocus
                      className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 border-b-2 border-[#A68349] focus:border-[#4F0013] bg-transparent text-[#2A1B0E] focus:outline-none transition-colors"
                    />
                    {fieldErrors.otp && (
                      <p className="text-[10px] text-rose-600 text-center pt-1 font-medium">{fieldErrors.otp}</p>
                    )}
                  
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="w-full py-2.5 rounded-lg text-xs font-normal font-bold tracking-[0.2em] uppercase text-[#FBF6E9] shadow-[0_3px_12px_rgba(79,0,19,0.35)] transition-all duration-200 cursor-pointer hover:brightness-110 active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(180deg, #4A0012 0%, #2A000A 100%)',
                        border: '1px solid #751428',
                        boxShadow: '0 3px 12px rgba(74, 0, 18, 0.35), inset 0 1px 1px rgba(255, 215, 140, 0.3)'
                      }}
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#E8C27B]" />
                          <span>VERIFY & CONTINUE</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    {countdown > 0 ? (
                      <p className="text-[11px] font-normal text-stone-500">
                        Resend code in <span className="font-bold text-[#4F0013]">{countdown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="text-[11px] font-normal text-[#8C682A] hover:text-[#4F0013] font-semibold uppercase tracking-wider underline cursor-pointer"
                      >
                        Resend verification code
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

    </div>
  )
}
