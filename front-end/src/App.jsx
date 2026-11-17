import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import './index.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import CustomerAuthModal from './components/CustomerAuthModal'
import ScrollToTop from './components/ScrollToTop'
import MobileBottomNav from './components/MobileBottomNav'
import GlobalNetworkBanner from './components/GlobalNetworkBanner'
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton'
import { CartProvider } from './context/CartContext'
import { ShippingProvider } from './context/ShippingContext'
import { HomeCMSProvider } from './context/HomeCMSContext'
import { SettingsProvider } from './context/SettingsContext'
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import { ConfirmModalProvider } from './context/ConfirmModalContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: false,
    },
  },
})

// Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1047123456789-vastraagoogleclient.apps.googleusercontent.com'

// User Pages
import Home from './pages/user/home'
import Profile from './pages/user/profile'
import Orders from './pages/user/orders'
import OrderDetails from './pages/user/orderDetails'
import Addresses from './pages/user/addresses'
import Collections from './pages/user/collections'
import ProductDetails from './pages/user/productDetails'
import Contact from './pages/user/contact'
import About from './pages/user/about'
import Checkout from './pages/user/checkout'
import Login from './pages/user/login'
import ShippingReturns from './pages/user/shippingReturns'
import TermsConditions from './pages/user/termsConditions'
import PrivacyPolicy from './pages/user/privacyPolicy'

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCategories from './pages/admin/AdminCategories'
import AdminBanners from './pages/admin/AdminBanners'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminSettings from './pages/admin/AdminSettings'
import AdminLogin from './pages/admin/AdminLogin'
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminReports from './pages/admin/AdminReports'
import AdminHomeCMS from './pages/admin/AdminHomeCMS'
import AdminReturns from './pages/admin/AdminReturns'

// Base URL provided by Vite from single .env (BASE_URL=vasraa)
export const BASE_URL = import.meta.env.BASE_URL

// Protected Route Component for Admin Studio
function AdminProtectedRoute() {
  const { isAuthenticated, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#6D021B] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-serif text-stone-600 tracking-wider uppercase">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated user directly to /admin/login while preserving intended location
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <AdminLayout />
}

// Customer Storefront Layout (includes user navbar, cart drawer, and footer)
function UserLayout() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <div
      className="min-h-screen bg-[#110907] font-sans flex flex-col justify-between"
      data-base-url={BASE_URL}
    >
      {/* Global Sticky Luxury Navbar (Hidden on Login page for clean distraction-free UI) */}
      {!isLoginPage && <Navbar />}

      {/* Global Cart Drawer Popup */}
      <CartDrawer />

      {/* Global Customer Auth Modal (Google & Email OTP) */}
      <CustomerAuthModal />

      {/* Global Offline Network Banner (Amazon / Flipkart Style) */}
      <GlobalNetworkBanner />

      {/* Main Page View */}
      <main className="w-full flex-1">
        <Outlet />
      </main>

      {/* Global Footer (Hidden on Login page) */}
      {!isLoginPage && (
        <div className="pb-16 lg:pb-0 bg-primary">
          <Footer />
        </div>
      )}

      {/* Mobile Sticky Luxury Bottom Navigation (Hidden on Login page) */}
      {!isLoginPage && <MobileBottomNav />}

      {/* WhatsApp Floating Chat Widget */}
      {!isLoginPage && <WhatsAppFloatingButton />}
    </div>
  )
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <CustomerAuthProvider>
            <AdminAuthProvider>
              <HomeCMSProvider>
                <ShippingProvider>
                  <CartProvider>
                    <ConfirmModalProvider>
                  <BrowserRouter basename={import.meta.env.BASE_URL}>
                  {/* Automatically scroll to top on any page navigation */}
                  <ScrollToTop />

                  {/* Global Luxury Toast Notifications */}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#FAF7F2',
                        color: '#1F1713',
                        border: '1px solid #EDE4D8',
                        borderRadius: '0px',
                        fontSize: '13px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      },
                      success: {
                        iconTheme: {
                          primary: '#059669',
                          secondary: '#ffffff',
                        },
                      },
                      error: {
                        iconTheme: {
                          primary: '#DC2626',
                          secondary: '#ffffff',
                        },
                      },
                    }}
                  />

                  <Routes>
                    {/* ─── Customer Storefront Routes ─── */}
                    <Route element={<UserLayout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/collections" element={<Collections />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/collections/:id" element={<ProductDetails />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:id" element={<OrderDetails />} />
                      <Route path="/addresses" element={<Addresses />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/shipping-returns" element={<ShippingReturns />} />
                      <Route path="/terms" element={<TermsConditions />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/login" element={<Login />} />

           

                    </Route>

                    {/* ─── Admin Studio Routes (Protected) ─── */}
                    <Route path="/admin" element={<AdminProtectedRoute />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="categories" element={<Navigate to="/admin/products" replace />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="banners" element={<Navigate to="/admin/home-cms" replace />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="returns" element={<AdminReturns />} />
                      <Route path="home-cms" element={<AdminHomeCMS />} />
                      <Route path="notifications" element={<AdminNotifications />} />
                      <Route path="reports" element={<AdminReports />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>

                    {/* Admin OTP Login */}
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Fallback to Home for unmatched paths */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </BrowserRouter>
              </ConfirmModalProvider>
            </CartProvider>
            </ShippingProvider>
          </HomeCMSProvider>
        </AdminAuthProvider>
        </CustomerAuthProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}

export default App
