import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../style/Payment.css';
import { client } from '../api/client';

interface OrderDetails {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    size: string;
  };
  pricing: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  order: {
    id: number;
    orderCode: string;
    totalAmount: number;
    status: string;
  };
  payment: {
    id: number;
    method: string;
    amount: number;
    status: string;
    paymentUrl: string | null;
    qrImageUrl: string | null;
    vaNumber: string | null;
    expiryTime: string | null;
  };
}

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve state passed from Checkout page
  const orderDetails = (location.state as OrderDetails) || ({
    product: {
      id: '1',
      name: 'Noir Enchanted Vest',
      price: 120.00,
      image: '',
      size: 'XL'
    },
    pricing: {
      subtotal: 120.00,
      shipping: 2.00,
      total: 122.00
    },
    order: {
      id: 1,
      orderCode: 'LRS-20260603-9999',
      totalAmount: 122.00,
      status: 'pending'
    },
    payment: {
      id: 1,
      method: 'qris',
      amount: 122.00,
      status: 'pending',
      paymentUrl: '',
      qrImageUrl: '',
      vaNumber: '',
      expiryTime: new Date(Date.now() + 900000).toISOString()
    }
  } as OrderDetails);

  const formatPrice = (value: number): string => {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalAmount = orderDetails.pricing.total;

  // Countdown timer state: 15 minutes = 900 seconds
  const [timeLeft, setTimeLeft] = useState(900);
  const [isVerifying, setIsVerifying] = useState(false);

  // Set timeLeft dynamically based on real payment expiryTime
  useEffect(() => {
    if (orderDetails.payment?.expiryTime) {
      const expiry = new Date(orderDetails.payment.expiryTime).getTime();
      const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setTimeLeft(diff);
    }
  }, [orderDetails]);

  // Background countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Background payment status polling every 3 seconds
  useEffect(() => {
    if (!orderDetails.order?.id) return;

    const interval = setInterval(() => {
      client.get(`/checkout/payment-status/${orderDetails.order.id}`)
        .then((res) => {
          if (res.data.paymentStatus === 'paid' || res.data.orderStatus === 'processing') {
            clearInterval(interval);
            navigate('/payment-success', {
              state: {
                orderId: orderDetails.order.orderCode,
                amountPaid: totalAmount,
                productName: orderDetails.product.name
              }
            });
          }
        })
        .catch((err) => {
          console.error('Failed to poll payment status:', err);
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [orderDetails, navigate, totalAmount]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Manual payment check trigger
  const handleBuyNow = async () => {
    if (!orderDetails.order?.id) return;
    setIsVerifying(true);

    try {
      const res = await client.get(`/checkout/payment-status/${orderDetails.order.id}`);
      if (res.data.paymentStatus === 'paid' || res.data.orderStatus === 'processing') {
        navigate('/payment-success', {
          state: {
            orderId: orderDetails.order.orderCode,
            amountPaid: totalAmount,
            productName: orderDetails.product.name
          }
        });
      } else {
        alert('Pembayaran belum kami terima. Silakan selesaikan pembayaran Anda di e-wallet atau bank Anda.');
      }
    } catch (err) {
      console.error('Manual check failed:', err);
      alert('Gagal mengecek status pembayaran.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBack = () => {
    navigate('/checkout', { state: { productId: orderDetails.product.id, selectedSize: orderDetails.product.size } });
  };

  return (
    <div className="pay-wrapper">
      {/* Page Header Area */}
      <div className="pay-header-space" />
      
      <div className="pay-container">
        
        {/* Back Button */}
        <button className="pay-back-button" onClick={handleBack} aria-label="Go back to Checkout">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Payment Main Card */}
        <div className="pay-main-card">
          
          {/* QRIS BRAND HEADER */}
          <div className="pay-qris-brand">
            <svg className="pay-qris-svg" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5h15v5H10v20h10v5H5V5zm40 0h15v5H50v8h10v5H50v7h15v5H45V5zm40 0h15v5H90v20h10v5H85V5z" fill="#000" />
              {/* Styled QRIS text boxes */}
              <text x="3" y="27" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="24" fill="#000" letterSpacing="2">QRIS</text>
              <rect x="76" y="8" width="40" height="22" rx="4" fill="#000" />
              <text x="81" y="24" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="11" fill="#fff">QUICK</text>
            </svg>
          </div>

          {/* QR CODE CONTAINER */}
          <div className="pay-qrcode-box" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            {orderDetails.payment?.qrImageUrl ? (
              <img 
                src={orderDetails.payment.qrImageUrl} 
                alt="QRIS Payment Code" 
                style={{ width: '220px', height: '220px', objectFit: 'contain', background: '#fff', padding: '10px', borderRadius: '8px' }} 
              />
            ) : (
              /* Fallback custom SVG QR code for high-definition premium appearance */
              <svg viewBox="0 0 100 100" className="pay-qr-svg" width="200" height="200">
                <rect width="100" height="100" fill="#ffffff" />
                {/* Position Detection Patterns */}
                <rect x="5" y="5" width="21" height="21" fill="#000000" />
                <rect x="8" y="8" width="15" height="15" fill="#ffffff" />
                <rect x="11" y="11" width="9" height="9" fill="#000000" />
                <rect x="74" y="5" width="21" height="21" fill="#000000" />
                <rect x="77" y="8" width="15" height="15" fill="#ffffff" />
                <rect x="80" y="11" width="9" height="9" fill="#000000" />
                <rect x="5" y="74" width="21" height="21" fill="#000000" />
                <rect x="8" y="77" width="15" height="15" fill="#ffffff" />
                <rect x="11" y="80" width="9" height="9" fill="#000000" />
                <rect x="78" y="78" width="9" height="9" fill="#000000" />
                <rect x="80" y="80" width="5" height="5" fill="#ffffff" />
                <rect x="82" y="82" width="1" height="1" fill="#000000" />
                <rect x="29" y="15" width="42" height="1" fill="#000000" />
                <rect x="15" y="29" width="1" height="42" fill="#000000" />
                <rect x="32" y="20" width="6" height="6" fill="#000" />
                <rect x="40" y="22" width="8" height="4" fill="#000" />
                <rect x="52" y="20" width="4" height="8" fill="#000" />
                <rect x="62" y="22" width="6" height="6" fill="#000" />
                <rect x="32" y="32" width="4" height="10" fill="#000" />
                <rect x="38" y="35" width="8" height="4" fill="#000" />
                <rect x="48" y="30" width="6" height="6" fill="#000" />
                <rect x="56" y="34" width="8" height="8" fill="#000" />
                <rect x="68" y="32" width="4" height="4" fill="#000" />
                <rect x="32" y="46" width="12" height="4" fill="#000" />
                <rect x="48" y="44" width="4" height="8" fill="#000" />
                <rect x="56" y="48" width="12" height="6" fill="#000" />
                <rect x="32" y="56" width="6" height="6" fill="#000" />
                <rect x="42" y="54" width="8" height="8" fill="#000" />
                <rect x="54" y="58" width="6" height="4" fill="#000" />
                <rect x="64" y="56" width="8" height="4" fill="#000" />
                <rect x="32" y="66" width="4" height="4" fill="#000" />
                <rect x="40" y="68" width="6" height="6" fill="#000" />
                <rect x="50" y="66" width="10" height="4" fill="#000" />
                <rect x="62" y="68" width="4" height="6" fill="#000" />
                <rect x="48" y="74" width="8" height="8" fill="#000" />
                <rect x="60" y="76" width="4" height="12" fill="#000" />
                <rect x="68" y="74" width="6" height="4" fill="#000" />
              </svg>
            )}
          </div>

          {/* VIRTUAL ACCOUNT BLOCK */}
          {orderDetails.payment?.vaNumber && (
            <div className="pay-va-info" style={{ marginTop: '1rem', padding: '1rem', background: '#111', border: '1px solid #222', borderRadius: '4px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
              <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Virtual Account Number</div>
              <div style={{ fontSize: '1.4rem', color: '#c4a050', fontWeight: 'bold', letterSpacing: '2px', marginTop: '0.25rem' }}>{orderDetails.payment.vaNumber}</div>
            </div>
          )}

          {/* EXTERNAL PAYMENT URL LINK FOR CREDIT CARD / OTHER METHODS */}
          {orderDetails.payment?.paymentUrl && !orderDetails.payment?.qrImageUrl && (
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <a 
                href={orderDetails.payment.paymentUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="pay-external-link" 
                style={{ background: '#c4a050', color: '#0a0a0a', padding: '12px 28px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}
              >
                Bayar via Midtrans
              </a>
            </div>
          )}

          {/* TIMER OVERLAY (Expires in X) */}
          <div className="pay-timer-row">
            <span className="pay-timer-label">Expires in:</span>
            <span className={`pay-timer-countdown ${timeLeft < 180 ? 'critical' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* PRODUCT & PRICE INFO */}
          <div className="pay-info-section">
            <h2 className="pay-item-name">{orderDetails.product.name}</h2>
            <p className="pay-item-price">{formatPrice(totalAmount)}</p>
          </div>

          {/* DYNAMIC BACKEND INTEGRATION DETAILS */}
          <div className="pay-integration-meta">
            <div className="pay-meta-row">
              <span>Order Code:</span>
              <span style={{ color: '#fff', fontWeight: '500' }}>{orderDetails.order?.orderCode}</span>
            </div>
            <div className="pay-meta-row">
              <span>Payment Type:</span>
              <span style={{ textTransform: 'uppercase' }}>{orderDetails.payment?.method || 'qris'}</span>
            </div>
          </div>

          {/* NOTICE ALERT */}
          <div className="pay-notice-alert">
            <div className="pay-notice-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <p className="pay-notice-text">
              Please complete payment within 15 minutes, or else your order will be cancelled automatically.
            </p>
          </div>

        </div>

        {/* BOTTOM BUY NOW / CONFIRM BUTTON */}
        <button className="pay-buy-btn" onClick={handleBuyNow} disabled={timeLeft <= 0}>
          {timeLeft <= 0 ? 'Payment Expired' : 'Check Status'}
        </button>

      </div>

      {/* FULL SCREEN LOADING OVERLAY */}
      {isVerifying && (
        <div className="pay-verify-overlay">
          <div className="pay-verify-card">
            <div className="pay-spinner">
              <div className="pay-spinner-inner" />
            </div>
            <h3 className="pay-verify-title">Verifying Payment</h3>
            <p className="pay-verify-desc">
              Checking transaction status with Midtrans gateway. Please wait...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
