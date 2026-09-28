import { ArrowRightIcon, SparklesIcon, ShieldCheckIcon, TruckIcon } from './Icons';

export default function HeroSection({ onExploreClick, onValuesClick }) {
  return (
    <section className="editorial-hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-content-col">
          {/* Edition Tag */}
          <div className="hero-meta-bar">
            <span className="hero-edition-tag">
              <SparklesIcon size={13} className="hero-sparkle-icon" />
              CURATED EDITION &bull; 2026
            </span>
            <span className="hero-curation-note">PRECISION &bull; QUALITY &bull; ENDURING FORM</span>
          </div>

          {/* Main Headline */}
          <h1 id="hero-title" className="hero-editorial-title">
            Curated Electronics &amp; Everyday Goods Crafted for Permanence.
          </h1>

          {/* Supporting Copy */}
          <p className="hero-editorial-description">
            A thoughtfully curated collection of precision audio, computing tools, heavyweight apparel,
            and durable lifestyle essentials engineered for uncompromising quality.
          </p>

          {/* Dual Action CTAs */}
          <div className="hero-cta-group">
            <button
              type="button"
              className="hero-editorial-btn primary"
              onClick={onExploreClick}
              aria-label="Shop all products collection"
            >
              <span>Explore Collection</span>
              <ArrowRightIcon size={16} />
            </button>
            {onValuesClick && (
              <button
                type="button"
                className="hero-editorial-btn secondary"
                onClick={onValuesClick}
                aria-label="Learn about our quality standards"
              >
                <span>Our Quality Standards</span>
              </button>
            )}
          </div>

          {/* Trust Value Badges Strip */}
          <div className="hero-trust-strip" role="list">
            <div className="hero-trust-item" role="listitem">
              <ShieldCheckIcon size={16} className="trust-icon" />
              <span>100% Authenticity Guaranteed</span>
            </div>
            <div className="hero-trust-item" role="listitem">
              <TruckIcon size={16} className="trust-icon" />
              <span>Complimentary Shipping Over $75</span>
            </div>
          </div>
        </div>

        {/* Visual Hero Showcase Card */}
        <div className="hero-visual-col" aria-hidden="true">
          <div className="hero-card-showcase">
            <div className="showcase-glow" />
            <div className="showcase-card-inner">
              <div className="showcase-header">
                <span className="showcase-pill">CURATED ESSENTIAL</span>
                <span className="showcase-rating">★ 4.9 (1.2k+ Reviews)</span>
              </div>
              <div className="showcase-image-wrap">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                  alt="Precision studio headphones showcase"
                  className="showcase-img"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
              <div className="showcase-footer">
                <div className="showcase-info">
                  <span className="showcase-title">Wireless Studio Headphones</span>
                  <span className="showcase-subtitle">Active acoustic dampening &bull; 45mm neodymium drivers</span>
                </div>
                <div className="showcase-fresh-tag">Precision Engineered</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
