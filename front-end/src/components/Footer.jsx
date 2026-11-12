import { Link } from 'react-router-dom'
import vastraaLogo from '../../public/slides/logo.png'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'

export default function Footer() {
  const { openCart } = useCart()
  const { settings } = useSettings()

  return (
    <footer
      className="w-full bg-primary text-white border-t-2 border-secondary/35 overflow-hidden"
      style={{
        paddingTop: 'clamp(32px, 4vw, 48px)',
        paddingBottom: '32px',
        width: '100%',
      }}
    >
      {/* Centered Main Container */}
      <div
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col"
        style={{ marginLeft: 'auto', marginRight: 'auto', width: '100%' }}
      >
        {/* Top 4 Columns Grid */}
        <div
          className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 border-b border-white/10"
          style={{ paddingBottom: 'clamp(32px, 4vw, 48px)' }}
        >
          {/* Column 1: Brand & About & Social Icons (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            {/* Brand Official Logo & Name */}
            <div className="flex items-center justify-center md:justify-start gap-3.5 mb-4 text-left">
              <img
                src={vastraaLogo}
                alt={settings.storeName || 'Vastraa - The House of Sarees'}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-none-full object-cover shadow-md border border-secondary/50 shrink-0 bg-white"
              />
              <div>
                <span className="font-normal text-2xl font-bold tracking-[0.18em] text-white uppercase block leading-none">
                  VASTRAA
                </span>
                <span className="text-[10px] tracking-[0.25em] text-secondary font-sans uppercase font-medium mt-1 block">
                  The House of Sarees
                </span>
              </div>
            </div>

            {/* Brand Description */}
            <p className="text-sm font-light text-white/75 leading-relaxed max-w-sm mb-5 text-center md:text-left mx-auto md:mx-0">
              Curated ethnic collections designed with timeless elegance, pure silks, and warm royal palettes. Crafted for your grand celebrations and everyday grace.
            </p>

            {/* Social Media Pill Buttons */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              {/* Facebook */}
              <a
                href={settings.facebook || 'https://facebook.com'}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-none-full bg-white/10 hover:bg-secondary hover:text-primary-dark text-white/80 flex items-center justify-center transition-all duration-300 hover:scale-105"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href={settings.instagram || 'https://instagram.com'}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-none-full bg-white/10 hover:bg-secondary hover:text-primary-dark text-white/80 flex items-center justify-center transition-all duration-300 hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>

              {/* Twitter / X */}
              <a
                href={settings.twitter || 'https://x.com'}
                target="_blank"
                rel="noreferrer"
                aria-label="X Twitter"
                className="w-9 h-9 rounded-none-full bg-white/10 hover:bg-secondary hover:text-primary-dark text-white/80 flex items-center justify-center transition-all duration-300 hover:scale-105"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href={settings.youtube || 'https://youtube.com'}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-none-full bg-white/10 hover:bg-secondary hover:text-primary-dark text-white/80 flex items-center justify-center transition-all duration-300 hover:scale-105"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols on lg) */}
          <div className="lg:col-span-2 text-center md:text-left flex flex-col items-center md:items-start">
            <h3 className="font-sans text-xs uppercase tracking-[0.18em] font-bold text-white mb-4">
              QUICK LINKS
            </h3>
            <ul className="space-y-2.5 text-sm font-light text-white/75 flex flex-col items-center md:items-start">
              <li>
                <Link to="/" className="hover:text-secondary transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-secondary transition-colors duration-200">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-secondary transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <a href="/#Category" className="hover:text-secondary transition-colors duration-200">
                  Categories
                </a>
              </li>
              <li>
                <Link to="/orders" className="hover:text-secondary transition-colors duration-200">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service (2 cols on lg) */}
          <div className="lg:col-span-2 text-center md:text-left flex flex-col items-center md:items-start">
            <h3 className="font-sans text-xs uppercase tracking-[0.18em] font-bold text-white mb-4">
              CUSTOMER SERVICE
            </h3>
            <ul className="space-y-2.5 text-sm font-light text-white/75 flex flex-col items-center md:items-start">
              <li>
                <Link to="/contact" className="hover:text-secondary transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCart}
                  className="hover:text-secondary transition-colors duration-200 cursor-pointer"
                >
                  Add To Cart
                </button>
              </li>
              <li>
                <Link to="/shipping-returns" className="hover:text-secondary transition-colors duration-200">
                  Shipping &amp; Returns
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-secondary transition-colors duration-200">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-secondary transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company Contact & Address (4 cols on lg) */}
          <div className="lg:col-span-4 text-center md:text-left flex flex-col items-center md:items-start">
            <h3 className="font-sans text-xs uppercase tracking-[0.18em] font-bold text-white mb-4">
              CONTACT US
            </h3>

            <ul className="space-y-4 text-sm font-light text-white/80 flex flex-col items-center md:items-start w-full">
              {/* Address */}
              <li className="flex flex-col sm:flex-row items-center md:items-start text-center md:text-left gap-2 sm:gap-3">
                <div className="w-8 h-8 rounded-none-full bg-white/10 text-secondary flex items-center justify-center shrink-0 border border-white/10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium text-white block">Flagship Atelier:</span>
                  <a
                    href={settings.googleMapsUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs sm:text-sm text-white/75 hover:text-secondary leading-relaxed block max-w-xs mx-auto md:mx-0 transition-colors"
                  >
                    {settings.atelierAddress || 'Plot No 1, 3rd Street, Tambaram, Urapakkam, Chennai - 603 210'}
                  </a>
                </div>
              </li>

              {/* Phone */}
              <li className="flex flex-col sm:flex-row items-center md:items-start text-center md:text-left gap-2 sm:gap-3">
                <div className="w-8 h-8 rounded-none-full bg-white/10 text-secondary flex items-center justify-center shrink-0 border border-white/10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs text-white/60 block">Phone Support:</span>
                  <a
                    href={`tel:${(settings.supportPhone || '+91 9807738888').replace(/\s+/g, '')}`}
                    className="font-medium text-white hover:text-secondary transition-colors duration-200"
                  >
                    {settings.supportPhone || '+91 9807738888'}
                  </a>
                </div>
              </li>

              {/* Email */}
              <li className="flex flex-col sm:flex-row items-center md:items-start text-center md:text-left gap-2 sm:gap-3">
                <div className="w-8 h-8 rounded-none-full bg-white/10 text-secondary flex items-center justify-center shrink-0 border border-white/10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs text-white/60 block">Email Us:</span>
                  <a
                    href={`mailto:${settings.contactEmail || 'vastraa@gmail.com'}`}
                    className="font-medium text-white hover:text-secondary transition-colors duration-200"
                  >
                    {settings.contactEmail || 'vastraa@gmail.com'}
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Developer Credit */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-light text-white/60"
          style={{ paddingTop: '24px' }}
        >
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} Vastraa &bull; The House of Sarees. All rights reserved.
          </p>

          <div className="flex items-center gap-1.5 text-white/70">
            <span>Developed by</span>
            <a
              href="https://jayamwebsolutions.com/web-design-company-in-chennai.php"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-secondary-light font-medium underline-offset-4 hover:underline transition-colors duration-200"
            >
              Jayam Web Solutions
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
