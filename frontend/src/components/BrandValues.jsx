import { PackageIcon, ShieldCheckIcon, LockIcon, TruckIcon, StarIcon, ArrowRightIcon } from './Icons';

export default function BrandValues({ onShopClick }) {
  const values = [
    {
      icon: PackageIcon,
      title: 'Curated Product Quality',
      desc: 'Carefully selected products across electronics, apparel, footwear, and everyday essentials.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Trusted Product Selection',
      desc: 'Quality-focused products from reliable categories, durable materials, and trusted manufacturers.'
    },
    {
      icon: LockIcon,
      title: 'Secure & Reliable Shopping',
      desc: 'A straightforward shopping experience with secure account handling and encrypted order processing.'
    },
    {
      icon: TruckIcon,
      title: 'Reliable Delivery',
      desc: 'Products carefully prepared for delivery with clear order tracking and dependable fulfillment service.'
    }
  ];

  return (
    <section id="values-section" className="brand-values-section" aria-labelledby="values-heading">
      <div className="values-header">
        <span className="values-badge">THE CODEALPHA DIFFERENCE</span>
        <h2 id="values-heading" className="values-title">
          Thoughtfully Curated, Engineered for Permanence.
        </h2>
        <p className="values-subtitle">
          We reject corner-cutting and mass-production shortcuts. Every item is an intentional pursuit
          of craftsmanship, material integrity, and dependable everyday performance.
        </p>
      </div>

      <div className="values-grid">
        {values.map((v, i) => {
          const IconComp = v.icon;
          return (
            <div key={i} className="value-card">
              <div className="value-icon-wrap">
                <IconComp size={22} className="value-icon" />
              </div>
              <h3 className="value-card-title">{v.title}</h3>
              <p className="value-card-desc">{v.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Verified Customer Praise Strip */}
      <div className="editorial-quote-strip">
        <div className="quote-stars" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} size={18} fill="#D96B27" className="star-filled" />
          ))}
        </div>
        <blockquote className="quote-text">
          “From the precision build quality to the seamless delivery, CodeAlpha Store delivers an exceptional
          retail experience. Every item in the collection feels thoughtfully engineered and durable.”
        </blockquote>
        <div className="quote-attribution">
          <strong>Marcus Vance</strong> &bull; Verified Customer
        </div>
      </div>

      {/* Strong Final CTA Block */}
      <div className="final-cta-banner">
        <div className="cta-banner-content">
          <span className="cta-kicker">CURATED LIFESTYLE &amp; GEAR</span>
          <h2 className="cta-banner-title">Elevate Your Everyday Essentials &amp; Lifestyle.</h2>
          <p className="cta-banner-desc">
            Explore our catalog of precision electronics, heavyweight apparel, handcrafted leather, and living objects.
            Dispatched promptly to your doorstep.
          </p>
          <button
            type="button"
            className="cta-banner-btn"
            onClick={onShopClick}
            aria-label="Browse full catalog collection"
          >
            <span>Browse Full Collection</span>
            <ArrowRightIcon size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
