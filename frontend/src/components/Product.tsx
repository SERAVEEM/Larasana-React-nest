import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { client } from '../api/client';

import '../style/HeroShowcase.css';

type ProductCard = {
  id: string;
  image: string;
  name: string;
  price: string;
  rating: string;
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const Product: FC = () => {
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    client.get('/products')
      .then((res) => {
        if (active) {
          const rawList = res.data.data || [];
          const formatted = rawList.map((p: any) => ({
            id: p.id.toString(),
            image: p.thumbnailUrl || (p.images && p.images[0]?.url) || '/images/product/far left.png',
            name: p.name,
            price: '$' + Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            rating: p.averageRating ? Number(p.averageRating).toFixed(1) : '5.0',
          }));
          setProducts(formatted);
        }
      })
      .catch((err) => {
        console.error('Failed to load products for catalog:', err);
      });

    const token = localStorage.getItem('larasana_auth_token');
    if (token) {
      client.get('/favorites')
        .then((res) => {
          if (active) {
            const favs = res.data.data || [];
            const ids = new Set<number>(favs.map((f: any) => Number(f.productId)));
            setFavoriteIds(ids);
          }
        })
        .catch((err) => console.error('Failed to load favorites:', err));
    }

    return () => {
      active = false;
    };
  }, []);

  const handleFavoriteToggle = async (productId: number) => {
    const token = localStorage.getItem('larasana_auth_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const isFav = favoriteIds.has(productId);
      if (isFav) {
        await client.delete(`/favorites/${productId}`);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await client.post(`/favorites/${productId}`);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.add(productId);
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };
  return (
    <section className="hs-product-grid" aria-labelledby="product-heading">
      <div className="hs-bg-black">
        <motion.h2
          id="product-heading"
          className="hs-headline"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          CURATED PIECES
        </motion.h2>
        <motion.p
          className="hs-description"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
        >
          A glimpse into Larasana&apos;s signature silhouettes—crafted from Lombok tenun, finished with modern lines, and made to move with you.
        </motion.p>
      </div>

      <div className="hs-bg-white">
        <div className="hs-product-grid-inner">
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              className="hs-grid-item"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              transition={{ duration: 0.6, delay: 0.15 * index, ease: 'easeOut' }}
            >
              <Link to={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%', color: 'inherit' }}>
                <img src={product.image} alt={product.name} className="hs-grid-item-img" />
                <div 
                  className={`hs-grid-heart ${favoriteIds.has(Number(product.id)) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFavoriteToggle(Number(product.id));
                  }}
                  style={{ color: favoriteIds.has(Number(product.id)) ? '#C2A353' : '#ffffff' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={favoriteIds.has(Number(product.id)) ? '#C2A353' : 'none'} stroke="#C2A353" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div className="hs-grid-info">
                  <div className="hs-grid-info-top">
                    <h3 className="hs-grid-title">{product.name}</h3>
                    <span className="hs-grid-price">{product.price}</span>
                  </div>
                  <div className="hs-grid-rating">★ {product.rating}</div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Product;

