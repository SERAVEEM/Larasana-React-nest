import type { FC } from 'react';
import { motion } from 'framer-motion';

import firstImg from '../assets/images/product/first.png';
import secondImg from '../assets/images/product/second.png';
import thirdImg from '../assets/images/product/third.png';
import fourthImg from '../assets/images/product/fourth.png';
import fifthImg from '../assets/images/product/fifth.png';

import '../style/HeroShowcase.css';

type ProductCard = {
  id: string;
  image: string;
  name: string;
  price: string;
  rating: string;
};

const PRODUCTS: ProductCard[] = [
  { id: 'p1', image: firstImg, name: 'Noir Enchanted Vest', price: '$250', rating: '4.5' },
  { id: 'p2', image: secondImg, name: 'Anchronic Vest', price: '$260', rating: '4.5' },
  { id: 'p3', image: thirdImg, name: 'Noir Enchanted Vest', price: '$400', rating: '5.0' },
  { id: 'p4', image: fourthImg, name: 'Larasana Signature', price: '$350', rating: '4.8' },
  { id: 'p5', image: fifthImg, name: 'Tenun Classic', price: '$200', rating: '4.2' }
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const Product: FC = () => {
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
          {PRODUCTS.map((product, index) => (
            <motion.article
              key={product.id}
              className="hs-grid-item"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              transition={{ duration: 0.6, delay: 0.15 * index, ease: 'easeOut' }}
            >
              <img src={product.image} alt={product.name} className="hs-grid-item-img" />
              <div className="hs-grid-info">
                <div className="hs-grid-info-top">
                  <h3 className="hs-grid-title">{product.name}</h3>
                  <span className="hs-grid-price">{product.price}</span>
                </div>
                <div className="hs-grid-rating">★ {product.rating}</div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Product;

