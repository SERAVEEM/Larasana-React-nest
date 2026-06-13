import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { client } from '../api/client';
import type { Product, ProductListItem } from '../types/product';
import weaverImg from '../assets/images/product/weaver_portrait.png';

export function useProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('XL');
  const [isLiked, setIsLiked] = useState(false);
  const [productList, setProductList] = useState<ProductListItem[]>([]);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [showStickyBuyBar, setShowStickyBuyBar] = useState(false);

  const prevIdRef = useRef(id);

  // Monitor scroll for mobile sticky buy bar
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
    client.get('/products')
      .then((res) => {
        setProductList(res.data.data || []);
      })
      .catch((err) => {
        console.error('Failed to load product list for navigation:', err);
      });
  }, []);

  // Fetch individual product details and check like status on id change
  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);

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

    client.get(`/products/${apiId}`)
      .then((res) => {
        if (active) {
          const p = res.data;
          const formattedPrice = '$' + Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const sizeList = p.sizes ? (typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes) : ['S', 'M', 'L', 'XL', 'XXL'];
          const imageList = p.images && p.images.length > 0
            ? p.images.map((img: any) => img.url)
            : [p.thumbnailUrl || '/images/product/far left.png'];

          setProduct({
            id: p.id.toString(),
            name: p.name,
            price: formattedPrice,
            description: p.description,
            images: imageList,
            sizes: sizeList,
            qrCode: p.qrCodeUrl || '/images/product/authenticity_qr.png',
            weaver: {
              name: p.weaverName || 'Yulia Andirtia',
              bio: p.weaverBio || 'Crafted by Yulia Andirtia from the edge of Lombok, this vest carries fragments of ancestral memory through every woven thread. Inspired by volcanic landscapes, island folklore, and starlit nights, this piece reflects the harmony between timeless heritage and contemporary elegance.',
              image: p.weaverImageUrl || weaverImg
            }
          });
          setActiveImageIndex(0);
          if (sizeList.length > 0) {
            setSelectedSize(sizeList[0]);
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
      client.get(`/favorites/check/${apiId}`)
        .then((res) => {
          if (active) {
            setIsLiked(res.data.isFavorited);
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
      if (isLiked) {
        await client.delete(`/favorites/${product.id}`);
        setIsLiked(false);
      } else {
        await client.post(`/favorites/${product.id}`);
        setIsLiked(true);
      }
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
