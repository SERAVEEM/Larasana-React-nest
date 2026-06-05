import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../api/client';
import '../style/MyOrders.css';
import { showAlert } from '../utils/alerts';
interface OrderItemSnapshot {
  name: string;
  thumbnailUrl: string | null;
  motif: string | null;
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  productSnapshot: OrderItemSnapshot | null;
}

interface Order {
  id: number;
  orderCode: string;
  totalAmount: number | string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostal: string;
  notes: string | null;
  shippingCost: number | string;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Cancel modal state
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('larasana_auth_token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await client.get('/orders/my');
      setOrders(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCancelClick = (orderId: number) => {
    setCancelOrderId(orderId);
    setCancelReason('');
  };

  const handleCancelSubmit = async () => {
    if (!cancelOrderId) return;
    setSubmittingCancel(true);
    try {
      await client.patch(`/orders/my/${cancelOrderId}/cancel`, {
        reason: cancelReason || 'Cancelled by buyer'
      });
      setCancelOrderId(null);
      fetchOrders();
    } catch (err) {
      console.error('Failed to cancel order:', err);
      showAlert('Failed to cancel order. Please try again.');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handlePayNow = async (order: Order) => {
    try {
      // Fetch current payment credentials from backend status endpoint
      const res = await client.get(`/checkout/payment-status/${order.id}`);
      const paymentData = res.data;

      const firstItem = order.items[0];
      
      const orderDetails = {
        product: {
          id: String(firstItem?.productId || 1),
          name: firstItem?.productSnapshot?.name || 'Curated Piece',
          price: Number(firstItem?.unitPrice || order.totalAmount),
          image: firstItem?.productSnapshot?.thumbnailUrl || '/images/product/far left.png',
          size: firstItem?.productSnapshot?.motif || 'Standard'
        },
        pricing: {
          subtotal: Number(order.totalAmount) - Number(order.shippingCost),
          shipping: Number(order.shippingCost),
          total: Number(order.totalAmount)
        },
        order: {
          id: order.id,
          orderCode: order.orderCode,
          totalAmount: Number(order.totalAmount),
          status: order.status
        },
        payment: {
          id: paymentData.id || 1,
          method: paymentData.paymentMethod || 'qris',
          amount: Number(paymentData.amount || order.totalAmount),
          status: paymentData.paymentStatus || 'pending',
          paymentUrl: paymentData.paymentUrl,
          qrImageUrl: paymentData.qrImageUrl,
          vaNumber: paymentData.vaNumber,
          expiryTime: paymentData.expiryTime
        }
      };

      navigate('/payment', { state: orderDetails });
    } catch (err) {
      console.error('Failed to load payment credentials:', err);
      showAlert('Could not retrieve payment information. Please try again.');
    }
  };

  // Format currency
  const formatPrice = (value: number | string): string => {
    return '$' + Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Filter orders client-side
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mo-wrapper">
      <div className="mo-header-space" />
      
      <div className="mo-container">
        <div className="mo-header-section">
          <h1 className="mo-title">My Orders</h1>
          <p className="mo-subtitle">Track your orders, complete payments, or request cancellations.</p>
        </div>

        {/* Filter and Search Bar */}
        <div className="mo-controls">
          <form className="mo-search-box" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by Order ID (e.g. LRS-)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mo-search-input"
            />
            <svg className="mo-search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </form>

          <div className="mo-filter-tabs">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                className={`mo-filter-tab ${selectedStatus === status ? 'active' : ''}`}
                onClick={() => setSelectedStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mo-loading-state">
            <div className="mo-spinner" />
            <p>Loading your order history...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="mo-empty-state">
            <svg className="mo-empty-icon" viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h3>No orders found</h3>
            <p>You haven't made any purchases matching this filter yet.</p>
            <button className="mo-shop-btn" onClick={() => navigate('/')}>Continue Shopping</button>
          </div>
        ) : (
          <div className="mo-orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="mo-order-card">
                
                {/* Order Card Header */}
                <div className="mo-order-card-header">
                  <div className="mo-header-left">
                    <span className="mo-order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="mo-order-code">{order.orderCode}</span>
                  </div>
                  <div className="mo-header-right">
                    <span className={`mo-status-badge mo-status-${order.status}`}>
                      {order.status === 'pending' && 'Pending Payment'}
                      {order.status === 'processing' && 'Paid & Processing'}
                      {order.status === 'shipped' && 'Shipped'}
                      {order.status === 'delivered' && 'Delivered'}
                      {order.status === 'cancelled' && 'Cancelled'}
                    </span>
                  </div>
                </div>

                {/* Order Card Body (Items) */}
                <div className="mo-order-card-body">
                  {order.items.map((item) => (
                    <div key={item.id} className="mo-order-item-row">
                      <img
                        src={item.productSnapshot?.thumbnailUrl || '/images/product/far left.png'}
                        alt={item.productSnapshot?.name || 'Product Image'}
                        className="mo-item-img"
                      />
                      <div className="mo-item-details">
                        <h4 className="mo-item-name">{item.productSnapshot?.name || 'Curated Tenun Piece'}</h4>
                        <span className="mo-item-size">Motif: {item.productSnapshot?.motif || 'Standard'}</span>
                        <div className="mo-item-qty-price">
                          <span>{formatPrice(item.unitPrice)}</span>
                          <span className="mo-qty-multiplier">x{item.quantity}</span>
                        </div>
                      </div>
                      <div className="mo-item-subtotal">
                        {formatPrice(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Details Collapse */}
                <div className="mo-order-shipping-box">
                  <div className="mo-shipping-title">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    <span>Shipping Details</span>
                  </div>
                  <p className="mo-shipping-text">
                    <strong>{order.shippingName}</strong> ({order.shippingPhone})<br />
                    {order.shippingAddress}, {order.shippingCity}, {order.shippingProvince} {order.shippingPostal}
                  </p>
                  {order.notes && (
                    <p className="mo-shipping-notes"><strong>Notes:</strong> {order.notes}</p>
                  )}
                  {order.cancelReason && (
                    <p className="mo-shipping-cancel-reason">
                      <strong>Cancellation Reason:</strong> {order.cancelReason}
                    </p>
                  )}
                </div>

                {/* Order Card Footer */}
                <div className="mo-order-card-footer">
                  <div className="mo-footer-left">
                    <div className="mo-price-summary">
                      <div className="mo-summary-line">
                        <span>Shipping Cost:</span>
                        <span>{formatPrice(order.shippingCost)}</span>
                      </div>
                      <div className="mo-summary-line mo-total-line">
                        <span>Total Paid:</span>
                        <span className="mo-total-price">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mo-footer-right">
                    {order.status === 'pending' && (
                      <>
                        <button
                          className="mo-cancel-btn"
                          onClick={() => handleCancelClick(order.id)}
                        >
                          Cancel Order
                        </button>
                        <button
                          className="mo-pay-btn"
                          onClick={() => handlePayNow(order)}
                        >
                          Pay Now
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {cancelOrderId !== null && (
        <div className="mo-modal-overlay" onClick={() => setCancelOrderId(null)}>
          <div className="mo-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mo-modal-header">
              <h3>Cancel Order</h3>
              <button className="mo-modal-close" onClick={() => setCancelOrderId(null)}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="mo-modal-body">
              <p className="mo-modal-warning">Are you sure you want to cancel this order? This action cannot be undone.</p>
              
              <div className="mo-form-group">
                <label htmlFor="cancel-reason">Reason for Cancellation</label>
                <textarea
                  id="cancel-reason"
                  placeholder="e.g. Changed my mind, want to change payment method, etc."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mo-textarea"
                />
              </div>

              <div className="mo-modal-actions">
                <button
                  className="mo-modal-back-btn"
                  onClick={() => setCancelOrderId(null)}
                  disabled={submittingCancel}
                >
                  Go Back
                </button>
                <button
                  className="mo-modal-confirm-btn"
                  onClick={handleCancelSubmit}
                  disabled={submittingCancel}
                >
                  {submittingCancel ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
