import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Lenis from 'lenis';

import Navbar from '../components/navbar';
import '../style/impactPages.css';


import hhi from '../assets/images/impact/HHI.png';
import socialImg from '../assets/images/impact/Social.png';
import unesco from '../assets/images/impact/UNESCO.png';
import wfi from '../assets/images/impact/WFI.png';
import ycab from '../assets/images/impact/YCAB.png';
import educationImg from '../assets/images/impact/education.png';
import regenerationImg from '../assets/images/impact/regeneration.png';

const fadeInUpInitial = { opacity: 0, y: 50 };
const fadeInUpWhileInView = { opacity: 1, y: 0 };
const fadeInUpViewport = { once: true as const, margin: '-50px' };

const impactSections = [
  {
    id: 'education',
    title: 'Education',
    image: educationImg,
  },
  {
    id: 'regeneration',
    title: 'Regeneration',
    image: regenerationImg,
  },
  {
    id: 'social',
    title: 'Social',
    image: socialImg,
  },
] as const;

const ImpactPages = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="impact-page">
      <Navbar />
      <main className="impact-hero">
        <motion.h1
          className="impact-title"
          initial={fadeInUpInitial}
          whileInView={fadeInUpWhileInView}
          viewport={fadeInUpViewport}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          Preserving Culture, Honoring
          <br className="desktop-break" />
          Traditions Through Every
          <br className="desktop-break" />
          Thread Woven
        </motion.h1>

        <motion.p
          className="impact-subtitle"
          initial={fadeInUpInitial}
          whileInView={fadeInUpWhileInView}
          viewport={fadeInUpViewport}
          transition={{
            duration: 1,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        >
         A digital space dedicated to preserving the beauty of Lombok weaving traditions while connecting local artisans with modern audiences.
        </motion.p>

        <motion.button
          type="button"
          className="impact-cta"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
        >
          Discover our pillars
        </motion.button>
      </main>

      <section className="impact-sections-wrapper">

        {impactSections.map((section, index) => (
          <article
            key={section.id}
            id={section.id}
            className="impact-section impact-section--with-image"
          >
            <hr className="impact-divider" />
            <div className="impact-section__inner">
              <motion.div
                className="impact-section__text"
                initial={fadeInUpInitial}
                whileInView={fadeInUpWhileInView}
                viewport={fadeInUpViewport}
                transition={{
                  duration: 1,
                  ease: 'easeInOut',
                  delay: 0.1 * (index + 1),
                }}
              >
                <h2 className="impact-section__title">{section.title}</h2>
                <p>
                  Each pillar reflects how Larasana shows up beyond the garment—from sharing knowledge to lightening our footprint.
                </p>
                <a href={`#${section.id}`} className="impact-section__link">
                  Read more
                </a>
              </motion.div>

              <motion.div
                className="impact-section__image-wrap"
                initial={{ opacity: 0, x: index % 2 === 0 ? 60 : -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <img
                  src={section.image}
                  alt={section.title}
                  className="impact-section__image"
                  loading="lazy"
                />
              </motion.div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default ImpactPages;

