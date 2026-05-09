import Skeleton from './Skeleton';

/**
 * Skeleton placeholder matching the ListingCard shape.
 * Used during loading states on LandingPage and ServicesPage.
 */
export default function ListingCardSkeleton() {
  return (
    <div className="listing-card" style={{ pointerEvents: 'none' }}>
      {/* Image area */}
      <div className="listing-card__image">
        <Skeleton width="100%" height="100%" borderRadius="0" />
      </div>

      {/* Body */}
      <div className="listing-card__body">
        {/* Title */}
        <Skeleton width="80%" height="1rem" borderRadius="0.25rem" />
        {/* Location */}
        <Skeleton width="55%" height="0.875rem" borderRadius="0.25rem" />
        {/* Footer: price + avatar */}
        <div className="listing-card__footer" style={{ borderTop: 'none' }}>
          <Skeleton width="40%" height="1.25rem" borderRadius="0.25rem" />
          <Skeleton variant="circle" size="28px" />
        </div>
      </div>
    </div>
  );
}
