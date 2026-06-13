import type { PaymentMethod } from '../../types/checkout';

interface PaymentSectionProps {
  selectedPayment: PaymentMethod;
  paymentMethods: PaymentMethod[];
  selectedPaymentId: string;
  setSelectedPaymentId: (id: string) => void;
  activeModal: 'address' | 'shipping' | 'payment' | null;
  handleOpenModal: (modalType: 'address' | 'shipping' | 'payment') => void;
  handleCloseModal: () => void;
}

export default function PaymentSection({
  selectedPayment,
  paymentMethods,
  selectedPaymentId,
  setSelectedPaymentId,
  activeModal,
  handleOpenModal,
  handleCloseModal
}: PaymentSectionProps) {
  return (
    <div className="co-card-section">
      <h2 className="co-section-title">Payment Method</h2>
      <button 
        className="co-select-card" 
        onClick={() => handleOpenModal('payment')}
        aria-label="Edit payment method"
      >
        <div className="co-card-info-row">
          <div className="co-payment-badge-wrapper">
            <span className="co-payment-logo-icon">{selectedPayment.logoText}</span>
            <div className="co-payment-details">
              <p className="co-payment-name">{selectedPayment.name}</p>
              <p className="co-payment-desc">{selectedPayment.description}</p>
            </div>
          </div>
        </div>
        <div className="co-card-edit-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>
      </button>

      {activeModal === 'payment' && (
        <div className="co-modal-overlay" onClick={handleCloseModal}>
          <div 
            className="co-modal-content" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="co-modal-header">
              <h3 className="co-modal-title">Choose Payment Method</h3>
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
                {paymentMethods.map((pay) => (
                  <button
                    key={pay.id}
                    className={`co-modal-option-card align-center ${selectedPaymentId === pay.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedPaymentId(pay.id);
                      handleCloseModal();
                    }}
                  >
                    <div className="co-option-radio">
                      <span className="co-radio-dot" />
                    </div>
                    <div className="co-option-info">
                      <div className="co-payment-option-block">
                        <span className="co-payment-logo-icon">{pay.logoText}</span>
                        <div className="co-payment-desc-block">
                          <span className="co-payment-name-bold">{pay.name}</span>
                          <span className="co-payment-desc-text">{pay.description}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
