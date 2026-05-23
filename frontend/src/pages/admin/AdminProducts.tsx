import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from './mockData';
import type { Product } from './mockData';
import '../../style/admin.css';

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // Fetch products with a mock delay to simulate an API request
  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(getProducts());
      setLoading(false);
    }, 600); // 600ms delay for visual feedback of loading skeleton
    return () => clearTimeout(timer);
  }, []);

  // Pagination Logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage) || 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-container">
      {/* Title & Add Product Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-page-title">All Products</h1>
          <div className="admin-breadcrumb">
            All Products
          </div>
        </div>

        <button 
          className="admin-btn admin-btn--primary"
          onClick={() => navigate('/admin/products/new')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.25rem' }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Product
        </button>
      </div>

      {/* Loading Skeleton or Product Grid */}
      {loading ? (
        <div className="admin-products-grid">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="admin-product-card" style={{ cursor: 'default' }}>
              <div className="admin-product-top">
                <div style={{ width: '70px', height: '70px', borderRadius: '8px', backgroundColor: '#eee', animation: 'pulse 1.5s infinite alternate' }} />
                <div className="admin-product-meta" style={{ flex: 1 }}>
                  <div style={{ width: '70%', height: '14px', backgroundColor: '#eee', marginBottom: '8px', animation: 'pulse 1.5s infinite alternate' }} />
                  <div style={{ width: '40%', height: '10px', backgroundColor: '#eee', marginBottom: '8px', animation: 'pulse 1.5s infinite alternate' }} />
                  <div style={{ width: '50%', height: '12px', backgroundColor: '#eee', animation: 'pulse 1.5s infinite alternate' }} />
                </div>
              </div>
              <div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#eee', marginBottom: '6px', animation: 'pulse 1.5s infinite alternate' }} />
                <div style={{ width: '100%', height: '10px', backgroundColor: '#eee', marginBottom: '6px', animation: 'pulse 1.5s infinite alternate' }} />
                <div style={{ width: '70%', height: '10px', backgroundColor: '#eee', animation: 'pulse 1.5s infinite alternate' }} />
              </div>
              <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ width: '30%', height: '10px', backgroundColor: '#eee', animation: 'pulse 1.5s infinite alternate' }} />
                  <div style={{ width: '20%', height: '10px', backgroundColor: '#eee', animation: 'pulse 1.5s infinite alternate' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ width: '40%', height: '10px', backgroundColor: '#eee', animation: 'pulse 1.5s infinite alternate' }} />
                  <div style={{ width: '25%', height: '10px', backgroundColor: '#eee', animation: 'pulse 1.5s infinite alternate' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #eee' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ marginBottom: '1rem' }}>
            <polygon points="6 3 18 3 22 9 12 21 2 9 6 3" />
          </svg>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>No Products Found</h3>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>Get started by adding your first product to the inventory.</p>
        </div>
      ) : (
        <>
          <div className="admin-products-grid">
            {currentProducts.map((p) => {
              // Calculate a simulated stock percent based on a max capacity of 2000
              const maxStockCapacity = 2000;
              const stockPercent = Math.min((p.stock / maxStockCapacity) * 100, 100);

              return (
                <div 
                  key={p.id} 
                  className="admin-product-card"
                  onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                >
                  <div className="admin-product-top">
                    <img src={p.image} alt={p.name} className="admin-product-thumbnail" />
                    <div className="admin-product-meta">
                      <h3 className="admin-product-name">{p.name}</h3>
                      <span className="admin-product-category">{p.category}</span>
                      <span className="admin-product-price">{p.price}</span>
                    </div>
                  </div>

                  <div className="admin-product-desc-group">
                    <h4 className="admin-product-desc-title">Description</h4>
                    <p className="admin-product-desc">{p.description}</p>
                  </div>

                  <div className="admin-product-stats">
                    <div className="admin-stat-row">
                      <span className="admin-stat-label">Sales</span>
                      <span className="admin-stat-val">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#2e7d32' }}>
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                        {p.sales}
                      </span>
                    </div>
                    <div className="admin-stat-row">
                      <span className="admin-stat-label">Remaining Products</span>
                      <div className="admin-stat-val" style={{ width: '60%' }}>
                        <div className="admin-progress-bar-bg" style={{ flex: 1, margin: 0, marginRight: '0.5rem' }}>
                          <div className="admin-progress-bar-fill" style={{ width: `${stockPercent}%` }} />
                        </div>
                        <span>{p.stock}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginated Footer */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <button 
                className="admin-page-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  className={`admin-page-btn ${currentPage === idx + 1 ? 'admin-page-btn--active' : ''}`}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button 
                className="admin-page-btn admin-page-btn--next"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next &gt;
              </button>
            </div>
          )}
        </>
      )}

      {/* CSS Pulse Animation Keyframe */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
