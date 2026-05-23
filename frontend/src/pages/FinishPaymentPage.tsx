import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../style/FinishPayment.css';

interface PaymentSuccessDetails {
  orderId: string;
  amountPaid: number;
  productName: string;
}

export default function FinishPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve state passed from Payment page
  const successDetails = location.state as PaymentSuccessDetails || {
    orderId: '#BTR-89231',
    amountPaid: 415.00,
    productName: 'Noir Enchanted Vest'
  };

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [redirectCount, setRedirectCount] = useState(5);

  // Auto-redirect effect when status modal is open
  useEffect(() => {
    if (!showStatusModal) return;
    if (redirectCount <= 0) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setRedirectCount(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showStatusModal, redirectCount, navigate]);

  const handleMyOrders = () => {
    setShowStatusModal(true);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="fp-wrapper">
      {/* Page Header Area */}
      <div className="fp-header-space" />

      <div className="fp-container">
        
        {/* Back Button (pointing to home) */}
        <button className="fp-back-button" onClick={handleBackToHome} aria-label="Go back to Home">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Success Main Card */}
        <div className="fp-main-card">
          
          {/* ANIMATED SHIELD CHECKMARK SVG */}
          <div className="fp-shield-container">
            <svg viewBox="0 0 100 100" className="fp-shield-svg">
              {/* Gold Shield Outline */}
              <path 
                className="fp-shield-path"
                d="M50 12 L82 22 C82 55, 66 75, 50 88 C34 75, 18 55, 18 22 Z" 
                fill="none" 
                stroke="#C2A353" 
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Checkmark inside */}
              <polyline 
                className="fp-checkmark-path"
                points="36,49 46,59 64,39" 
                fill="none" 
                stroke="#C2A353" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* SUCCESS MESSAGE */}
          <h1 className="fp-title">Payment Successful</h1>
          <p className="fp-subtitle">
            Thank you for your purchase. Your order ID is<br />
            <strong className="fp-order-id">{successDetails.orderId}</strong>
          </p>

          <div className="fp-divider" />

          {/* PAID AMOUNT */}
          <div className="fp-price-row">
            <span className="fp-price-val">${successDetails.amountPaid.toFixed(2)}</span>
          </div>

          <div className="fp-divider" />

          {/* NOTICE ALERT */}
          <div className="fp-notice-alert">
            <div className="fp-notice-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <p className="fp-notice-text">
              Your order has been successfully paid. Please check your order details in the "Orders" menu.
            </p>
          </div>

        </div>

        {/* BOTTOM MY ORDERS BUTTON */}
        <button className="fp-orders-btn" onClick={handleMyOrders}>
          My Orders
        </button>

      </div>

      {/* INTERACTIVE MY ORDERS STATUS MODAL (OPTION A) */}
      {showStatusModal && (
        <div className="fp-modal-overlay" onClick={() => navigate('/')}>
          <div className="fp-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fp-modal-header">
              <h3 className="fp-modal-title">Live Order Status</h3>
              <button className="fp-modal-close" onClick={() => navigate('/')} aria-label="Close modal">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div className="fp-modal-body">
              <div className="fp-status-row">
                <span className="fp-pulse-dot" />
                <span className="fp-status-text">Processing (Preparing package)</span>
              </div>

              <div className="fp-order-meta-box">
                <div className="fp-meta-item">
                  <span>Order ID:</span>
                  <span>{successDetails.orderId}</span>
                </div>
                <div className="fp-meta-item">
                  <span>Item:</span>
                  <span>{successDetails.productName}</span>
                </div>
                <div className="fp-meta-item">
                  <span>Amount Paid:</span>
                  <span>${successDetails.amountPaid.toFixed(2)}</span>
                </div>
              </div>

              <p className="fp-modal-notice">
                We've sent a transaction receipt and real-time updates to your email.
              </p>
              
              <div className="fp-redirect-timer">
                Redirecting to Homepage in <strong className="fp-countdown-text">{redirectCount}s</strong>...
              </div>

              <button className="fp-home-redirect-btn" onClick={() => navigate('/')}>
                Return Home Immediately
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
