import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from './mockData';
import type { Order } from './mockData';
import '../../style/admin.css';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const ordersPerPage = 6;

  // Fetch orders with a simulated network delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setOrders(getOrders());
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter orders by search term (customer name or order ID)
  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;

  const handleRowClick = (orderId: string) => {
    // Strip '#' from ID for clean URL
    const cleanId = orderId.replace('#', '');
    navigate(`/admin/orders/${cleanId}`);
  };

  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'admin-status-pill--delivered';
      case 'Canceled':
        return 'admin-status-pill--canceled';
      default:
        return 'admin-status-pill--pending';
    }
  };

  return (
    <div className="admin-container">
      {/* Title Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-page-title">Orders List</h1>
          <div className="admin-breadcrumb">
            Order List
          </div>
        </div>

        {/* Date Selector Filter */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Simple search box for filter compatibility */}
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="admin-input" 
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '220px', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
          />

          <button 
            className="admin-btn admin-btn--outline"
            style={{ padding: '0.65rem 1.25rem', backgroundColor: '#fff', fontSize: '0.85rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Feb 16,2022 - Feb 20,2022
          </button>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="admin-orders-table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Purchases</h2>
          <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}>
            Loading orders list...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#888' }}>
            No orders found matching the filter criteria.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer Name</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => {
                  // Get first item representation or count summary
                  const mainItem = order.items[0];
                  const productText = order.items.length > 1 
                    ? `${mainItem.name} (+${order.items.length - 1} more)`
                    : mainItem.name;

                  return (
                    <tr key={order.id} onClick={() => handleRowClick(order.id)}>
                      {/* Product details */}
                      <td style={{ fontWeight: 600 }}>{productText}</td>
                      
                      {/* Order ID */}
                      <td style={{ fontWeight: 600 }}>{order.id}</td>
                      
                      {/* Date */}
                      <td>{order.date}</td>
                      
                      {/* Customer Name & Avatar */}
                      <td>
                        <div className="admin-customer-cell">
                          <div className="admin-customer-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#cda45e' }}>
                            {order.customerName.charAt(0)}
                          </div>
                          <span>{order.customerName}</span>
                        </div>
                      </td>
                      
                      {/* Status Tag */}
                      <td>
                        <span className={`admin-status-pill ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      
                      {/* Amount */}
                      <td style={{ fontWeight: 700 }}>{order.amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="admin-pagination">
          <button 
            className="admin-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`admin-page-btn ${currentPage === idx + 1 ? 'admin-page-btn--active' : ''}`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button 
            className="admin-page-btn admin-page-btn--next"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next &gt;
          </button>
        </div>
      )}
    </div>
  );
}
