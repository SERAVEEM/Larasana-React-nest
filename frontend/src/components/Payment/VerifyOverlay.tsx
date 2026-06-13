interface VerifyOverlayProps {
  paymentState: 'idle' | 'verifying' | 'success' | 'expired';
}

export default function VerifyOverlay({ paymentState }: VerifyOverlayProps) {
  if (paymentState !== 'verifying') return null;

  return (
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
  );
}
