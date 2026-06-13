import { StrictMode, useState, lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'lenis/dist/lenis.css';
import './style/index.css';

// Home page components (keep static so landing page loads instantly)
import LandingPages from './pages/LandingPages.tsx';
import StoryTelling from './pages/StoryTelling.tsx';
import HeroShowcasePage from './pages/HeroShowcasePage.tsx';
import Navbar from './components/navbar.tsx';
import Footer from './components/Footer.tsx';
import SmoothScroll from './components/SmoothScroll.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import AdminLayout from './components/AdminLayout.tsx';

// Lazy loaded page components
const LoginPage = lazy(() => import('./pages/LoginPage.tsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.tsx'));
const ImpactPages = lazy(() => import('./pages/ImpactPages.tsx'));
const Story = lazy(() => import('./pages/Story.tsx'));
const AboutUs = lazy(() => import('./pages/AboutUs.tsx'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage.tsx'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.tsx'));
const PaymentPage = lazy(() => import('./pages/PaymentPage.tsx'));
const FinishPaymentPage = lazy(() => import('./pages/FinishPaymentPage.tsx'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage.tsx'));

// Lazy loaded admin components
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.tsx'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.tsx'));
const AdminAddProduct = lazy(() => import('./pages/admin/AdminAddProduct.tsx'));
const AdminEditProduct = lazy(() => import('./pages/admin/AdminEditProduct.tsx'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.tsx'));
const AdminOrderDetails = lazy(() => import('./pages/admin/AdminOrderDetails.tsx'));

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
          <Suspense fallback={null}>
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
          </Suspense>
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
);


