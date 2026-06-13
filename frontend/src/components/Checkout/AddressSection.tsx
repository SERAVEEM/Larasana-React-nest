import React from 'react';
import type { Address } from '../../types/checkout';

interface AddressSectionProps {
  selectedAddress: Address | { id: string; label: string; name: string; street: string; district: string; city: string; province: string; postalCode: string; country: string; phone: string };
  addresses: Address[];
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  activeModal: 'address' | 'shipping' | 'payment' | null;
  handleOpenModal: (modalType: 'address' | 'shipping' | 'payment') => void;
  handleCloseModal: () => void;
  showAddAddressForm: boolean;
  setShowAddAddressForm: (show: boolean) => void;
  newAddress: Omit<Address, 'id'>;
  setNewAddress: React.Dispatch<React.SetStateAction<Omit<Address, 'id'>>>;
  citySearchQuery: string;
  setCitySearchQuery: (query: string) => void;
  showCityDropdown: boolean;
  setShowCityDropdown: (show: boolean) => void;
  filteredCities: any[];
  checkoutState: string;
  handleAddAddress: (e: React.FormEvent) => void;
}

export default function AddressSection({
  selectedAddress,
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  activeModal,
  handleOpenModal,
  handleCloseModal,
  showAddAddressForm,
  setShowAddAddressForm,
  newAddress,
  setNewAddress,
  citySearchQuery,
  setCitySearchQuery,
  showCityDropdown,
  setShowCityDropdown,
  filteredCities,
  checkoutState,
  handleAddAddress
}: AddressSectionProps) {
  return (
    <div className="co-card-section">
      <h2 className="co-section-title">Address</h2>
      <button 
        className="co-select-card" 
        onClick={() => handleOpenModal('address')}
        aria-label="Edit address"
      >
        <div className="co-card-info">
          <div className="co-card-label-badge">{selectedAddress.label}</div>
          <p className="co-card-text">
            <strong>{selectedAddress.name}</strong>, {selectedAddress.street}, {selectedAddress.district}, {selectedAddress.city}, {selectedAddress.province}, {selectedAddress.country} {selectedAddress.postalCode}
          </p>
        </div>
        <div className="co-card-edit-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>
      </button>

      {activeModal === 'address' && (
        <div className="co-modal-overlay" onClick={handleCloseModal}>
          <div 
            className="co-modal-content" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="co-modal-header">
              <h3 className="co-modal-title">Select Shipping Address</h3>
              <button className="co-modal-close" onClick={handleCloseModal} aria-label="Close modal">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="co-modal-body">
              <div className="co-modal-address-list">
                {!showAddAddressForm ? (
                  <>
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        className={`co-modal-option-card ${selectedAddressId === addr.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          handleCloseModal();
                        }}
                      >
                        <div className="co-option-radio">
                          <span className="co-radio-dot" />
                        </div>
                        <div className="co-option-info">
                          <span className="co-option-badge">{addr.label}</span>
                          <p className="co-option-address-text">
                            <strong>{addr.name}</strong><br />
                            {addr.street}, {addr.district}<br />
                            {addr.city}, {addr.province}, {addr.country} {addr.postalCode}
                          </p>
                        </div>
                      </button>
                    ))}
                    <button 
                      className="co-add-address-btn"
                      onClick={() => setShowAddAddressForm(true)}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add New Address
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleAddAddress} className="co-address-form">
                    <div className="co-form-group">
                      <label>Label (e.g. Home, Office)</label>
                      <input 
                        type="text" 
                        required 
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        placeholder="e.g. Vacation House"
                      />
                    </div>
                    <div className="co-form-group">
                      <label>Recipient Name</label>
                      <input 
                        type="text" 
                        required 
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="co-form-group">
                      <label>Recipient Phone Number</label>
                      <input 
                        type="text" 
                        required 
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        placeholder="e.g. 08123456789"
                      />
                    </div>
                    <div className="co-form-group">
                      <label>Street Address</label>
                      <input 
                        type="text" 
                        required 
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        placeholder="Street name, building/apartment number"
                      />
                    </div>
                    <div className="co-form-group">
                      <label>Country</label>
                      <select 
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value, city: '', province: '', postalCode: '' })}
                        style={{
                          width: '100%',
                          padding: '0.8rem 1rem',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          backgroundColor: '#fff',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.95rem',
                          color: '#333',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          cursor: 'pointer',
                          marginBottom: '1rem'
                        }}
                      >
                        <option value="ID">Indonesia</option>
                        <option value="US">United States</option>
                        <option value="SG">Singapore</option>
                        <option value="MY">Malaysia</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>

                    {newAddress.country === 'ID' ? (
                      <>
                        <div className="co-form-grid">
                          <div className="co-form-group co-city-dropdown-container">
                            <label>City / Kabupaten</label>
                            <input 
                              type="text" 
                              required 
                              value={citySearchQuery}
                              onChange={(e) => {
                                setCitySearchQuery(e.target.value);
                                setShowCityDropdown(true);
                              }}
                              onFocus={() => setShowCityDropdown(true)}
                              onBlur={() => {
                                setTimeout(() => setShowCityDropdown(false), 200);
                              }}
                              placeholder="Type to search city..."
                            />
                            {showCityDropdown && (
                              <ul className="co-city-dropdown-list">
                                {filteredCities.length > 0 ? (
                                  filteredCities.slice(0, 15).map(c => (
                                    <li 
                                      key={c.city_id} 
                                      onMouseDown={() => {
                                        setNewAddress({
                                          ...newAddress,
                                          city: `${c.type} ${c.city_name}`,
                                          province: c.province,
                                          postalCode: c.postal_code
                                        });
                                        setCitySearchQuery(`${c.type} ${c.city_name}`);
                                        setShowCityDropdown(false);
                                      }}
                                    >
                                      {c.type} {c.city_name}, {c.province}
                                    </li>
                                  ))
                                ) : (
                                  <li style={{ cursor: 'default', color: '#999' }}>No cities found</li>
                                )}
                              </ul>
                            )}
                          </div>
                          <div className="co-form-group">
                            <label>District (Kecamatan)</label>
                            <input 
                              type="text" 
                              required 
                              value={newAddress.district}
                              onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                              placeholder="District"
                            />
                          </div>
                        </div>
                        <div className="co-form-grid">
                          <div className="co-form-group">
                            <label>Province</label>
                            <input 
                              type="text" 
                              required 
                              readOnly
                              value={newAddress.province}
                              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                              placeholder="Auto-populated"
                            />
                          </div>
                          <div className="co-form-group">
                            <label>Postal Code</label>
                            <input 
                              type="text" 
                              required 
                              value={newAddress.postalCode}
                              onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                              placeholder="Postal Code"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="co-form-grid">
                          <div className="co-form-group">
                            <label>City</label>
                            <input 
                              type="text" 
                              required 
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              placeholder="City"
                            />
                          </div>
                          <div className="co-form-group">
                            <label>District</label>
                            <input 
                              type="text" 
                              required 
                              value={newAddress.district}
                              onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                              placeholder="District"
                            />
                          </div>
                        </div>
                        <div className="co-form-grid">
                          <div className="co-form-group">
                            <label>Province / State</label>
                            <input 
                              type="text" 
                              required 
                              value={newAddress.province}
                              onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                              placeholder="Province / State"
                            />
                          </div>
                          <div className="co-form-group">
                            <label>Postal Code</label>
                            <input 
                              type="text" 
                              required 
                              value={newAddress.postalCode}
                              onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                              placeholder="Postal Code"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    <div className="co-form-actions">
                      <button 
                        type="button" 
                        className="co-form-cancel"
                        onClick={() => setShowAddAddressForm(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="co-form-submit"
                        disabled={checkoutState !== 'idle'}
                        style={{
                          opacity: checkoutState !== 'idle' ? 0.7 : 1,
                          cursor: checkoutState !== 'idle' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {checkoutState === 'saving_address' ? 'Saving...' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
