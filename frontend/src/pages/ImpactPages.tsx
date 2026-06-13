import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../style/impactPages.css';
import { ASSETS } from '../utils/assets';

const fadeInUpInitial = { opacity: 0, y: 50 };
const fadeInUpWhileInView = { opacity: 1, y: 0 };
const fadeInUpViewport = { once: true as const, margin: '-50px' };

const impactSections = [
  {
    id: 'education',
    title: 'Education',
    description: 'Our Mission is not only to immortalize the legacy of tenun and batik, take a look, listen, and learn the art from home!. LARASANA is designing a education program for students, teacher, family, and public everywhere and everytime!',
    image: ASSETS.impact.education,
  },
  {
    id: 'regeneration',
    title: 'Regeneration',
    description: 'To achieve our missions to immortalize the legacy of tenun and batik, we empower artisans and inspire future generations world wide, preserving culture and shaping the brighter future.',
    image: ASSETS.impact.regeneration,
  },
  {
    id: 'social',
    title: 'Social',
    description: 'Beyond our missions to immortalize the legacy of tenun and batik, we are commited to giving back to society. Through community empowerment, and sustainable opportunities. Every piece we create carries not only heritage and artistry, but also hope for a brighter future.',
    image: ASSETS.impact.social,
  },
] as const;

const partnerLogos = [
  { name: 'Wonderful Indonesia', image: ASSETS.impact.wfi },
  { name: 'Happy Hearts Indonesia', image: ASSETS.impact.hhi },
  { name: 'YCAB Ventures', image: ASSETS.impact.ycab },
  { name: 'UNESCO', image: ASSETS.impact.unesco }
] as const;

const programsData = [
  {
    category: 'Collaboration',
    title: 'LARASANA x NAUSEA',
    description: '23.05-04.10.2026',
    image: ASSETS.impact.nausea,
  },
  {
    category: 'Exhibition',
    title: 'The 10th Max Mara Art Prize for Women',
    description: '30.09-04.10.2026',
    image: ASSETS.impact.maxmara,
  },
  {
    category: 'Performance',
    title: 'Constelations | Theater Show by the Pandora',
    description: '21.11-23.11.2026',
    image: ASSETS.impact.constelation,
  },
];

const ImpactPages = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);

  // Detect device size to toggle interactions (hover for desktop, click for mobile)
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="impact-page">
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
          A digital space dedicated to preserving the beauty of Lombok weaving
          traditions while connecting local artisans with modern audiences.
        </motion.p>

        <motion.button
          type="button"
          className="impact-cta"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
        >
          <a href="/#hero-showcase" style={{ color: 'inherit', textDecoration: 'none' }}>
            Explore Our Product
          </a>
        </motion.button>
      </main>

      <section className="impact-partners" aria-label="Impact partners">
        <div className="impact-partners__track">
          {partnerLogos.map((logo, index) => (
            <img
              key={`${logo.name}-${index}`}
              src={logo.image}
              alt={logo.name}
              className={`impact-partners__logo ${logo.name === 'Wonderful Indonesia' ? 'impact-partners__logo--wi' : ''}`}
              loading="lazy"
            />
          ))}
          {/* Duplicate logos for mobile infinite marquee loop */}
          {partnerLogos.map((logo, index) => (
            <img
              key={`${logo.name}-${index}-dup`}
              src={logo.image}
              alt={logo.name}
              className={`impact-partners__logo impact-partners__logo--dup ${logo.name === 'Wonderful Indonesia' ? 'impact-partners__logo--wi' : ''}`}
              loading="lazy"
            />
          ))}
        </div>
      </section>

      <section className="impact-programs-wrapper">
        <motion.h2 
          className="impact-programs-title"
          initial={fadeInUpInitial}
          whileInView={fadeInUpWhileInView}
          viewport={fadeInUpViewport}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          Our Programs
        </motion.h2>
        <div className="impact-programs-grid">
          {programsData.map((program, idx) => (
            <motion.article 
              key={program.title}
              className="impact-program-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.1 * idx, ease: 'easeOut' }}
            >
              <div className="impact-program-card__image-wrap">
                <img src={program.image} alt={program.title} loading="lazy" />
              </div>
              <span className="impact-program-card__category">{program.category}</span>
              <h3 className="impact-program-card__title">{program.title}</h3>
              <p className="impact-program-card__desc">{program.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="impact-sections-wrapper">
        {impactSections.map((section, index) => {
          const isExpanded = !!expandedSections[section.id];
          return (
            <article
              key={section.id}
              id={section.id}
              className="impact-section impact-section--with-image"
            >
              <div className="impact-section__inner">
                <motion.div
                  className="impact-section__text"
                  onClick={() => toggleSection(section.id)}
                  style={{ cursor: isMobile ? 'pointer' : 'default' }}
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
                  <div className={`impact-section__desc-wrapper ${isExpanded ? 'is-expanded' : ''}`}>
                    <div className="impact-section__desc-inner">
                      <p className="impact-section__desc">{section.description}</p>
                    </div>
                  </div>
                  <p className="impact-section__prompt">
                    {isMobile 
                      ? (isExpanded ? 'Click to hide details' : 'Click For More Information!')
                      : 'Click for more information!'
                    }
                  </p>
                </motion.div>

                <motion.div
                  className="impact-section__image-wrap"
                  initial={{ opacity: 0, x: 60 }}
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
              {index < impactSections.length - 1 && (
                <hr className="impact-divider" />
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default ImpactPages;
