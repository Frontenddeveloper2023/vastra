import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

export default function WhatsAppFloatingButton() {
  const { settings } = useSettings()
  const location = useLocation()
  const [hovered, setHovered] = useState(false)

  // Don't show on admin panel or checkout page
  if (location.pathname.startsWith('/admin') || location.pathname === '/checkout') {
    return null
  }

  // Format phone number to clean international format (only digits)
  const rawPhone = settings?.supportPhone || '+91 9807738888'
  let cleanPhone = rawPhone.replace(/\D/g, '')
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone // default to India code if 10 digits
  }

  const messageText =
    settings?.whatsappMessage ||
    `Hello ${settings?.storeName || 'Vastraa'}, I am browsing your saree collection and would like to know more details!`

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`

  return (
    <aside
      aria-label="WhatsApp Customer Support"
      className="fixed bottom-20 lg:bottom-6 right-3.5 sm:right-6 z-40 flex items-center gap-2 select-none"
    >
      {/* Floating Tooltip Pill (Desktop & on hover) */}
      <div
        className={`hidden sm:flex items-center bg-white text-stone-900 border border-[#EDE4D8] px-3 py-1.5 rounded-full shadow-lg text-xs font-semibold tracking-wide transition-all duration-300 pointer-events-none ${
          hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
        <span>Chat on WhatsApp</span>
      </div>

      {/* WhatsApp Floating Circle Button (Medium on Mobile: 44px / 11x11, Standard on Desktop: 56px / 14x14) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-[0_4px_18px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.6)] hover:scale-108 active:scale-95 transition-all duration-300 relative group cursor-pointer"
      >
        {/* Subtle glowing ring pulse */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping -z-10 pointer-events-none" />

        {/* Official WhatsApp SVG Icon */}
        <svg
          className="w-5.5 h-5.5 sm:w-7.5 sm:h-7.5 fill-current drop-shadow-xs"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.2.302-.777.98-.952 1.181-.176.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.5-1.787-1.676-2.088-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.3.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.927-2.233-.244-.587-.492-.507-.677-.517-.175-.01-.376-.01-.577-.01-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.509 0 1.48 1.078 2.91 1.228 3.111.15.2 2.122 3.24 5.141 4.544.718.311 1.279.497 1.716.636.722.23 1.378.197 1.9.119.58-.088 1.782-.728 2.032-1.431.25-.702.25-1.304.175-1.431-.075-.126-.275-.201-.576-.352zM12.04 2C6.52 2 2.036 6.484 2.036 12.005c0 1.97.574 3.805 1.572 5.353L2 22l4.821-1.545c1.486.88 3.21 1.385 5.048 1.385 5.52 0 10.005-4.484 10.005-10.005C21.874 6.484 17.56 2 12.04 2zm0 18.258c-1.666 0-3.21-.497-4.512-1.353l-.323-.213-3.324 1.065 1.088-3.242-.234-.344c-.958-1.411-1.464-3.078-1.464-4.811 0-4.568 3.717-8.285 8.285-8.285 4.568 0 8.285 3.717 8.285 8.285 0 4.568-3.717 8.285-8.285 8.285z" />
        </svg>

        {/* Live green dot indicator */}
        <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full flex items-center justify-center">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
        </span>
      </a>
    </aside>
  )
}
