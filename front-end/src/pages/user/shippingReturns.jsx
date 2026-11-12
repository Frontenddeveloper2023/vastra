import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Truck,
  RotateCcw,
  Clock,
  Banknote,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Headphones,
} from 'lucide-react'
import { useHomeCMS } from '../../context/HomeCMSContext'

export default function ShippingReturns() {
  const { cmsData } = useHomeCMS()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const defaultPoints = [
    {
      title: 'Free Pan-India Delivery',
      description: 'Free complimentary shipping on all orders above ₹1,999. A nominal flat ₹99 fee applies to smaller orders.',
    },
    {
      title: 'Quick Dispatch & Delivery Timelines',
      description: 'Orders are dispatched within 24 to 48 hours. Metro deliveries arrive in 2–4 days; rest of India within 4–7 days.',
    },
    {
      title: '7-Day Return Window',
      description: 'Customers can request a return within 7 days from the delivery date directly from their "My Orders" page.',
    },
    {
      title: 'Hassle-Free Doorstep Pickup',
      description: 'Once approved, our courier partner picks up the return package directly from your delivery address at no extra cost.',
    },
    {
      title: 'Return Eligibility Condition',
      description: 'The saree must be unworn, unwashed, and folded with original brand tags and Silk Mark authenticity seals intact.',
    },
    {
      title: 'Fast & Direct Refunds',
      description: 'Refunds are released within 48 hours of quality inspection back to your original payment method (or UPI/Bank for COD).',
    },
    {
      title: 'Customer Support Assistance',
      description: 'Need help with an exchange or tracking? Our support team is available Mon–Sat from 10:00 AM to 7:00 PM IST.',
    },
  ]

  const policyData = cmsData?.shippingReturns || {}
  const title = policyData.title || 'Shipping & Returns'
  const subtitle = policyData.subtitle || 'Simple 7-point policy guide for your peace of mind.'
  const pointsList = (policyData.points && policyData.points.length > 0) ? policyData.points : defaultPoints

  const icons = [Truck, Clock, RotateCcw, CheckCircle2, ShieldAlert, Banknote, Headphones]

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen pt-[55px] md:pt-[76px] lg:pt-[95px] pb-16 font-sans">
      {/* Header */}
      <div className="bg-[#6D021B] text-white py-7 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="relative max-w-2xl mx-auto space-y-1.5">
    
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-stone-200 font-light mt-1 max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 7 Points List */}
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#EDE4D8] p-3.5 sm:p-6 md:p-8 shadow-xs divide-y divide-[#EDE4D8]">
          {pointsList.map((pt, idx) => {
            const Icon = icons[idx % icons.length]
            const numStr = String(idx + 1).padStart(2, '0')
            return (
              <div
                key={idx}
                className="py-3.5 sm:py-4.5 first:pt-0 last:pb-0 flex items-start gap-2.5 sm:gap-4 transition-colors hover:bg-stone-50/50 rounded-lg sm:p-2"
              >
                {/* Number Badge */}
                <span className="font-serif text-sm sm:text-base md:text-lg font-bold text-[#6D021B] shrink-0 mt-1 sm:mt-0.5 w-5 sm:w-7 text-center">
                  {numStr}.
                </span>

                {/* Icon Box */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#6D021B]/10 text-[#6D021B] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm md:text-base font-bold text-stone-900 leading-snug">
                    {pt.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs md:text-sm text-stone-600 mt-1 leading-relaxed break-words">
                    {pt.description || pt.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Contact Bar */}
        <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-[#FAF7F2] rounded-xl sm:rounded-2xl border border-[#EDE4D8] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-stone-700">
            Have a question about your order? We are here to assist you.
          </p>
          <Link
            to="/contact"
            className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-4 py-2.5 sm:py-2 bg-[#6D021B] text-white hover:bg-[#520114] text-xs font-semibold rounded-xl transition-all shrink-0 shadow-2xs active:scale-98"
          >
            <span>Contact Support</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
