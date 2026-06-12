import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProductAsync } from '../../api/adminService';
import { uploadImageAsync } from '../../api/uploadService';
import '../../style/admin.css';
import { showAlert } from '../../utils/alerts';

export default function AdminAddProduct() {
  const navigate = useNavigate();
  
  // Form fields
  const [name, setName] = useState('Noir Enchanted Vest');
  const [category, setCategory] = useState('Authentic Handmade');
  const [description, setDescription] = useState(
    "Noir Enchanted Vest is inspired by Lombok's culture, folklore, and starlit nights. Luminous embroidery symbolizes strength, elegance, and the blend of heritage with modern style. More than a garment, it carries the soul and story of Lombok into today's world."
  );
  const [sku, setSku] = useState('#32A53');
  const [price, setPrice] = useState('120');
  const [weaverName, setWeaverName] = useState('Yulia Andirtia');
  const [weaverBio, setWeaverBio] = useState('Crafted by Yulia Andirtia from the edge of Lombok, this vest carries fragments of ancestral memory through every woven thread. Inspired by volcanic landscapes, island folklore, and starlit nights, this piece reflects the harmony between timeless heritage and contemporary elegance.');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['XL']);
  
  // File objects for R2 upload
  const [productFile, setProductFile] = useState<File | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [weaverFile, setWeaverFile] = useState<File | null>(null);

  // Preview URLs (created from File objects)
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [weaverPreview, setWeaverPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // File selection handler — stores the File object and creates a preview URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'qr' | 'weaver') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (target === 'product') {
      setProductFile(file);
      setProductPreview(previewUrl);
    } else if (target === 'weaver') {
      setWeaverFile(file);
      setWeaverPreview(previewUrl);
    } else {
      setQrFile(file);
      setQrPreview(previewUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, target: 'product' | 'qr' | 'weaver') => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (target === 'product') {
      setProductFile(file);
      setProductPreview(previewUrl);
    } else if (target === 'weaver') {
      setWeaverFile(file);
      setWeaverPreview(previewUrl);
    } else {
      setQrFile(file);
      setQrPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      showAlert('Please fill out Name and Price fields.');
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Upload images to R2 if files were selected
      let imageUrl = '';
      let qrUrl: string | undefined;
      let weaverImageUrl = '';

      if (productFile) {
        setUploadProgress('Uploading product image...');
        imageUrl = await uploadImageAsync(productFile);
      }

      if (qrFile) {
        setUploadProgress('Uploading QR code...');
        qrUrl = await uploadImageAsync(qrFile);
      }

      if (weaverFile) {
        setUploadProgress('Uploading weaver portrait...');
        weaverImageUrl = await uploadImageAsync(weaverFile);
      }

      // Step 2: Save the product with the R2 URLs
      setUploadProgress('Saving product...');
      await saveProductAsync({
        name,
        category,
        description,
        sku,
        stock: 9999,
        numericPrice: parseFloat(price) || 0,
        sizes: selectedSizes,
        image: imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
        qrCode: qrUrl,
        sales: 0,
        weaverName,
        weaverBio,
        weaverImageUrl,
      } as any);
      navigate('/admin/products');
    } catch (err) {
      console.error('Failed to create product:', err);
      showAlert('Failed to create product.');
    } finally {
      setSubmitting(false);
      setUploadProgress('');
    }
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

          {/* SKU & Price */}
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
              <label className="admin-label" htmlFor="prod-price">Sale Price (USD Numerical)</label>
              <input 
                id="prod-price"
                type="number" 
                step="0.01"
                className="admin-input" 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                placeholder="e.g. 120.00"
                required
              />
            </div>
          </div>

          {/* Weaver Details */}
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="prod-weaver-name">Weaver's Name</label>
            <input 
              id="prod-weaver-name"
              type="text" 
              className="admin-input" 
              value={weaverName} 
              onChange={e => setWeaverName(e.target.value)} 
              placeholder="e.g. Yulia Andirtia"
            />
          </div>

          <div className="admin-form-group">
            <span className="admin-dropzone-title">Weaver's Portrait Image</span>
            <div 
              className="admin-dropzone"
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, 'weaver')}
              onClick={() => document.getElementById('prod-weaver-img-input')?.click()}
            >
              <input 
                id="prod-weaver-img-input"
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={e => handleFileChange(e, 'weaver')}
              />
              {weaverPreview ? (
                <img src={weaverPreview} alt="Weaver Preview" className="admin-dropzone-preview" style={{ maxHeight: '120px', borderRadius: '50%' }} />
              ) : (
                <>
                  <span className="admin-dropzone-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M20 21a8 8 0 1 0-16 0" />
                    </svg>
                  </span>
                  <span className="admin-dropzone-text">Drop weaver portrait here, or <span style={{ color: '#b8860b', textDecoration: 'underline' }}>browse</span></span>
                  <span className="admin-dropzone-sub">Jpeg, png are allowed (max 5MB)</span>
                </>
              )}
              {weaverFile && (
                <span className="admin-dropzone-sub" style={{ color: '#2e7d32', marginTop: '4px' }}>
                  ✓ {weaverFile.name}
                </span>
              )}
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="prod-weaver-bio">Weaver's Biography</label>
            <textarea 
              id="prod-weaver-bio"
              className="admin-textarea" 
              value={weaverBio} 
              onChange={e => setWeaverBio(e.target.value)} 
              placeholder="Describe the weaver's story..."
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
              {productPreview ? (
                <img src={productPreview} alt="Preview" className="admin-preview-img" />
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
              <span className="admin-dropzone-sub">Jpeg, png are allowed (max 5MB)</span>
              {productFile && (
                <span className="admin-dropzone-sub" style={{ color: '#2e7d32', marginTop: '4px' }}>
                  ✓ {productFile.name} ({(productFile.size / 1024 / 1024).toFixed(1)}MB)
                </span>
              )}
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
              {qrPreview ? (
                <img src={qrPreview} alt="QR Code Preview" className="admin-dropzone-preview" />
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
              {qrFile && (
                <span className="admin-dropzone-sub" style={{ color: '#2e7d32', marginTop: '4px' }}>
                  ✓ {qrFile.name}
                </span>
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
            {submitting ? (uploadProgress || 'Creating Product...') : 'Add New Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
