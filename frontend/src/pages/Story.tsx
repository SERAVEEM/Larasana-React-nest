import { motion } from 'framer-motion';
import "../style/Story.css";


import firstHero from '../assets/images/Story/First.png';
import legacyImg from '../assets/images/Story/Legacy.png';
import historyImg from '../assets/images/Story/History.png';
import storyImg from '../assets/images/Story/Story.png';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
};

const StoryPage = () => {
  return (
    <div className="story-page-container">
      <main className="story-main">
        {/* Hero Section */}
        <section className="story-hero">
          <motion.div
            className="hero-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0 }}
          >
            <h1 className="hero-title">
              <span className="title-light">VOICES OF</span> <span className="title-bold">LOMBOK</span>
            </h1>
            <p className="hero-subtitle">
              Words from the peoples that stand still with their stories, legacy, and pride to keep the tradition alive.
              Where The Time Passed away, The Voices Stood Still.
            </p>
          </motion.div>

          <motion.div
            className="hero-gallery"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2 }}
          >
            <img src={firstHero} alt="Voices of Lombok" className="hero-gallery-img" />
          </motion.div>
        </section>

        {/* Content Sections */}
        <div className="content-wrapper">
          {/* Section 1: The Legacy */}
          <motion.section className="story-section legacy-section" {...fadeInUp}>
            <div className="section-image-container">
              <img src={legacyImg} alt="The Legacy" className="section-img" />
              <p className="image-caption">Lombok, 2024</p>
            </div>
            <div className="section-text">
              <h2 className="section-title">The Legacy</h2>
              <p className="section-tagline">Every Weave is a Memory, Every Fabric a Legacy</p>
              <div className="section-desc-wrapper">
                <div className="section-desc-inner">
                  <p className="section-description">
                    From the heart of lombok, every thread carries the whispers <br />
                    of history and the spirit of its people. The artistry of weaving <br />
                    is more than craft - it is a living legacy, passed down through <br />
                    generations with devotion and pride
                    <br /><br />
                    Each piece tells a story of resilience and beauty, where <br />
                    tradition meets timeless elegance. To wear it is to honor the <br />
                    soul of lombok, embracing heritage while carrying it for tomorrow
                  </p>
                </div>
              </div>
              <span className="info-link">Click for more Information!</span>
            </div>
          </motion.section>

          {/* Section 2: The History */}
          <motion.section className="story-section history-section" {...fadeInUp}>
            <div className="section-text">
              <h2 className="section-title">The History</h2>
              <p className="section-tagline">Woven Through Time, Carried Across Generations</p>
              <div className="section-desc-wrapper">
                <div className="section-desc-inner">
                  <p className="section-description">
                    The roots of Lombok’s weaving tradition stretch back centuries
                    born from the daily lives and rituals of its people. Each thread
                    was once a symbol of survival, carrying stories of community,
                    spirituality, and resilience. Women at the looms were not only
                    artisans but also guardians of culture, ensuring that every motif
                    reflected the values and identity of their village.
                    <br /><br />
                    Over time, weaving evolved into a language of heritage —
                    patterns became markers of origin, colors spoke of nature’s
                    abundance, and fabrics embodied pride. What began as
                    necessity transformed into artistry, and today, these
                    creations stand as living testaments
                    to Lombok’s history, connecting generations through
                    beauty and devotion.
                  </p>
                </div>
              </div>
              <span className="info-link">Click for more Information!</span>
            </div>
            <div className="section-image-container">
              <img src={historyImg} alt="The History" className="section-img" />
              <p className="image-caption-history">Sayuti, 2015</p>
            </div>
          </motion.section>

          {/* Section 3: The Story */}
          <motion.section className="story-section story-info-section" {...fadeInUp}>
            <div className="section-image-container">
              <img src={storyImg} alt="The Story" className="section-img" />
              <p className="image-caption">Amaq, 2025</p>
            </div>
            <div className="section-text">
              <h2 className="section-title">The Story</h2>
              <p className="section-tagline">Every Weave is a Memory, Every Fabric a Legacy</p>
              <div className="section-desc-wrapper">
                <div className="section-desc-inner">
                  <p className="section-description">
                    From the shores of Lombok, weaving began not only as a craft
                    but as a way of life. Each loom carried the rhythm of daily rituals,
                    each thread a reflection of devotion and identity. The artisans were
                    storytellers, embedding meaning into every motif—
                    symbols of resilience, unity, and the spirit of their people.
                    <br /><br />
                    As time moved forward, weaving transformed into a voice of heritage.
                    Patterns became echoes of ancestry, colors mirrored the land and sea,
                    and fabrics embodied pride. What started as tradition grew into timeless
                    artistry, and today, every creation stands as a living story—connecting
                    past and present, carrying Lombok’s soul into tomorrow.
                  </p>
                </div>
              </div>
              <span className="info-link">Click for more Information!</span>
            </div>
          </motion.section>
        </div>

        {/* Quote Section */}
        <motion.section className="quote-section" {...fadeInUp}>
          <blockquote className="main-quote">
            "Where time kneels in silence, and<br />
            the threads carry the voices of forgotten hands."
          </blockquote>
        </motion.section>


      </main>
    </div>
  );
};

export default StoryPage;