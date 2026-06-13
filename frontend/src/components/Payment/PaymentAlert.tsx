interface PaymentAlertProps {
  paymentState: 'idle' | 'verifying' | 'success' | 'expired';
}

export default function PaymentAlert({ paymentState }: PaymentAlertProps) {
  const isExpired = paymentState === 'expired';

  return (
    <div className="pay-notice-alert">
      <div className="pay-notice-icon">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </div>
      <p className="pay-notice-text">
        {isExpired
          ? 'Time for payment has expired. This order has been cancelled.'
          : 'Please complete payment within 15 minutes, or else your order will be cancelled automatically.'}
      </p>
    </div>
  );
}
