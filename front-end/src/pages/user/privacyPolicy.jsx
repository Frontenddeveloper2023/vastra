import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useHomeCMS } from '../../context/HomeCMSContext'

export default function PrivacyPolicy() {
  const { cmsData } = useHomeCMS()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const defaultPoints = [
    {
      title: 'Information We Collect',
      description: 'When you browse, register, or place an order on Vastraa, we collect information necessary to fulfill your request, including your name, contact phone number, delivery address, and email address for order notifications.',
    },
    {
      title: 'Payment Security',
      description: 'We do not store your credit card, debit card, or UPI PIN on our servers. All financial transactions are securely processed through RBI-authorized payment gateways featuring 256-bit SSL encryption.',
    },
    {
      title: 'No Third-Party Selling',
      description: 'Your personal information is strictly confidential. We never sell, rent, or trade your personal details to outside marketing agencies. Information is shared only with verified logistics partners solely for delivering your order.',
    },
    {
      title: 'Cookies & Preferences',
      description: 'We use minimal cookies to remember items in your shopping bag and maintain your session securely. You can manage or clear cookie preferences in your browser at any time.',
    },
  ]

  const policyData = cmsData?.privacyPolicy || {}
  const title = policyData.title || 'Privacy Policy'
  const subtitle = policyData.subtitle || 'How we protect, encrypt, and handle your personal information at Vastraa.'
  const pointsList = (policyData.points && policyData.points.length > 0) ? policyData.points : defaultPoints

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen pt-[55px] md:pt-[76px] lg:pt-[95px] pb-16 font-sans">
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

      <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        <div className="bg-white p-4 sm:p-7 md:p-10 rounded-xl sm:rounded-2xl border border-[#EDE4D8] shadow-xs space-y-4 sm:space-y-6 text-xs sm:text-sm text-stone-600 leading-relaxed">
        

          {pointsList.map((pt, idx) => (
            <section key={idx} className="space-y-1.5 sm:space-y-2">
              <h2 className="font-bold text-stone-900 text-xs sm:text-sm">
                {idx + 1}. {pt.title}
              </h2>
              <p className="break-words">
                {pt.description}
              </p>
            </section>
          ))}

          <div className="pt-3 sm:pt-4 border-t border-[#EDE4D8] flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-xs text-stone-500">
            <span>Last updated: November 2026</span>
            <Link to="/contact" className="text-[#6D021B] font-bold hover:underline py-1 sm:py-0">
              Contact Privacy Officer
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
