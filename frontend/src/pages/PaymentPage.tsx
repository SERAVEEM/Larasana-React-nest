import { usePayment } from '../hooks/usePayment';
import QrCodeBox from '../components/Payment/QrCodeBox';
import PaymentAlert from '../components/Payment/PaymentAlert';
import VerifyOverlay from '../components/Payment/VerifyOverlay';
import '../style/Payment.css';

export default function PaymentPage() {
  const {
    orderDetails,
    timeLeft,
    paymentState,
    totalAmount,
    isTransitioning,
    formatPrice,
    formatTime,
    handleBuyNow,
    handleSimulateSuccess,
    handleBack
  } = usePayment();

  return (
    <div className="pay-wrapper">
      {/* Page Header Area */}
      <div className="pay-header-space" />

      <div className="pay-container">

        {/* Back Button */}
        <button
          className="pay-back-button"
          onClick={handleBack}
          disabled={isTransitioning}
          style={{ opacity: isTransitioning ? 0.3 : 1, cursor: isTransitioning ? 'not-allowed' : 'pointer' }}
          aria-label="Go back to Checkout"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Payment Main Card */}
        <div className="pay-main-card" style={{ opacity: paymentState === 'expired' ? 0.6 : 1 }}>

          {/* QRIS BRAND HEADER */}
          <div className="pay-qris-brand">
            <svg className="pay-qris-svg" viewBox="0 0 160 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Clean QRIS wordmark */}
              <text
                x="4"
                y="33"
                fontFamily="'Arial Black', 'Arial', sans-serif"
                fontWeight="900"
                fontSize="30"
                fill="#000"
                letterSpacing="1.5"
              >QRIS</text>
              {/* QUICK badge — right side */}
              <rect x="106" y="9" width="50" height="26" rx="5" fill="#E8222C" />
              <text
                x="131"
                y="27"
                fontFamily="'Arial', sans-serif"
                fontWeight="700"
                fontSize="12"
                fill="#fff"
                textAnchor="middle"
                letterSpacing="0.5"
              >QUICK</text>
            </svg>
          </div>

          {/* QR CODE CONTAINER */}
          <QrCodeBox
            qrImageUrl={orderDetails.payment?.qrImageUrl}
            paymentState={paymentState}
          />

          {/* VIRTUAL ACCOUNT BLOCK */}
          {orderDetails.payment?.vaNumber && (
            <div className="pay-va-info" style={{ marginTop: '1rem', padding: '1rem', background: '#111', border: '1px solid #222', borderRadius: '4px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
              <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Virtual Account Number</div>
              <div style={{ fontSize: '1.4rem', color: '#c4a050', fontWeight: 'bold', letterSpacing: '2px', marginTop: '0.25rem' }}>{orderDetails.payment.vaNumber}</div>
            </div>
          )}

          {orderDetails.payment?.paymentUrl && !orderDetails.payment?.qrImageUrl && (
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <a
                href={paymentState === 'expired' ? undefined : orderDetails.payment.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pay-external-link"
                style={{
                  background: paymentState === 'expired' ? '#444' : '#c4a050',
                  color: paymentState === 'expired' ? '#888' : '#0a0a0a',
                  pointerEvents: paymentState === 'expired' ? 'none' : 'auto',
                  padding: '12px 28px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '0.85rem'
                }}
              >
                Bayar via Midtrans
              </a>
            </div>
          )}

          {/* Timer Row */}
          <div className="pay-timer-row">
            <span className="pay-timer-label">Expires in:</span>
            <span className={`pay-timer-countdown ${timeLeft < 180 ? 'critical' : ''} ${paymentState === 'expired' ? 'expired-text' : ''}`}>
              {paymentState === 'expired' ? '00:00 (Expired)' : formatTime(timeLeft)}
            </span>
          </div>

          {/* Price / Product details */}
          <div className="pay-info-section">
            <h2 className="pay-item-name">{orderDetails.product.name}</h2>
            <p className="pay-item-price">{formatPrice(totalAmount)}</p>
          </div>

          {/* Metadata Block */}
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

          {/* Payment Duration warning alert */}
          <PaymentAlert paymentState={paymentState} />

        </div>

        {/* Action Button */}
        <button
          className="pay-buy-btn"
          onClick={handleBuyNow}
          disabled={paymentState !== 'idle'}
          style={{
            opacity: paymentState !== 'idle' ? 0.5 : 1,
            cursor: paymentState !== 'idle' ? 'not-allowed' : 'pointer'
          }}
        >
          {paymentState === 'expired'
            ? 'Payment Expired'
            : paymentState === 'verifying'
              ? 'Verifying...'
              : paymentState === 'success'
                ? 'Success'
                : 'Check Status'}
        </button>

        {/* Dev Mock Trigger Button */}
        {window.location.hostname === 'localhost' && paymentState === 'idle' && (
          <button
            className="pay-buy-btn pay-mock-btn"
            onClick={handleSimulateSuccess}
            title="Dev only: simulates payment success instantly"
          />
        )}

      </div>

      {/* Verifying Spinner Overlay */}
      <VerifyOverlay paymentState={paymentState} />
    </div>
  );
}
