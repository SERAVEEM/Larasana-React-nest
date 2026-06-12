import { StrictMode, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
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
import Footer from './components/Footer.tsx'
import SmoothScroll from './components/SmoothScroll.tsx'
import ProductDetailPage from './pages/ProductDetailPage.tsx'
import CheckoutPage from './pages/CheckoutPage.tsx'
import PaymentPage from './pages/PaymentPage.tsx'
import FinishPaymentPage from './pages/FinishPaymentPage.tsx'
import MyOrdersPage from './pages/MyOrdersPage.tsx'


import AdminLayout from './components/AdminLayout.tsx'
import AdminDashboard from './pages/admin/AdminDashboard.tsx'
import AdminProducts from './pages/admin/AdminProducts.tsx'
import AdminAddProduct from './pages/admin/AdminAddProduct.tsx'
import AdminEditProduct from './pages/admin/AdminEditProduct.tsx'
import AdminOrders from './pages/admin/AdminOrders.tsx'
import AdminOrderDetails from './pages/admin/AdminOrderDetails.tsx'
import SplashScreen from './components/SplashScreen.tsx'


function RootApp() {
  const [showSplash, setShowSplash] = useState(() => {
    return sessionStorage.getItem('larasana_splash_shown') !== 'true';
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('larasana_splash_shown', 'true');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <BrowserRouter>
        <SmoothScroll>
          <Routes>
            <Route path="/" element={<><Navbar /><LandingPages /><StoryTelling /><HeroShowcasePage /><Footer /></>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/Impact" element={<><Navbar/><ImpactPages /><Footer /></>} />
            <Route path="/Story" element={<><Navbar /><Story /><Footer /></>} />
            <Route path="/aboutus" element={<><Navbar/><AboutUs /><Footer /></>} />
            <Route path="/product/:id" element={<><Navbar /><ProductDetailPage /><Footer /></>} />
            <Route path="/checkout" element={<><Navbar /><CheckoutPage /><Footer /></>} />
            <Route path="/payment" element={<><Navbar /><PaymentPage /><Footer /></>} />
            <Route path="/payment-success" element={<><Navbar /><FinishPaymentPage /><Footer /></>} />
            <Route path="/my-orders" element={<><Navbar /><MyOrdersPage /><Footer /></>} />
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
            <Route path="/admin/products/new" element={<AdminLayout><AdminAddProduct /></AdminLayout>} />
            <Route path="/admin/products/edit/:id" element={<AdminLayout><AdminEditProduct /></AdminLayout>} />
            <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
            <Route path="/admin/orders/:id" element={<AdminLayout><AdminOrderDetails /></AdminLayout>} />
          </Routes>
        </SmoothScroll>
      </BrowserRouter>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <RootApp />
    </HelmetProvider>
  </StrictMode>
)

