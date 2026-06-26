import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ServiceContainer } from '../core/di/ServiceContainer';
import { ProductService } from '../core/services/ProductService';
import type { Product, ProductListItem } from '../types/product';

export function useProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const productService = ServiceContainer.resolve<ProductService>('ProductService');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Derived state: reset loading when ID changes
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setLoading(true);
  }

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('XL');
  const [isLiked, setIsLiked] = useState(false);
  const [productList, setProductList] = useState<ProductListItem[]>([]);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [showStickyBuyBar, setShowStickyBuyBar] = useState(false);

  const prevIdRef = useRef(id);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 768) {
        const mainBuyBtn = document.querySelector('.pd-buy-button');
        if (mainBuyBtn) {
          const rect = mainBuyBtn.getBoundingClientRect();
          setShowStickyBuyBar(rect.bottom < 0);
        } else {
          setShowStickyBuyBar(window.scrollY > 400);
        }
      } else {
        setShowStickyBuyBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch product list for catalog navigation on mount
  useEffect(() => {
    productService.getPublicProducts()
      .then((products) => {
        setProductList(products.map(p => ({
          id: Number(p.id),
          name: p.name,
          price: p.numericPrice
        })));
      })
      .catch((err) => {
        console.error('Failed to load product list for navigation:', err);
      });
  }, [productService]);

  // Fetch individual product details and check like status on id change
  useEffect(() => {
    if (!id) return;
    let active = true;

    if (prevIdRef.current && prevIdRef.current !== id) {
      const matchPrev = prevIdRef.current.match(/^([a-zA-Z_-]*)([0-9]+)$/);
      const matchCurrent = id.match(/^([a-zA-Z_-]*)([0-9]+)$/);
      if (matchPrev && matchCurrent) {
        const prevNum = parseInt(matchPrev[2], 10);
        const currNum = parseInt(matchCurrent[2], 10);
        if (currNum > prevNum) {
          setDirection('next');
        } else if (currNum < prevNum) {
          setDirection('prev');
        }
      }
    }
    prevIdRef.current = id;

    // Resolve string IDs to numbers for database integration compatibility
    let apiId = id;
    if (id.startsWith('grid-')) {
      apiId = id.replace('grid-', '');
    } else if (id.startsWith('p')) {
      apiId = id.replace('p', '');
    }

    productService.getProductById(apiId)
      .then((p) => {
        if (active) {
          if (p) {
            setProduct(p as any);
            setActiveImageIndex(0);
            if (p.sizes.length > 0) {
              setSelectedSize(p.sizes[0]);
            }
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch product details:', err);
        if (active) setLoading(false);
      });

    const token = localStorage.getItem('larasana_auth_token');
    if (token) {
      productService.checkFavoriteStatus(apiId)
        .then((isFavorited) => {
          if (active) {
            setIsLiked(isFavorited);
          }
        })
        .catch((err) => console.error('Failed to check favorite status:', err));
    }

    return () => {
      active = false;
    };
  }, [id]);

  const handlePrevProduct = () => {
    if (!id || productList.length === 0 || loading) return;
    const match = id.match(/^([a-zA-Z_-]*)([0-9]+)$/);
    if (!match) return;
    setDirection('prev');
    const prefix = match[1];
    const currentNumericId = parseInt(match[2], 10);
    const currentIndex = productList.findIndex((p) => p.id === currentNumericId);
    if (currentIndex === -1) {
      const prevId = Math.max(1, currentNumericId - 1);
      navigate(`/product/${prefix}${prevId}`);
      return;
    }
    const prevIndex = (currentIndex - 1 + productList.length) % productList.length;
    const prevProduct = productList[prevIndex];
    navigate(`/product/${prefix}${prevProduct.id}`);
  };

  const handleNextProduct = () => {
    if (!id || productList.length === 0 || loading) return;
    const match = id.match(/^([a-zA-Z_-]*)([0-9]+)$/);
    if (!match) return;
    setDirection('next');
    const prefix = match[1];
    const currentNumericId = parseInt(match[2], 10);
    const currentIndex = productList.findIndex((p) => p.id === currentNumericId);
    if (currentIndex === -1) {
      const nextId = currentNumericId + 1;
      navigate(`/product/${prefix}${nextId}`);
      return;
    }
    const nextIndex = (currentIndex + 1) % productList.length;
    const nextProduct = productList[nextIndex];
    navigate(`/product/${prefix}${nextProduct.id}`);
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleLikeToggle = async () => {
    const token = localStorage.getItem('larasana_auth_token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      const nextLiked = !isLiked;
      await productService.toggleFavorite(product.id, nextLiked);
      setIsLiked(nextLiked);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const isInitialLoad = loading && !product;

  return {
    id,
    product,
    loading,
    isInitialLoad,
    activeImageIndex,
    setActiveImageIndex,
    selectedSize,
    setSelectedSize,
    isLiked,
    direction,
    showStickyBuyBar,
    handlePrevProduct,
    handleNextProduct,
    handleBack,
    handleLikeToggle
  };
}
