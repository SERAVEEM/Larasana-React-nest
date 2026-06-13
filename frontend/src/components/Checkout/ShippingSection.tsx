import type { ShippingOption } from '../../types/checkout';

interface ShippingSectionProps {
  shippingLoading: boolean;
  shippingError: boolean;
  shippingOptions: ShippingOption[];
  selectedShippingId: string;
  setSelectedShippingId: (id: string) => void;
  selectedShipping: ShippingOption | { id: string; name: string; price: number; eta: string; logo: string };
  formatPrice: (value: number) => string;
  activeModal: 'address' | 'shipping' | 'payment' | null;
  handleOpenModal: (modalType: 'address' | 'shipping' | 'payment') => void;
  handleCloseModal: () => void;
  fetchShipping: (addressId: string) => void;
  selectedAddressId: string;
}

export default function ShippingSection({
  shippingLoading,
  shippingError,
  shippingOptions,
  selectedShippingId,
  setSelectedShippingId,
  selectedShipping,
  formatPrice,
  activeModal,
  handleOpenModal,
  handleCloseModal,
  fetchShipping,
  selectedAddressId
}: ShippingSectionProps) {
  return (
    <div className="co-card-section">
      <h2 className="co-section-title">Shipping</h2>
      {shippingLoading ? (
        <div className="co-shipping-skeleton">
          <div className="co-skeleton-logo" />
          <div className="co-skeleton-lines">
            <div className="co-skeleton-line co-skeleton-line--wide" />
            <div className="co-skeleton-line co-skeleton-line--narrow" />
          </div>
        </div>
      ) : shippingError ? (
        <div className="co-shipping-error-card">
          <span>Failed to load shipping rates.</span>
          <button className="co-shipping-retry-btn" onClick={() => fetchShipping(selectedAddressId)}>
            Retry
          </button>
        </div>
      ) : (
        <button
          className="co-select-card"
          onClick={() => handleOpenModal('shipping')}
          aria-label="Edit shipping carrier"
        >
          <div className="co-card-info-row">
            <div className="co-carrier-badge-wrapper">
              <span className={`co-carrier-logo ${selectedShipping.logo.toLowerCase()}`}>
                {selectedShipping.logo}
              </span>
              <div className="co-carrier-details">
                <p className="co-carrier-name">{selectedShipping.name}</p>
                <p className="co-carrier-eta">{selectedShipping.eta}</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontWeight: 700, color: '#C2A353', fontSize: '0.95rem' }}>
              {formatPrice(selectedShipping.price)}
            </span>
            <div className="co-card-edit-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
          </div>
        </button>
      )}

      {activeModal === 'shipping' && (
        <div className="co-modal-overlay" onClick={handleCloseModal}>
          <div 
            className="co-modal-content" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="co-modal-header">
              <h3 className="co-modal-title">Choose Shipping Method</h3>
              <button className="co-modal-close" onClick={handleCloseModal} aria-label="Close modal">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="co-modal-body">
              <div className="co-modal-options-list">
                {shippingLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="co-shipping-skeleton co-shipping-skeleton--modal">
                      <div className="co-skeleton-logo" />
                      <div className="co-skeleton-lines">
                        <div className="co-skeleton-line co-skeleton-line--wide" />
                        <div className="co-skeleton-line co-skeleton-line--narrow" />
                      </div>
                    </div>
                  ))
                ) : shippingOptions.length === 0 ? (
                  <div className="co-shipping-error-card">
                    <span>No shipping options available for this address.</span>
                    <button className="co-shipping-retry-btn" onClick={() => fetchShipping(selectedAddressId)}>Retry</button>
                  </div>
                ) : (
                  shippingOptions.map((ship) => (
                    <button
                      key={ship.id}
                      className={`co-modal-option-card align-center ${selectedShippingId === ship.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedShippingId(ship.id);
                        handleCloseModal();
                      }}
                    >
                      <div className="co-option-radio">
                        <span className="co-radio-dot" />
                      </div>
                      <div className="co-option-info flex-row justify-between">
                        <div className="co-option-carrier">
                          <span className={`co-carrier-logo ${ship.logo.toLowerCase()}`}>
                            {ship.logo}
                          </span>
                          <div className="co-carrier-desc-block">
                            <span className="co-carrier-name-bold">{ship.name}</span>
                            <span className="co-carrier-eta-text">
                              🕐 {ship.eta}{Number(ship.id) >= 300 ? ' · Live Rate' : ''}
                            </span>
                          </div>
                        </div>
                        <span className="co-option-price">{formatPrice(ship.price)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
