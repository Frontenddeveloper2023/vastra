import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './index.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import ScrollToTop from './components/ScrollToTop'
import MobileBottomNav from './components/MobileBottomNav'
import { CartProvider } from './context/CartContext'
import { ShippingProvider } from './context/ShippingContext'
import { HomeCMSProvider } from './context/HomeCMSContext'

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

// Base URL provided by Vite from single .env (BASE_URL=vasraa)
export const BASE_URL = import.meta.env.BASE_URL

// Customer Storefront Layout (includes user navbar, cart drawer, and footer)
function UserLayout() {
  return (
    <div
      className="min-h-screen bg-[#110907] font-sans overflow-x-hidden flex flex-col justify-between"
      data-base-url={BASE_URL}
    >
      {/* Global Sticky Luxury Navbar */}
      <Navbar />

      {/* Global Cart Drawer Popup */}
      <CartDrawer />

      {/* Main Page View */}
      <main className="w-full flex-1">
        <Outlet />
      </main>

      {/* Global Footer */}
      <div className="pb-16 lg:pb-0 bg-primary">
        <Footer />
      </div>

      {/* Mobile Sticky Luxury Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}

function App() {
  return (
    <HomeCMSProvider>
      <ShippingProvider>
        <CartProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            {/* Automatically scroll to top on any page navigation */}
            <ScrollToTop />

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
                <Route path="/checkout" element={<Checkout />} />
              </Route>

              {/* ─── Admin Studio Routes ─── */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<Navigate to="/admin/products" replace />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="banners" element={<Navigate to="/admin/home-cms" replace />} />
                <Route path="customers" element={<AdminCustomers />} />
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
        </CartProvider>
      </ShippingProvider>
    </HomeCMSProvider>
  )
}

export default App
