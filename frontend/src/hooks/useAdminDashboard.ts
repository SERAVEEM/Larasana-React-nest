import { useState, useMemo, useEffect } from 'react';
import { ServiceContainer } from '../core/di/ServiceContainer';
import { ProductService } from '../core/services/ProductService';
import { OrderService } from '../core/services/OrderService';
import { Product } from '../core/domain/models/Product';
import { Order } from '../core/domain/models/Order';
import type { DashboardStats } from '../api/adminService';

export type FilterType = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
export type GraphFilterType = 'Weekly' | 'Monthly' | 'Yearly';

export function useAdminDashboard() {
  const [timeFilter, setTimeFilter] = useState<FilterType>('Monthly');
  const [graphFilter, setGraphFilter] = useState<GraphFilterType>('Monthly');

  // Resolve services from Dependency Injection Container
  const productService = ServiceContainer.resolve<ProductService>('ProductService');
  const orderService = ServiceContainer.resolve<OrderService>('OrderService');

  // Load products, orders, and dashboard stats asynchronously
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard metrics from the services on mount
  useEffect(() => {
    let active = true;
    
    Promise.all([
      productService.getProducts(), 
      orderService.getOrders(), 
      orderService.getDashboardStats()
    ])
      .then(([productsData, ordersData, statsData]) => {
        if (active) {
          setProducts(productsData);
          setOrders(ordersData);
          setStats(statsData);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load dashboard metrics:', err);
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [productService, orderService]);

  // Helper format function for currency inside hook
  const formatUSD = (value: number | string): string => {
    const num = Number(value);
    if (isNaN(num)) return '$0.00';
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Compute metrics dynamically based on actual database state
  const totalRevenue = useMemo(() => {
    return stats?.revenue?.total ?? 0;
  }, [stats]);

  const totalOrders = useMemo(() => {
    return stats?.orders?.total ?? 0;
  }, [stats]);

  const totalProductCount = useMemo(() => {
    return stats?.products?.total ?? 0;
  }, [stats]);

  const totalCustomers = useMemo(() => {
    return stats?.users?.total ?? 0;
  }, [stats]);

  const revenueChange = useMemo(() => {
    return stats?.revenue?.change ?? '0% from last week';
  }, [stats]);

  const ordersChange = useMemo(() => {
    return stats?.orders?.change ?? '0% from last week';
  }, [stats]);

  const productsChange = useMemo(() => {
    return stats?.products?.change ?? 'Steady inventory';
  }, [stats]);

  const customersChange = useMemo(() => {
    return stats?.users?.change ?? '0% from last week';
  }, [stats]);

  // Best selling products based on DB sales
  const bestProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3);
  }, [products]);

  // Graph paths computed dynamically from actual order history
  // Coordinates are mapped to a 500x200 viewBox space
  const graphData = useMemo(() => {
    const activeOrders = orders.filter(o => o.status !== 'Canceled');

    let labels: string[] = [];
    let values: number[] = [];
    const now = new Date();

    if (graphFilter === 'Weekly') {
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const last7Days: string[] = [];
      const dayIndices: number[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        last7Days.push(dayNames[d.getDay()]);
        dayIndices.push(d.getDay());
      }
      labels = last7Days;
      values = new Array(7).fill(0);

      activeOrders.forEach(o => {
        const cleanDateStr = o.createdAt || o.date.replace(/(\d+)(st|nd|rd|th)/, '$1');
        const orderDate = new Date(cleanDateStr);
        const diffTime = now.getTime() - orderDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          const index = 6 - diffDays;
          values[index] += o.numericAmount;
        }
      });
    } else if (graphFilter === 'Yearly') {
      const currentYear = now.getFullYear();
      labels = [];
      for (let i = 5; i >= 0; i--) {
        labels.push((currentYear - i).toString());
      }
      values = new Array(6).fill(0);

      activeOrders.forEach(o => {
        const cleanDateStr = o.createdAt || o.date.replace(/(\d+)(st|nd|rd|th)/, '$1');
        const orderDate = new Date(cleanDateStr);
        const orderYear = orderDate.getFullYear();
        const index = labels.indexOf(orderYear.toString());
        if (index !== -1) {
          values[index] += o.numericAmount;
        }
      });
    } else {
      // Monthly
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      labels = [];
      const targetMonths: { year: number; month: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(monthNames[d.getMonth()]);
        targetMonths.push({ year: d.getFullYear(), month: d.getMonth() });
      }
      values = new Array(6).fill(0);

      activeOrders.forEach(o => {
        const cleanDateStr = o.createdAt || o.date.replace(/(\d+)(st|nd|rd|th)/, '$1');
        const orderDate = new Date(cleanDateStr);
        const y = orderDate.getFullYear();
        const m = orderDate.getMonth();
        const index = targetMonths.findIndex(t => t.year === y && t.month === m);
        if (index !== -1) {
          values[index] += o.numericAmount;
        }
      });
    }

    const maxVal = Math.max(...values, 100);
    const points = labels.map((_, idx) => {
      const x = 30 + (idx * (420 / (labels.length - 1)));
      const val = values[idx];
      const y = 185 - (val / maxVal) * 150;
      return { x, y };
    });

    let path = '';
    if (points.length > 0) {
      path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 2;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (p1.x - p0.x) / 2;
        const cpY2 = p1.y;
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
    }

    const areaPath = path 
      ? `${path} L ${points[points.length - 1].x} 200 L ${points[0].x} 200 Z`
      : '';

    const yLabels = [
      formatUSD(maxVal),
      formatUSD(maxVal * 0.75),
      formatUSD(maxVal * 0.5),
      formatUSD(maxVal * 0.25),
      '$0.00'
    ];

    return {
      labels,
      points,
      path,
      areaPath,
      yLabels
    };
  }, [orders, graphFilter]);

  return {
    timeFilter,
    setTimeFilter,
    graphFilter,
    setGraphFilter,
    products,
    orders,
    stats,
    loading,
    totalRevenue,
    totalOrders,
    totalProductCount,
    totalCustomers,
    bestProducts,
    graphData,
    revenueChange,
    ordersChange,
    productsChange,
    customersChange
  };
}
