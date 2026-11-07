import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone, CheckCircle2, Send, Sparkles } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'

export default function Contact() {
  const { settings } = useSettings()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill in your name, email, and message.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    }, 600)
  }

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen pt-[76px] sm:pt-[84px] md:pt-[136px] lg:pt-[144px] pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* ─── Top 3 Info Cards Row with Primary & Secondary Accents ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 sm:mb-14">

          {/* Card 1: Address */}
          <div className="bg-white rounded-none-2xl border border-[#EDE4D8] p-8 shadow-xs hover:shadow-md hover:border-secondary transition-all duration-300 flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-none-full border-2 border-secondary/40 bg-[#FFFDF9] flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-secondary group-hover:border-primary transition-all duration-300 shrink-0 shadow-2xs">
              <MapPin className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-bold text-[#1F1713] mb-2 font-serif group-hover:text-primary transition-colors">
              Address
            </h3>
            <a
              href={settings.googleMapsUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="text-xs sm:text-sm text-[#6B5E55] hover:text-primary leading-relaxed max-w-xs transition-colors"
            >
              {settings.atelierAddress || 'Plot No 1, 3rd Street, Tambaram, Urapakkam, Chennai - 603 210'}
            </a>
          </div>

          {/* Card 2: Email */}
          <div className="bg-white rounded-none-2xl border border-[#EDE4D8] p-8 shadow-xs hover:shadow-md hover:border-secondary transition-all duration-300 flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-none-full border-2 border-secondary/40 bg-[#FFFDF9] flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-secondary group-hover:border-primary transition-all duration-300 shrink-0 shadow-2xs">
              <Mail className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-bold text-[#1F1713] mb-2 font-serif group-hover:text-primary transition-colors">
              Email
            </h3>
            <a
              href={`mailto:${settings.contactEmail || 'vastraa@gmail.com'}`}
              className="text-xs sm:text-sm text-[#6B5E55] hover:text-primary font-medium transition-colors"
            >
              {settings.contactEmail || 'vastraa@gmail.com'}
            </a>
          </div>

          {/* Card 3: Phone */}
          <div className="bg-white rounded-none-2xl border border-[#EDE4D8] p-8 shadow-xs hover:shadow-md hover:border-secondary transition-all duration-300 flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-none-full border-2 border-secondary/40 bg-[#FFFDF9] flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-secondary group-hover:border-primary transition-all duration-300 shrink-0 shadow-2xs">
              <Phone className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-bold text-[#1F1713] mb-2 font-serif group-hover:text-primary transition-colors">
              Phone
            </h3>
            <a
              href={`tel:${(settings.supportPhone || '+91 9807738888').replace(/\s+/g, '')}`}
              className="text-xs sm:text-sm text-[#6B5E55] hover:text-primary font-medium transition-colors"
            >
              {settings.supportPhone || '+91 9807738888'}
            </a>
          </div>

        </div>

        {/* ─── Main Content: Get In Touch Form & Interactive Map ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Get In Touch Form (7 cols on lg) */}
          <div className="lg:col-span-7 bg-white rounded-none-2xl border border-[#EDE4D8] p-6 sm:p-8 md:p-10 shadow-xs">

            {/* Small Gold Secondary Tag */}
            <div className="flex items-center gap-1.5 text-secondary text-xs font-bold uppercase tracking-widest mb-1.5">
              
              <span>We Are Here For You</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight font-serif">
              Get In Touch
            </h2>
            <p className="text-sm sm:text-base text-[#6B5E55] leading-relaxed mt-2.5 mb-7">
              We&apos;d love to hear from you. Whether you have questions about our products,
              need support with an order, or simply want to share feedback, our team is ready to help.
            </p>

            {/* Success Submission Alert with Primary & Secondary theme */}
            {isSubmitted && (
              <div className="mb-6 p-4 rounded-none-xl bg-[#FAF5EB] border border-secondary/50 flex items-start gap-3 animate-fade-in shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-secondary-dark shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-primary">Message Sent Successfully!</h4>
                  <p className="text-xs sm:text-sm text-[#6B5E55] mt-0.5">
                    Thank you for reaching out to Vastraa. Our concierge team will respond within 24 hours.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Row 1: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                    className="w-full rounded-none-xl border border-[#E3D7C7] px-4 py-3 text-sm text-[#1F1713] placeholder-[#9E9085] bg-[#FCFAF7] hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all shadow-2xs"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    required
                    className="w-full rounded-none-xl border border-[#E3D7C7] px-4 py-3 text-sm text-[#1F1713] placeholder-[#9E9085] bg-[#FCFAF7] hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 2: Phone and Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full rounded-none-xl border border-[#E3D7C7] px-4 py-3 text-sm text-[#1F1713] placeholder-[#9E9085] bg-[#FCFAF7] hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all shadow-2xs"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Subject"
                    className="w-full rounded-none-xl border border-[#E3D7C7] px-4 py-3 text-sm text-[#1F1713] placeholder-[#9E9085] bg-[#FCFAF7] hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 3: Message Textarea */}
              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  rows={5}
                  required
                  className="w-full rounded-none-xl border border-[#E3D7C7] p-4 text-sm text-[#1F1713] placeholder-[#9E9085] bg-[#FCFAF7] hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all resize-none shadow-2xs"
                />
              </div>

              {/* Submit Button with Primary Maroon & Gold Secondary Accents */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary-dark text-white font-medium text-sm px-8 py-3.5 rounded-none-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border border-primary group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-none-full animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-secondary group-hover:translate-x-0.5 transition-transform" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Google Map Embed (5 cols on lg) with Gold Secondary Border Accent */}
          <div className="lg:col-span-5 h-full">
            <div className="w-full h-full min-h-[380px] sm:min-h-[460px] rounded-none-2xl overflow-hidden border border-[#EDE4D8] hover:border-secondary/60 shadow-xs transition-colors bg-white">
              <iframe
                title="Google Map Location of Tambaram, Chennai"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62217.47648439063!2d80.0768461759796!3d12.923846614144342!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525f778330ff21%3A0xc3b83921!2sTambaram%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full min-h-[380px] sm:min-h-[460px] border-0 block"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
