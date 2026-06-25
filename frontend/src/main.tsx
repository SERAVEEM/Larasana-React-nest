import { StrictMode, useState, lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'lenis/dist/lenis.css';
import './style/index.css';

// Home page components needed for first paint
import LandingPages from './pages/LandingPages.tsx';
import Navbar from './components/navbar.tsx';
import SmoothScroll from './components/SmoothScroll.tsx';
import SplashScreen from './components/SplashScreen.tsx';

// Below-the-fold and secondary-route components (lazy loaded)
const StoryTelling = lazy(() => import('./pages/StoryTelling.tsx'));
const HeroShowcasePage = lazy(() => import('./pages/HeroShowcasePage.tsx'));
const Footer = lazy(() => import('./components/Footer.tsx'));
const AdminLayout = lazy(() => import('./components/AdminLayout.tsx'));
import AdminRoute from './components/AdminRoute.tsx';

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
    try {
      // Skip splash screen if already shown in the current browser session
      return !sessionStorage.getItem('larasana_splash_shown');
    } catch {
      return true;
    }
  });

  const handleSplashComplete = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem('larasana_splash_shown', 'true');
    } catch {
      // Ignore
    }
    // Notify other components that the splash screen has completed
    window.dispatchEvent(new CustomEvent('splash-completed'));
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
              <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
              <Route path="/admin/products/new" element={<AdminRoute><AdminLayout><AdminAddProduct /></AdminLayout></AdminRoute>} />
              <Route path="/admin/products/edit/:id" element={<AdminRoute><AdminLayout><AdminEditProduct /></AdminLayout></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
              <Route path="/admin/orders/:id" element={<AdminRoute><AdminLayout><AdminOrderDetails /></AdminLayout></AdminRoute>} />
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


