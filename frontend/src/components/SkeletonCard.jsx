export default function SkeletonCard() {
  return (
    <div className="retail-product-card skeleton-card" aria-hidden="true">
      <div className="skeleton-media-box" />
      <div className="skeleton-content">
        <div className="skeleton-rating-line" />
        <div className="skeleton-title-line" />
        <div className="skeleton-desc-line" />
        <div className="skeleton-bottom-row">
          <div className="skeleton-price-line" />
          <div className="skeleton-button-line" />
        </div>
      </div>
    </div>
  );
}
