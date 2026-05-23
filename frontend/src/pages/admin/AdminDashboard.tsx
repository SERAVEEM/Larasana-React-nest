import { useState, useMemo } from 'react';
import { getProducts, getOrders, formatIDR } from './mockData';
import '../../style/admin.css';

type FilterType = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export default function AdminDashboard() {
  const [timeFilter, setTimeFilter] = useState<FilterType>('Monthly');
  const [graphFilter, setGraphFilter] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');

  // Load products & orders from state
  const products = useMemo(() => getProducts(), []);
  const orders = useMemo(() => getOrders(), []);

  // Compute metrics dynamically based on mock database state
  const totalRevenue = useMemo(() => {
    const baseRevenue = 278000000; // static base to match mockup design styling
    const orderSum = orders
      .filter(o => o.status === 'Delivered')
      .reduce((sum, o) => sum + o.numericAmount, 0);
    return baseRevenue + orderSum;
  }, [orders]);

  const totalOrders = useMemo(() => {
    return 2070 + orders.length;
  }, [orders]);

  const totalProductCount = useMemo(() => {
    // Return count of products or sum of stocks. Mockup says "273" total products.
    // Let's do a base of 268 + products count.
    return 268 + products.length;
  }, [products]);

  const totalCustomers = 8971; // static customer base

  // Best selling products based on mock DB sales
  const bestProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3);
  }, [products]);

  // Graph paths for dynamic SVG rendering
  // Coordinates are computed within a 500x200 viewBox space
  const graphData = useMemo(() => {
    if (graphFilter === 'Weekly') {
      return {
        labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        points: [
          { x: 30, y: 170 },  // Mon
          { x: 100, y: 150 }, // Tue
          { x: 170, y: 160 }, // Wed
          { x: 240, y: 120 }, // Thu
          { x: 310, y: 90 },  // Fri
          { x: 380, y: 60 },  // Sat
          { x: 450, y: 40 }   // Sun
        ],
        path: 'M 30 170 C 65 160, 65 150, 100 150 C 135 150, 135 160, 170 160 C 205 160, 205 120, 240 120 C 275 120, 275 90, 310 90 C 345 90, 345 60, 380 60 C 415 60, 415 40, 450 40',
        areaPath: 'M 30 170 C 65 160, 65 150, 100 150 C 135 150, 135 160, 170 160 C 205 160, 205 120, 240 120 C 275 120, 275 90, 310 90 C 345 90, 345 60, 380 60 C 415 60, 415 40, 450 40 L 450 200 L 30 200 Z',
        yLabels: ['30.000.000', '20.000.000', '10.000.000', '5.000.000', '0']
      };
    } else if (graphFilter === 'Yearly') {
      return {
        labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
        points: [
          { x: 30, y: 180 },
          { x: 114, y: 150 },
          { x: 198, y: 120 },
          { x: 282, y: 80 },
          { x: 366, y: 50 },
          { x: 450, y: 25 }
        ],
        path: 'M 30 180 C 72 165, 72 150, 114 150 C 156 150, 156 120, 198 120 C 240 120, 240 80, 282 80 C 324 80, 324 50, 366 50 C 408 50, 408 25, 450 25',
        areaPath: 'M 30 180 C 72 165, 72 150, 114 150 C 156 150, 156 120, 198 120 C 240 120, 240 80, 282 80 C 324 80, 324 50, 366 50 C 408 50, 408 25, 450 25 L 450 200 L 30 200 Z',
        yLabels: ['3.000.000.000', '2.000.000.000', '1.000.000.000', '500.000.000', '0']
      };
    } else {
      // Monthly (mockup matches)
      return {
        labels: ['JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
        points: [
          { x: 30, y: 185 },  // Jul
          { x: 114, y: 180 }, // Aug
          { x: 198, y: 175 }, // Sep
          { x: 282, y: 182 }, // Oct
          { x: 366, y: 150 }, // Nov
          { x: 450, y: 35 }   // Dec (large jump to 230m)
        ],
        path: 'M 30 185 C 72 182.5, 72 180, 114 180 C 156 180, 156 175, 198 175 C 240 175, 240 182, 282 182 C 324 182, 324 150, 366 150 C 408 150, 408 35, 450 35',
        areaPath: 'M 30 185 C 72 182.5, 72 180, 114 180 C 156 180, 156 175, 198 175 C 240 175, 240 182, 282 182 C 324 182, 324 150, 366 150 C 408 150, 408 35, 450 35 L 450 200 L 30 200 Z',
        yLabels: ['300.000.000', '200.000.000', '100.000.000', '10.000.000', '0']
      };
    }
  }, [graphFilter]);

  return (
    <div className="admin-container">
      {/* Title Area */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1 className="admin-page-title">Analytics Overviews</h1>
          <p className="admin-breadcrumb" style={{ maxWidth: '600px', lineHeight: '1.5', marginTop: '0.25rem' }}>
            Monitor the pulse of your atelier. Track artisan performance, exclusive collections, and global patron engagement.
          </p>
        </div>

        {/* Time filters right side */}
        <div className="admin-filter-pill-container">
          {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as FilterType[]).map((f) => (
            <button
              key={f}
              className={`admin-filter-pill ${timeFilter === f ? 'admin-filter-pill--active' : ''}`}
              onClick={() => setTimeFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="admin-metrics-grid">
        {/* Total Revenue */}
        <div className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-title">Total Revenue</span>
            <span className="admin-metric-icon">
              {/* Museum/Bank Building Icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M4 10l8-7 8 7" />
              </svg>
            </span>
          </div>
          <div className="admin-metric-value">{formatIDR(totalRevenue)}</div>
          <div className="admin-metric-change">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            +20% from last week
          </div>
        </div>

        {/* Total Orders */}
        <div className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-title">Total Orders</span>
            <span className="admin-metric-icon">
              {/* Document Icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </span>
          </div>
          <div className="admin-metric-value">{totalOrders}</div>
          <div className="admin-metric-change">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            +7% from last week
          </div>
        </div>

        {/* Total Product */}
        <div className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-title">Total Product</span>
            <span className="admin-metric-icon">
              {/* Diamond Icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="6 3 18 3 22 9 12 21 2 9 6 3" />
                <line x1="2" y1="9" x2="22" y2="9" />
                <line x1="12" y1="21" x2="6" y2="3" />
                <line x1="12" y1="21" x2="18" y2="3" />
              </svg>
            </span>
          </div>
          <div className="admin-metric-value">{totalProductCount}</div>
          <div className="admin-metric-change" style={{ color: '#aaa' }}>
            Steady inventory
          </div>
        </div>

        {/* Total Customers */}
        <div className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-title">Total Customers</span>
            <span className="admin-metric-icon">
              {/* Double Profile Icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </span>
          </div>
          <div className="admin-metric-value">{totalCustomers.toLocaleString()}</div>
          <div className="admin-metric-change">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            +9% from last week
          </div>
        </div>
      </div>

      {/* Main Graph & List Area */}
      <div className="admin-dashboard-row">
        {/* Sale Graph Box */}
        <div className="admin-card-black">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Sale Graph</h2>
            {/* Graph Filters inside Header */}
            <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#111', borderRadius: '8px', padding: '0.2rem' }}>
              {(['Weekly', 'Monthly', 'Yearly'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setGraphFilter(filter)}
                  style={{
                    backgroundColor: graphFilter === filter ? '#fff' : 'transparent',
                    color: graphFilter === filter ? '#000' : '#888',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.4rem 1rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* SVG line chart */}
          <div className="admin-graph-container">
            {/* Y Axis Labels */}
            <div className="admin-graph-y-axis">
              {graphData.yLabels.map((lbl, idx) => (
                <div key={idx}>{lbl}</div>
              ))}
            </div>

            {/* SVG Canvas */}
            <svg className="admin-graph-svg" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                {/* Gold gradient fill for area under line */}
                <linearGradient id="graph-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#cda45e" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#cda45e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="30" y1="35" x2="470" y2="35" className="admin-graph-grid-line" />
              <line x1="30" y1="75" x2="470" y2="75" className="admin-graph-grid-line" />
              <line x1="30" y1="115" x2="470" y2="115" className="admin-graph-grid-line" />
              <line x1="30" y1="150" x2="470" y2="150" className="admin-graph-grid-line" />
              <line x1="30" y1="185" x2="470" y2="185" className="admin-graph-grid-line" />

              {/* Shaded Area Under Line */}
              <path key={`area-${graphFilter}`} d={graphData.areaPath} className="admin-graph-gradient" />

              {/* Curved Line Path */}
              <path key={`line-${graphFilter}`} d={graphData.path} className="admin-graph-path" />

              {/* Individual point nodes */}
              {graphData.points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="#000"
                    stroke="#cda45e"
                    strokeWidth="2.5"
                    style={{ transition: 'all 0.5s ease' }}
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill="transparent"
                    stroke="transparent"
                    style={{ cursor: 'pointer' }}
                  >
                    <title>Value Point {idx + 1}</title>
                  </circle>
                </g>
              ))}
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="admin-graph-x-labels">
            {graphData.labels.map((lbl, idx) => (
              <div key={idx} className="admin-graph-x-label">
                {lbl}
              </div>
            ))}
          </div>
        </div>

        {/* Best Products Column */}
        <div className="admin-card-black" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Best Product</h2>
            <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
              {/* Three dots vertical */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>

          <div className="admin-best-list">
            {bestProducts.map((p) => {
              // Format a simplified total revenue
              // E.g. 1269 sales * 1.700.000 price could be truncated or shown nicely
              // The design displays Noir Enchanted Vest | IDR 1.700.000 | IDR 45.900.000 | 27 sales
              // Let's display it elegantly based on mock data.
              // We can use a base mock multiplier if sales numbers are huge or show exact numbers.
              const salesToShow = p.sales > 100 ? Math.floor(p.sales / 30) : p.sales;
              const revToShow = salesToShow * p.numericPrice;

              return (
                <div key={p.id} className="admin-best-item">
                  <img src={p.image} alt={p.name} className="admin-best-img" />
                  <div className="admin-best-info">
                    <span className="admin-best-name">{p.name}</span>
                    <span className="admin-best-price">IDR {p.numericPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="admin-best-meta">
                    <span className="admin-best-revenue">IDR {revToShow.toLocaleString('id-ID')}</span>
                    <span className="admin-best-sales">{salesToShow} sales</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
