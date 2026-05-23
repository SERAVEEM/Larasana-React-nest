import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProduct } from './mockData';
import '../../style/admin.css';

export default function AdminAddProduct() {
  const navigate = useNavigate();
  
  // Form fields
  const [name, setName] = useState('Noir Enchanted Vest');
  const [category, setCategory] = useState('Authentic Handmade');
  const [description, setDescription] = useState(
    "Noir Enchanted Vest by Yulia Andirtia is inspired by Lombok's culture, folklore, and starlit nights. Luminous embroidery symbolizes strength, elegance, and the blend of heritage with modern style. More than a garment, it carries the soul and story of Lombok into today's world."
  );
  const [sku, setSku] = useState('#32A53');
  const [stock, setStock] = useState('21');
  const [price, setPrice] = useState('1700000');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['XL']);
  
  // Base64 images
  const [productImage, setProductImage] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Drag and drop / file input helpers
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) {
      alert('Please fill out Name, Price, and Stock fields.');
      return;
    }

    setSubmitting(true);

    // Mock API saving delay
    setTimeout(() => {
      saveProduct({
        name,
        category,
        description,
        sku,
        stock: parseInt(stock) || 0,
        numericPrice: parseInt(price) || 0,
        sizes: selectedSizes,
        image: productImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500', // placeholder fallback if none uploaded
        qrCode: qrImage || undefined,
        sales: 0
      });
      setSubmitting(false);
      navigate('/admin/products');
    }, 800);
  };

  return (
    <div className="admin-container">
      {/* Title & Breadcrumbs */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-page-title">Add New Product</h1>
          <div className="admin-breadcrumb">
            All Products &gt; <span className="admin-breadcrumb-active">Add New Product</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-row">
        {/* Left Column (Inputs) */}
        <div className="admin-form-col">
          {/* Product Name */}
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="prod-name">Product Name</label>
            <input 
              id="prod-name"
              type="text" 
              className="admin-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Noir Enchanted Vest"
              required
            />
          </div>

          {/* Product Category (Custom added to make data-mapping robust) */}
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="prod-cat">Category / Fabric</label>
            <input 
              id="prod-cat"
              type="text" 
              className="admin-input" 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              placeholder="e.g. Authentic Handmade"
            />
          </div>

          {/* Description */}
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="prod-desc">Description</label>
            <textarea 
              id="prod-desc"
              className="admin-textarea" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Describe the artisan story and styling notes..."
            />
          </div>

          {/* SKU & Stock */}
          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="prod-sku">SKU</label>
              <input 
                id="prod-sku"
                type="text" 
                className="admin-input" 
                value={sku} 
                onChange={e => setSku(e.target.value)} 
                placeholder="#32A53"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="prod-stock">Stock Quantity</label>
              <input 
                id="prod-stock"
                type="number" 
                className="admin-input" 
                value={stock} 
                onChange={e => setStock(e.target.value)} 
                placeholder="21"
                required
              />
            </div>
          </div>

          {/* Sale Price */}
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="prod-price">Sale Price (IDR Numerical)</label>
            <input 
              id="prod-price"
              type="number" 
              className="admin-input" 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              placeholder="e.g. 1700000 for IDR 1.700.000"
              required
            />
          </div>

          {/* Size Checkboxes */}
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

        {/* Right Column (Dropzones & Preview) */}
        <div className="admin-form-col">
          {/* Main Large Preview box */}
          <div className="admin-form-group">
            <label className="admin-label">Product Image Preview</label>
            <div className="admin-preview-box">
              {productImage ? (
                <img src={productImage} alt="Preview" className="admin-preview-img" />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#bbb', fontSize: '0.9rem', border: '1.5px dashed #ddd', borderRadius: '12px' }}>
                  No Product Image Selected
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
              onClick={() => document.getElementById('prod-img-input')?.click()}
            >
              <input 
                id="prod-img-input"
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

          {/* QR Code Authenticity Dropzone */}
          <div className="admin-form-group">
            <span className="admin-dropzone-title">QR For Authenticity</span>
            <div 
              className="admin-dropzone"
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, 'qr')}
              onClick={() => document.getElementById('qr-img-input')?.click()}
            >
              <input 
                id="qr-img-input"
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={e => handleFileChange(e, 'qr')}
              />
              {qrImage ? (
                <img src={qrImage} alt="QR Code Preview" className="admin-dropzone-preview" />
              ) : (
                <>
                  <span className="admin-dropzone-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <circle cx="17.5" cy="17.5" r="1" fill="currentColor"/>
                    </svg>
                  </span>
                  <span className="admin-dropzone-text">Drop your QR Code image here, or <span style={{ color: '#b8860b', textDecoration: 'underline' }}>browse</span></span>
                  <span className="admin-dropzone-sub">Jpeg, png are allowed</span>
                </>
              )}
            </div>
          </div>

          {/* Action button */}
          <button 
            type="submit" 
            className="admin-btn admin-btn--gold"
            disabled={submitting}
            style={{ width: '100%', marginTop: '1rem', height: '3.5rem' }}
          >
            {submitting ? 'Creating Product...' : 'Add New Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
