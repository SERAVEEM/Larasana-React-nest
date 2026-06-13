import type { Weaver } from '../../types/product';

interface DetailCardsProps {
  productName: string;
  qrCode: string;
  weaver: Weaver;
}

export default function DetailCards({
  productName,
  qrCode,
  weaver
}: DetailCardsProps) {
  return (
    <div className="pd-more-details-section">
      <h2 className="pd-section-title">More About {productName}</h2>
      
      <div className="pd-details-cards">
        
        {/* Card 1: Authenticity QR */}
        <div className="pd-detail-card">
          <div className="pd-card-media qr-media">
            <img src={qrCode} alt="Verify Authenticity" className="pd-qr-img" />
          </div>
          <div className="pd-card-content">
            <h3 className="pd-card-title">Verify Authenticity</h3>
            <p className="pd-card-desc">
              Scan the authenticity code to discover the origin, craftsmanship, and story behind the {productName}. Each piece is handcrafted in limited quantities, preserving the soul of Lombok's weaving tradition and the identity of its artisan.
            </p>
          </div>
        </div>

        {/* Card 2: Weaver Info */}
        <div className="pd-detail-card">
          <div className="pd-card-media weaver-media">
            <img src={weaver.image} alt={weaver.name} className="pd-weaver-img" />
          </div>
          <div className="pd-card-content">
            <h3 className="pd-card-title">About The Weaver</h3>
            <p className="pd-card-desc">{weaver.bio}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
