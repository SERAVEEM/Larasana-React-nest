import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from './mockData';
import type { Order } from './mockData';
import '../../style/admin.css';

export default function AdminOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Order['status']>('Pending');

  // Load order data from local storage
  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(() => {
      const data = getOrderById(id);
      if (data) {
        setOrder(data);
        setStatus(data.status);
      }
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [id]);

  const handleStatusChange = (newStatus: Order['status']) => {
    if (!order) return;
    updateOrderStatus(order.id, newStatus);
    setStatus(newStatus);
    // Visual user feedback
    alert(`Order status updated to ${newStatus}`);
  };

  if (loading) {
    return (
      <div className="admin-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading Order Details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="admin-container" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#333', marginBottom: '1rem' }}>Order Not Found</h2>
        <button className="admin-btn admin-btn--primary" onClick={() => navigate('/admin/orders')}>Back to Orders</button>
      </div>
    );
  }

  // Calculate totals
  const subtotal = order.items.reduce((sum, item) => sum + (item.numericPrice * item.quantity), 0);
  const tax = Math.round(subtotal * 0.20); // 20% Tax
  const shipping = 25000; // static shipping cost
  const grandTotal = subtotal + tax + shipping;

  return (
    <div className="admin-container">
      {/* Title & Breadcrumbs */}
      <div className="admin-header-row" style={{ alignItems: 'flex-start' }}>
        <div className="admin-title-group">
          <h1 className="admin-page-title">Orders Details</h1>
          <div className="admin-breadcrumb">
            Order List &gt; <span className="admin-breadcrumb-active">Order Details</span>
          </div>
        </div>
        
        {/* Back Button */}
        <button 
          className="admin-btn admin-btn--outline" 
          onClick={() => navigate('/admin/orders')}
          style={{ padding: '0.65rem 1.25rem', backgroundColor: '#fff', fontSize: '0.85rem' }}
        >
          &larr; Back to List
        </button>
      </div>

      {/* Details Top Panel (ID & Date & Status select) */}
      <div className="admin-orders-table-card" style={{ padding: '1.5rem 2rem' }}>
        <div className="admin-details-top-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h2 className="admin-order-id-title">Orders ID: {order.id}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.85rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Feb 16,2022 - Feb 20,2022
            </div>
          </div>

          {/* Interactive Status Switcher */}
          <div className="admin-status-dropdown">
            <select 
              className="admin-status-select" 
              value={status} 
              onChange={e => handleStatusChange(e.target.value as Order['status'])}
              style={{
                backgroundColor: status === 'Delivered' ? '#b8860b' : status === 'Canceled' ? '#d32f2f' : '#fff',
                color: status === 'Pending' ? '#333' : '#fff',
                borderColor: status === 'Pending' ? '#ddd' : 'transparent',
                backgroundImage: status === 'Pending' 
                  ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")"
                  : "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")"
              }}
            >
              <option value="Pending" style={{ backgroundColor: '#fff', color: '#000' }}>Pending</option>
              <option value="Delivered" style={{ backgroundColor: '#fff', color: '#000' }}>Delivered</option>
              <option value="Canceled" style={{ backgroundColor: '#fff', color: '#000' }}>Canceled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Cards Row */}
      <div className="admin-details-cards-row">
        {/* Customer Card */}
        <div className="admin-details-card">
          <div className="admin-details-card-icon-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="admin-details-card-info">
            <h3 className="admin-details-card-title">Customer</h3>
            <span className="admin-details-card-text" style={{ fontWeight: 600, color: '#000' }}>Full Name: {order.customerName}</span>
            <span className="admin-details-card-text">Email: {order.customerEmail}</span>
            <span className="admin-details-card-text">Phone: {order.customerPhone}</span>
          </div>
        </div>

        {/* Order Info Card */}
        <div className="admin-details-card">
          <div className="admin-details-card-icon-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="admin-details-card-info">
            <h3 className="admin-details-card-title">Order Info</h3>
            <span className="admin-details-card-text">Shipping: {order.shippingMethod}</span>
            <span className="admin-details-card-text">Payment Method: {order.paymentMethod}</span>
            <span className="admin-details-card-text" style={{ fontWeight: 600 }}>Status: <span style={{ color: status === 'Delivered' ? '#2e7d32' : status === 'Canceled' ? '#ef6c00' : '#1e88e5' }}>{status}</span></span>
          </div>
        </div>

        {/* Deliver To Card */}
        <div className="admin-details-card">
          <div className="admin-details-card-icon-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="admin-details-card-info">
            <h3 className="admin-details-card-title">Deliver to</h3>
            <span className="admin-details-card-text" style={{ fontWeight: 500, color: '#000' }}>Address:</span>
            <span className="admin-details-card-text" style={{ wordBreak: 'break-word' }}>{order.address}</span>
          </div>
        </div>
      </div>

      {/* Mid Info Section (Payment & Note) */}
      <div className="admin-details-mid-row">
        {/* Payment info block */}
        <div className="admin-details-box">
          <h3 className="admin-details-box-title">Payment Info</h3>
          <div className="admin-payment-brand">
            {/* Simple Card Logo Representation */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#d32f2f' }}>
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            {order.paymentMethod} **** **** 6557
          </div>
          <span style={{ fontSize: '0.85rem', color: '#555' }}>Business name: {order.customerName}</span>
          <span style={{ fontSize: '0.85rem', color: '#555' }}>Phone: {order.customerPhone}</span>
        </div>

        {/* Note block */}
        <div className="admin-details-box">
          <h3 className="admin-details-box-title">Note</h3>
          {order.note ? (
            <p className="admin-note-content">{order.note}</p>
          ) : (
            <p style={{ fontStyle: 'italic', color: '#888', fontSize: '0.9rem', margin: 0 }}>No customer notes attached to this order.</p>
          )}
        </div>
      </div>

      {/* Products Details List Table */}
      <div className="admin-details-products-section">
        <h3 className="admin-details-section-title">Products</h3>

        <div className="admin-table-container">
          <table className="admin-table" style={{ border: 'none' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #eee' }}>Product Name</th>
                <th style={{ borderBottom: '1px solid #eee' }}>Order ID</th>
                <th style={{ borderBottom: '1px solid #eee' }}>Quantity</th>
                <th style={{ borderBottom: '1px solid #eee', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} style={{ cursor: 'default' }}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600 }}>
                    <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                    {item.name}
                  </td>
                  <td>{order.id}</td>
                  <td>{item.quantity}</td>
                  <td style={{ fontWeight: 700, textAlign: 'right' }}>{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grand Total Area */}
        <div className="admin-details-totals-wrapper">
          <div className="admin-details-totals">
            <div className="admin-details-totals-row">
              <span>Subtotal</span>
              <span style={{ fontWeight: 600 }}>IDR {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="admin-details-totals-row">
              <span>Tax (20%)</span>
              <span style={{ fontWeight: 600 }}>IDR {tax.toLocaleString('id-ID')}</span>
            </div>
            <div className="admin-details-totals-row">
              <span>Shipping</span>
              <span style={{ fontWeight: 600 }}>IDR {shipping.toLocaleString('id-ID')}</span>
            </div>
            <div className="admin-details-totals-row admin-details-totals-row--grand">
              <span>Total</span>
              <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
