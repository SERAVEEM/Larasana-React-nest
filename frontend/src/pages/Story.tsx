import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
import { Link } from 'react-router-dom';
import "../style/Story.css";
import logo from '../assets/images/Logo.png';
import firstLeftTop from '../assets/images/Story/First Left Top.png';
import firstRight from '../assets/images/Story/First Right.png';
import layeredLeft from '../assets/images/Story/Layered Left.png';
import leftBottom from '../assets/images/Story/Left bottom.png';
import midPicture from '../assets/images/Story/Mid picture.png';
import rightBottom from '../assets/images/Story/Right Bottom.png';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" }
};

const StoryPage: React.FC = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical', // vertical, horizontal
      gestureDirection: 'vertical', // vertical, horizontal
      smooth: true,
      mouseMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
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
    <div className="story-page">

      {/* Story Content Wrapper */}
      <div className="story-content">
        
        {/* Section 1: Hero Quote and Line */}
        <motion.section 
          className="section section-1"
          {...fadeInUp}
        >
          <div className="hero-quote-wrapper">
            <div className="hero-quote-left">
              <h1 className="hero-quote-text">"Where time</h1>
              <h1 className="hero-quote-text">and threads</h1>
            </div>
            
            <div className="line-divider">
              <div className="line-dot"></div>
            </div>

            <div className="hero-quote-right">
              <h1 className="hero-quote-text">Stands still,</h1>
              <h1 className="hero-quote-text">Speak."</h1>
            </div>
          </div>
        </motion.section>

        {/* Section 2: Story Introduction */}
        <motion.section 
          className="section section-2"
          {...fadeInUp}
        >
          <div className="story-intro-container">
            {/* Left Images */}
            <div className="intro-images-left">
              <div className="image-wrapper-large">
                <img src={firstLeftTop} alt="Lombok Landscape" />
              </div>
              <div className="image-wrapper-small">
                <img src={layeredLeft} alt="Lombok Detail" />
              </div>
            </div>

            {/* Centered Text */}
            <div className="intro-content">
              <h2 className="intro-title">
                FROM THE LAND LOMBOK,<br />
                HISTORY, SOUL, AND LEGACY<br />
                ARE MEANT TO BE<br />
                REMEMBERED
              </h2>
              <p className="intro-tagline">Every Weave is a Memory, Every Fabric a Legacy</p>
              
              <div className="intro-description">
                <p>
                  From the heart of lombok, every thread carries the whispers 
                  of history and the spirit of its people. The artistry of weaving 
                  is more than craft - it is a living legacy, passed down through 
                  generations with devotion and pride
                </p>
                <p>
                  Each piece tells a story of resilience and beauty, where tradition 
                  meets timeless elegance. To wear it is to honor the soul of lombok, 
                  embracing heritage while carrying it for tomorrow
                </p>
              </div>

              <Link to="/#hero-showcase" className="explore-btn">
                Explore Our Collection
              </Link>
            </div>

            {/* Right Image */}
            <div className="intro-images-right">
              <div className="image-wrapper-large">
                <img src={firstRight} alt="Lombok Weaver" />
              </div>
            </div>
          </div>

          {/* Vertical line continuing below */}
          <div className="line-divider secondary-line"></div>
        </motion.section>
      </div>

    </div>
  );
};

export default StoryPage;