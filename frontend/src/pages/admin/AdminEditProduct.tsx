import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, saveProduct, deleteProduct } from './mockData';
import type { Product } from './mockData';
import '../../style/admin.css';

export default function AdminEditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State elements
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  // Async load product data from local database
  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(() => {
      const data = getProductById(id);
      if (data) {
        setProduct(data);
        setName(data.name);
        setCategory(data.category);
        setDescription(data.description);
        setSku(data.sku);
        setStock(data.stock.toString());
        setPrice(data.numericPrice.toString());
        setSelectedSizes(data.sizes);
        setProductImage(data.image);
        if (data.qrCode) setQrImage(data.qrCode);
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'qr') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (target === 'product') {
        setProductImage(reader.result as string);
      } else {
        setQrImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, target: 'product' | 'qr') => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (target === 'product') {
        setProductImage(reader.result as string);
      } else {
        setQrImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!name || !price || !stock) {
      alert('Please fill out Name, Price, and Stock fields.');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      saveProduct({
        id,
        name,
        category,
        description,
        sku,
        stock: parseInt(stock) || 0,
        numericPrice: parseInt(price) || 0,
        sizes: selectedSizes,
        image: productImage || '',
        qrCode: qrImage || undefined,
        sales: product?.sales || 0
      });
      setSaving(false);
      navigate('/admin/products');
    }, 700);
  };

  const handleDelete = () => {
    if (!id) return;
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    setDeleting(true);
    setTimeout(() => {
      deleteProduct(id);
      setDeleting(false);
      navigate('/admin/products');
    }, 600);
  };

  if (loading) {
    return (
      <div className="admin-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '1.2rem', color: '#666', fontFamily: "'Inter', sans-serif" }}>Loading Product Details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="admin-container" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#333', marginBottom: '1rem' }}>Product Not Found</h2>
        <button className="admin-btn admin-btn--primary" onClick={() => navigate('/admin/products')}>Back to Products</button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Title & Breadcrumbs */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          {/* Mockup title says "Add New Product" in mockup image, but let's make it "Edit Product" to be correct */}
          <h1 className="admin-page-title">Edit Product</h1>
          <div className="admin-breadcrumb">
            All Products &gt; <span className="admin-breadcrumb-active">Edit Product</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="admin-form-row">
        {/* Left Column (Inputs) */}
        <div className="admin-form-col">
          {/* Product Name */}
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="edit-name">Product Name</label>
            <input 
              id="edit-name"
              type="text" 
              className="admin-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required
            />
          </div>

          {/* Category */}
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="edit-cat">Category / Fabric</label>
            <input 
              id="edit-cat"
              type="text" 
              className="admin-input" 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
            />
          </div>

          {/* Description */}
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="edit-desc">Description</label>
            <textarea 
              id="edit-desc"
              className="admin-textarea" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>

          {/* SKU & Stock */}
          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="edit-sku">SKU</label>
              <input 
                id="edit-sku"
                type="text" 
                className="admin-input" 
                value={sku} 
                onChange={e => setSku(e.target.value)} 
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="edit-stock">Stock Quantity</label>
              <input 
                id="edit-stock"
                type="number" 
                className="admin-input" 
                value={stock} 
                onChange={e => setStock(e.target.value)} 
                required
              />
            </div>
          </div>

          {/* Sale Price */}
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="edit-price">Sale Price (IDR Numerical)</label>
            <input 
              id="edit-price"
              type="number" 
              className="admin-input" 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              required
            />
          </div>

          {/* Size Selectors */}
          <div className="admin-form-group">
            <label className="admin-label">Size</label>
            <div className="admin-size-selector">
              {availableSizes.map(size => {
                const active = selectedSizes.includes(size);
                return (
                  <div
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`admin-size-box ${active ? 'admin-size-box--active' : ''}`}
                  >
                    {size}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (Previews & Actions) */}
        <div className="admin-form-col">
          {/* Image Preview Box */}
          <div className="admin-form-group">
            <label className="admin-label">Product Image Preview</label>
            <div className="admin-preview-box">
              {productImage ? (
                <img src={productImage} alt="Preview" className="admin-preview-img" />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#bbb' }}>
                  No Image
                </div>
              )}
            </div>
          </div>

          {/* Product Gallery Dropzone */}
          <div className="admin-form-group">
            <span className="admin-dropzone-title">Product Gallery</span>
            <div 
              className="admin-dropzone"
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, 'product')}
              onClick={() => document.getElementById('edit-img-input')?.click()}
            >
              <input 
                id="edit-img-input"
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={e => handleFileChange(e, 'product')}
              />
              <span className="admin-dropzone-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M20.4 14.5L16 10 9.4 17.2 4.8 12.5 3.6 13.8" />
                </svg>
              </span>
              <span className="admin-dropzone-text">Drop your image here, or <span style={{ color: '#b8860b', textDecoration: 'underline' }}>browse</span></span>
              <span className="admin-dropzone-sub">Jpeg, png are allowed</span>
            </div>
          </div>

          {/* QR Authenticity Dropzone */}
          <div className="admin-form-group">
            <span className="admin-dropzone-title">QR For Authenticity</span>
            <div 
              className="admin-dropzone"
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, 'qr')}
              onClick={() => document.getElementById('edit-qr-input')?.click()}
            >
              <input 
                id="edit-qr-input"
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={e => handleFileChange(e, 'qr')}
              />
              {qrImage ? (
                <img src={qrImage} alt="QR Code" className="admin-dropzone-preview" />
              ) : (
                <>
                  <span className="admin-dropzone-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </span>
                  <span className="admin-dropzone-text">Drop your QR Code image here, or <span style={{ color: '#b8860b', textDecoration: 'underline' }}>browse</span></span>
                  <span className="admin-dropzone-sub">Jpeg, png are allowed</span>
                </>
              )}
            </div>
          </div>

          {/* Action buttons (Delete & Save Edit) */}
          <div className="admin-form-actions-edit">
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              onClick={handleDelete}
              disabled={deleting || saving}
              style={{ height: '3.5rem' }}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn--outline"
              disabled={saving || deleting}
              style={{ height: '3.5rem', backgroundColor: '#fff', border: '1px solid #1a1a1a', fontWeight: 'bold' }}
            >
              {saving ? 'Saving...' : 'Save Edit'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
