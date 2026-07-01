import { Link, useLocation } from 'react-router-dom';
import { getImageUrl } from '../utils/urlUtils';
import { formatPrice } from '../utils/formatPrice';
import './ListingCard.css';

export default function ListingCard({ listing }) {
  const location = useLocation();
  const {
    id,
    title,
    price,
    type,
    wilaya,
    commune,
    category,
    images = [],
    provider,
  } = listing;

  const thumbUrl = images.length > 0 ? getImageUrl(images[0].url) : null;
  
  // Si le provider existe, on prend son initiale, sinon on laisse vide pour afficher l'icône SVG
  const providerInitial = provider?.firstName?.charAt(0) || provider?.email?.charAt(0) || '';

  return (
    <Link 
      to={`/listing/${id}`} 
      state={{ fromSearch: location.search, fromPath: location.pathname }} 
      className="listing-card"
    >
      {/* Zone Image / Media */}
      <div className="listing-card__media">
        {thumbUrl ? (
          <img src={thumbUrl} alt={title} className="listing-card__img" loading="lazy" />
        ) : (
          <div className="listing-card__placeholder">
            <img src="/branding/icon-house.svg" alt="House" className="listing-card__placeholder-icon" />
          </div>
        )}

        {/* Conteneur des Badges de Type et Catégorie */}
        <div className="listing-card__badges-group">
          {type && (
            <span className={`listing-card__badge listing-card__badge--${type.toLowerCase()}`}>
              {type === 'VENTE' ? 'Vente' : 'Location'}
            </span>
          )}
          {category && (
            <span className="listing-card__badge listing-card__badge--category">
              {category.name}
            </span>
          )}
        </div>

        {/* Compteur de photos stylisé */}
        {images.length > 1 && (
          <div className="listing-card__photo-counter">
            <img src="/branding/icon-floor.svg" alt="Photos" className="listing-card__counter-icon" />
            <span>{images.length}</span>
          </div>
        )}
      </div>

      {/* Contenu de la Card */}
      <div className="listing-card__content">
        <div className="listing-card__meta">
          <div className="listing-card__location">
            <img src="/branding/icon-pin.svg" alt="Location" className="listing-card__pin-icon" />
            <span>{wilaya}{commune ? `, ${commune}` : ''}</span>
          </div>
        </div>

        <h3 className="listing-card__title">{title}</h3>

        <div className="listing-card__divider"></div>

        {/* Footer avec Prix et Profil Agent */}
        <div className="listing-card__footer">
          <div className="listing-card__price-box">
            <span className="listing-card__price-amount">{formatPrice(price)}</span>
          </div>

          <div className="listing-card__agent">
            <div className="listing-card__avatar-wrapper">
              <span className="listing-card__avatar-initial">
                {providerInitial ? (
                  providerInitial
                ) : (
                  /* Icône agent en SVG ultra-propre si les données ne sont pas chargées */
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    style={{ width: '14px', height: '14px', display: 'block' }}
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {provider?.status === 'VALIDATED' && (
                <img 
                  src="/branding/verified-badge.svg" 
                  alt="Vérifié" 
                  className="listing-card__verified-icon"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}