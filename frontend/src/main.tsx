import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import 'lenis/dist/lenis.css'
import './style/index.css'
import LandingPages from './pages/LandingPages.tsx'
import StoryTelling from './pages/StoryTelling.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import HeroShowcasePage from './pages/HeroShowcasePage.tsx'
import ImpactPages from "./pages/ImpactPages.tsx"
import Story from './pages/Story.tsx'
import AboutUs from './pages/AboutUs.tsx'
import Navbar from './components/navbar.tsx'
import SmoothScroll from './components/SmoothScroll.tsx'
import ProductDetailPage from './pages/ProductDetailPage.tsx'
import CheckoutPage from './pages/CheckoutPage.tsx'
import PaymentPage from './pages/PaymentPage.tsx'
import FinishPaymentPage from './pages/FinishPaymentPage.tsx'

// Admin Views
import AdminLayout from './components/AdminLayout.tsx'
import AdminDashboard from './pages/admin/AdminDashboard.tsx'
import AdminProducts from './pages/admin/AdminProducts.tsx'
import AdminAddProduct from './pages/admin/AdminAddProduct.tsx'
import AdminEditProduct from './pages/admin/AdminEditProduct.tsx'
import AdminOrders from './pages/admin/AdminOrders.tsx'
import AdminOrderDetails from './pages/admin/AdminOrderDetails.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SmoothScroll>
        <Routes>
          <Route path="/" element={<><Navbar /><LandingPages /><StoryTelling /><HeroShowcasePage /></>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/Impact" element={<><Navbar/><ImpactPages /></>} />
          <Route path="/Story" element={<><Navbar /><Story /></>} />
          <Route path="/aboutus" element={<><Navbar/><AboutUs /></>} />
          <Route path="/product/:id" element={<><Navbar /><ProductDetailPage /></>} />
          <Route path="/checkout" element={<><Navbar /><CheckoutPage /></>} />
          <Route path="/payment" element={<><Navbar /><PaymentPage /></>} />
          <Route path="/payment-success" element={<><Navbar /><FinishPaymentPage /></>} />
          
          {/* Admin Dashboards & Management Catalog */}
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
          <Route path="/admin/products/new" element={<AdminLayout><AdminAddProduct /></AdminLayout>} />
          <Route path="/admin/products/edit/:id" element={<AdminLayout><AdminEditProduct /></AdminLayout>} />
          <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
          <Route path="/admin/orders/:id" element={<AdminLayout><AdminOrderDetails /></AdminLayout>} />
        </Routes>
      </SmoothScroll>
    </BrowserRouter>
  </StrictMode>
)