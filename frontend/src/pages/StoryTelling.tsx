import { Link } from "react-router-dom";
import "../style/StoryTelling.css";
import storyImg from "../assets/images/storytelling/story.png";
import impactImg from "../assets/images/storytelling/impact.png";

export default function StoryTelling() {
  return (
    <div className="storytelling-page">
      <div className="st-left-col">
        <h1 className="st-title">
          Preserving Culture, One <br />
          Thread at a Time
        </h1>
        <p className="st-description">
          Every piece of cloth tells a story of skill, soul, and tradition -
          proudly handmade for those who value
          culture and impact.
        </p>
      </div>

      <div className="st-interactive">
        <div className="st-hover-zone st-hover-zone--story">
          <span className="st-col-label st-col-label--story">STORY</span>

          <div className="st-card st-card--story">
            <img src={storyImg} alt="Story" className="st-card__img" />
            <div className="st-card__overlay">
              <div className="st-card__content">
                <h2 className="st-card__title">STORY</h2>
                <p className="st-card__subtitle">
                  Discover the world of handwoven tenun,
                  <br />
                  where every thread brings heritage
                  <br />
                  and style into your everyday life.
                </p>
                <Link to="/Story" className="st-card__cta">
                  <span className="st-card__cta-line" />
                  STORY PAGES
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="st-hover-zone st-hover-zone--impact">
          <span className="st-col-label st-col-label--impact">IMPACT</span>

          <div className="st-card st-card--impact">
            <img src={impactImg} alt="Impact" className="st-card__img" />
            <div className="st-card__overlay">
              <div className="st-card__content">
                <h2 className="st-card__title">IMPACT</h2>
                <p className="st-card__subtitle">
                  Every purchase empowers artisan communities
                  <br />
                  and keeps traditional weaving alive
                  <br />
                  for generations to come.
                </p>
                <Link to="/Impact" className="st-card__cta">
                  <span className="st-card__cta-line" />
                  IMPACT PAGES
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="st-line st-line--left" />
        <div className="st-line st-line--right" />
      </div>
    </div>
  );
}