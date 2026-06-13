interface QrCodeBoxProps {
  qrImageUrl: string | null;
  paymentState: 'idle' | 'verifying' | 'success' | 'expired';
}

export default function QrCodeBox({ qrImageUrl, paymentState }: QrCodeBoxProps) {
  const isExpired = paymentState === 'expired';

  return (
    <div className="pay-qrcode-box" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
      {qrImageUrl ? (
        <img
          src={qrImageUrl}
          alt="QRIS Payment Code"
          style={{
            width: '220px',
            height: '220px',
            objectFit: 'contain',
            background: '#fff',
            padding: '10px',
            borderRadius: '8px',
            filter: isExpired ? 'grayscale(1) contrast(0.5)' : 'none'
          }}
        />
      ) : (
        /* Fallback custom SVG QR code for high-definition premium appearance */
        <svg
          viewBox="0 0 100 100"
          className="pay-qr-svg"
          width="200"
          height="200"
          style={{ filter: isExpired ? 'grayscale(1) contrast(0.5)' : 'none' }}
        >
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
  );
}
