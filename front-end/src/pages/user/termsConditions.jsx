import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useHomeCMS } from '../../context/HomeCMSContext'

export default function TermsConditions() {
  const { cmsData } = useHomeCMS()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const defaultPoints = [
    {
      title: 'Acceptance of Terms',
      description: 'By accessing, browsing, or purchasing from Vastraa ("we", "us", or "our"), you agree to comply with and be bound by these Terms and Conditions. If you disagree with any part of these terms, please do not use our boutique services.',
    },
    {
      title: 'Handloom Authenticity & Color Accuracy',
      description: 'Our sarees are woven by traditional master artisans using natural silks, zari, and dyes. Due to the handcrafted nature and varying screen brightness calibrations across mobile and desktop devices, slight variations in weave texture or hue may naturally occur and are a hallmark of authentic handloom.',
    },
    {
      title: 'Pricing & Payments',
      description: 'All prices are listed in Indian Rupees (₹ INR) inclusive of applicable taxes. We accept UPI, Netbanking, Credit/Debit cards, and Cash On Delivery. We reserve the right to correct any typographical pricing errors prior to order dispatch.',
    },
    {
      title: 'Order Cancellations & Returns',
      description: 'Orders may be cancelled before the parcel is marked as Shipped. Delivered items are eligible for return within the specified return window (standard 7 days) subject to our Return Policy conditions.',
    },
  ]

  const policyData = cmsData?.termsConditions || {}
  const title = policyData.title || 'Terms & Conditions'
  const subtitle = policyData.subtitle || 'Legal & Compliance agreements for our customers.'
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
              Questions? Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
