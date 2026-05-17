import { motion } from "framer-motion";
import "../style/BackgroundandMissions.css";
import first from "../assets/images/About US/First.png";
import second from "../assets/images/About US/Second.png";
import fawwaz from "../assets/images/About US/Fawwaz.png";
import sheva from "../assets/images/About US/anak agung sheva.png";
import nauval from "../assets/images/About US/nauval.png";
import faruk from "../assets/images/About US/faruk.png";
import joel from "../assets/images/About US/joel.png";
import apis from "../assets/images/About US/apis.png";

const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 1.5, ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number] }
};

const staggerContainer = {
    initial: {},
    whileInView: {
        transition: {
            staggerChildren: 0.5
        }
    }
};

export default function BackgroundandMissions() {
    return (
        <div className="about-us-container">
            <motion.section 
                className="about-section"
                {...fadeInUp}
            >
                <div className="about-text">
                    <h2 className="about-title">About Us <span className="serif-text"></span></h2>
                    <div className="about-desc-wrapper">
                        <div className="about-desc-inner">
                            <p className="about-desc">
                                Founded in May 2025 by 3 college students at Binus University in Malang, we believe that there's more in Lombok than the world has seen. With our mentor helping us, LARASANA was born, dedicated to preserving the timeless art of tenun and batik while reimagining it for today's generation. Each piece is more than just fashion; it is a living legacy that connects history, soul, and modern identity.
                            </p>
                            <p className="about-desc">
                                One step at a time, we work hand in hand with local artisans, honoring their craftsmanship and ensuring that tradition continues to thrive. By blending heritage with contemporary design, LARASANA brings culture to life in a way that is stylish, meaningful, and enduring. Our mission is simple: celebrate Indonesian artistry and share it proudly with the world, while empowering women and giving back to the community.
                            </p>
                            <p className="about-desc">
                                Each collection we create is a reflection of our journey, from the hands of artisans to the hearts of those who wear it. Through thoughtful design, we want every fabric pattern and detail to carry a story of patience, culture, and pride. LARASANA is not only about creating beautiful pieces but also about building a deeper appreciation for Indonesian heritage in everyday life.
                            </p>
                            <p className="about-desc">
                                As we grow, we hope to become a bridge between tradition and the future, giving local craftsmanship a wider stage while inspiring the younger generation to see culture as something alive, relevant, and powerful. With every step forward, LARASANA remains committed to creating meaningful fashion that respects its roots, supports its makers, and carries the spirit of Lombok to the world.
                            </p>
                        </div>
                    </div>
                    <p className="about-prompt">Read Our Story!</p>
                </div>
                <div className="about-image">
                    <img src={first} alt="About Larasana" />
                </div>
            </motion.section>

            <div className="about-divider"></div>

            <motion.section 
                className="missions-section"
                {...fadeInUp}
            >
                <div className="missions-image">
                    <img src={second} alt="Larasana Missions" />
                </div>
                <div className="missions-text">
                    <h2 className="missions-title">Our Missions <span className="serif-text"></span></h2>
                    <div className="missions-desc-wrapper">
                        <div className="missions-desc-inner">
                            <p className="missions-desc">
                                <strong>LARASANA</strong> is built upon <strong>five operational pillars</strong> that guide every step of our journey, from the hands of local artisans to the world beyond Lombok. Through <strong>economic empowerment</strong>, we ensure that our craft is not only admired, but also <strong>fairly rewarded</strong>. A portion of our sales is returned to artisans through cooperative systems, supported by a simpler distribution flow and a <strong>transparent profit-sharing</strong> model that honors the people behind every thread.
                            </p>
                            <p className="missions-desc">
                                Beyond commerce, <strong>LARASANA</strong> carries a deeper responsibility: <strong>preserving culture</strong> before it fades into silence. We <strong>document and certify the authenticity</strong> of Sasak motifs, allowing each pattern to remain rooted in its origin. Through story cards, cultural trips, and village weaving workshops, every product becomes more than something to wear. It becomes a doorway into Lombok's living heritage.
                            </p>
                            <p className="missions-desc">
                                As tradition moves forward, we also open space for <strong>digital inclusion</strong>. By providing training in e-commerce, social media, and AI-powered customer service, we help local communities adapt to the modern marketplace. With the support of local coordinators, artisans are guided through <strong>digital literacy</strong>, creating new opportunities and aiming to <strong>increase their income</strong> after training.
                            </p>
                            <p className="missions-desc">
                                Innovation is also woven into <strong>LARASANA</strong>'s identity. We collaborate with consumers and designers to create new motifs, while <strong>giving artisans royalty-based passive income</strong> from their work. From tenun fabric to wallets, tote bags, bandanas, and blazers, our products are designed to carry tradition into contemporary life without losing its soul.
                            </p>
                            <p className="missions-desc">
                                Through <strong>education and community impact</strong>, <strong>LARASANA</strong> gives back to the roots that make us grow. <strong>Ten percent of our profit is dedicated to weaving training for village youth</strong>, while selected premium sales support <strong>scholarships for artisans' children</strong>. By partnering with schools, local governments, and communities in Lombok, we hope to build a future where culture is not only preserved, but inherited with pride. Together, these five pillars shape <strong>LARASANA</strong> as more than a fashion brand. It is a <strong>movement of empowerment, preservation, innovation, education, and belonging</strong>, carrying the spirit of Lombok from quiet looms to a wider world.
                            </p>
                        </div>
                    </div>
                    <p className="missions-prompt">Our Pillars</p>
                </div>
            </motion.section>

            <div className="about-divider"></div>

            <motion.section 
                className="team-intro-section"
                {...fadeInUp}
            >
                <div className="team-intro-header">
                    <div className="team-badges">
                        <span className="team-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                            </svg>
                        </span>
                        <span className="team-badge">WHO</span>
                        <span className="team-badge">WE</span>
                        <span className="team-badge">ARE</span>
                    </div>
                    <h2 className="team-main-title">The Team of <span className="serif-text">LARASANA</span></h2>
                </div>
                
                <div className="team-intro-content">
                    <div className="team-intro-left">
                        <p>Started as a project for<br />business competition</p>
                    </div>
                    <div className="team-intro-right">
                        <p>Founded in May 2025 by three BINUS University Malang students, LARASANA was born from a belief that Lombok holds untold beauty.</p>
                        <p>We preserve the timeless art of tenun and batik, while reimagining it for today's generation. Together with local artisans, we create meaningful fashion that honors craftsmanship, celebrates Indonesian heritage, and carries the spirit of Lombok to the world.</p>
                    </div>
                </div>
            </motion.section>

            <section className="team-members-section">
                <div className="team-category">
                    <motion.h3 
                        className="category-title"
                        {...fadeInUp}
                    >
                        Founder
                    </motion.h3>
                    <motion.div 
                        className="members-grid founders-grid"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <motion.div className="member-card" variants={fadeInUp}>
                            <div className="member-image"><img src={fawwaz} alt="Fawwaz Sidiq Nurseto" /></div>
                            <div className="member-info">
                                <span className="member-name">Fawwaz Sidiq Nurseto</span>
                                <span className="member-role">Founder & CTO</span>
                            </div>
                        </motion.div>
                        <motion.div className="member-card" variants={fadeInUp}>
                            <div className="member-image"><img src={sheva} alt="Anak Agung Sheva" /></div>
                            <div className="member-info">
                                <span className="member-name">Anak Agung Sheva</span>
                                <span className="member-role">Founder & CFO</span>
                            </div>
                        </motion.div>
                        <motion.div className="member-card" variants={fadeInUp}>
                            <div className="member-image"><img src={nauval} alt="Nauval Aziz R" /></div>
                            <div className="member-info">
                                <span className="member-name">Nauval Aziz R</span>
                                <span className="member-role">Founder & CEO</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                <div className="team-category">
                    <motion.h3 
                        className="category-title"
                        {...fadeInUp}
                    >
                        Dev Team
                    </motion.h3>
                    <motion.div 
                        className="members-grid dev-grid"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <motion.div className="member-card" variants={fadeInUp}>
                            <div className="member-image"><img src={fawwaz} alt="Fawwaz Sidiq Nurseto" /></div>
                            <div className="member-info">
                                <span className="member-name">Fawwaz Sidiq Nurseto</span>
                                <span className="member-role">PM, FE, UI/UX</span>
                            </div>
                        </motion.div>
                        <motion.div className="member-card" variants={fadeInUp}>
                            <div className="member-image"><img src={faruk} alt="M. Faruk" /></div>
                            <div className="member-info">
                                <span className="member-name">M. Faruk</span>
                                <span className="member-role">UI/UX Designer</span>
                            </div>
                        </motion.div>
                        <motion.div className="member-card" variants={fadeInUp}>
                            <div className="member-image"><img src={joel} alt="Joel A.S" /></div>
                            <div className="member-info">
                                <span className="member-name">Joel A.S</span>
                                <span className="member-role">BE Engineer</span>
                            </div>
                        </motion.div>
                        <motion.div className="member-card" variants={fadeInUp}>
                            <div className="member-image"><img src={apis} alt="Alfis Fathoni" /></div>
                            <div className="member-info">
                                <span className="member-name">Alfis Fathoni</span>
                                <span className="member-role">BE Engineer</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

