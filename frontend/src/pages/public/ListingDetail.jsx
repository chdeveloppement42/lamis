import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { getListingById } from '../../api/listings.api';
import { formatPrice } from '../../utils/formatPrice';
import './DetailPage.css';

import { getImageUrl } from '../../utils/urlUtils';

export default function ListingDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getListingById(id)
      .then((data) => {
        setListing(data);
        setActiveImage(0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Keyboard Navigation for Gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!listing?.images?.length) return;
      if (e.key === 'ArrowRight') {
        setActiveImage((prev) => (prev + 1) % listing.images.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
      } else if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listing, isLightboxOpen]);

  // Loading state
  if (loading) {
    return (
      <div className="detail-page">
        <div className="detail-page__hero"><div className="container" /></div>
        <div className="container detail-loading">
          <div className="spinner" />
          <p>Chargement de l'annonce...</p>
        </div>
      </div>
    );
  }

  // Back link construction
  const backPath = location.state?.fromPath === '/services' 
    ? `/services${location.state?.fromSearch || ''}` 
    : '/services';

  // Error / 404 state
  if (error || !listing) {
    return (
      <div className="detail-page">
        <div className="detail-page__hero">
          <div className="container">
            <Link to={backPath} className="detail-page__back">← Retour aux annonces</Link>
          </div>
        </div>
        <div className="container">
          <div className="detail-404">
            <span className="detail-404__icon">🔍</span>
            <h2>Annonce introuvable</h2>
            <p>Cette annonce n'existe pas ou a été retirée de la plateforme.</p>
            <Link to={backPath} className="btn btn-primary">Voir toutes les annonces</Link>
          </div>
        </div>
      </div>
    );
  }

  const images = listing.images || [];
  const mainImageUrl = images.length > 0 && images[activeImage]
    ? getImageUrl(images[activeImage].url)
    : null;

  const publishDate = listing.createdAt
    ? new Date(listing.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  return (
    <div className="detail-page">
      {/* ─── Breadcrumb Bar ─────────────────────────────── */}
      <div className="detail-page__hero">
        <div className="container detail-page__breadcrumb">
          <Link to="/">Accueil</Link>
          <span className="detail-page__sep">›</span>
          <Link to={backPath}>Annonces</Link>
          <span className="detail-page__sep">›</span>
          {listing.category && (
            <>
              <Link to={`/services?categoryId=${listing.category.id}`}>{listing.category.name}</Link>
              <span className="detail-page__sep">›</span>
            </>
          )}
          <span className="detail-page__current">{listing.title}</span>
        </div>
      </div>

      <div className="container detail-content">
        {/* ─── Main Column ─────────────────────────────── */}
        <div className="detail-main">
          {/* Photo Gallery */}
          <div className="detail-gallery">
            <div className="detail-gallery__main" onClick={() => mainImageUrl && setIsLightboxOpen(true)} style={{ cursor: mainImageUrl ? 'zoom-in' : 'default' }}>
              {mainImageUrl ? (
                <img src={mainImageUrl} alt={listing.title} />
              ) : (
                <div className="detail-gallery__placeholder">
                  <img src="/branding/icon-house.svg" alt="House" style={{ width: '64px', height: '64px', filter: 'opacity(0.3)', marginBottom: '1rem' }} />
                  <p>Aucune photo disponible</p>
                </div>
              )}
            </div>

            {isLightboxOpen && mainImageUrl && (
              <div className="detail-lightbox" onClick={() => setIsLightboxOpen(false)}>
                <button className="detail-lightbox__close" onClick={() => setIsLightboxOpen(false)}>✕</button>
                <img src={mainImageUrl} alt={listing.title} className="detail-lightbox__img" onClick={(e) => e.stopPropagation()} />
                
                {images.length > 1 && (
                  <>
                    <button 
                      className="detail-lightbox__nav detail-lightbox__nav--prev" 
                      onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev - 1 + images.length) % images.length); }}
                    >
                      ‹
                    </button>
                    <button 
                      className="detail-lightbox__nav detail-lightbox__nav--next" 
                      onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev + 1) % images.length); }}
                    >
                      ›
                    </button>
                    <div className="detail-lightbox__counter">
                      {activeImage + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {images.length > 1 && (
              <div className="detail-gallery__thumbs">
                {images.map((img, i) => (
                  <button
                    key={img.id || i}
                    className={`detail-gallery__thumb ${i === activeImage ? 'detail-gallery__thumb--active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={getImageUrl(img.url)} alt={`Photo ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + Price */}
          <div className="detail-header">
            <div>
              <h1 className="detail-header__title">{listing.title}</h1>
              <div className="detail-header__location">
                <img src="/branding/icon-pin.svg" alt="Location" style={{ width: '18px', height: '18px', marginRight: '6px', filter: 'opacity(0.6)' }} />
                {listing.wilaya}{listing.commune ? `, ${listing.commune}` : ''}
              </div>
            </div>
            <div className="detail-header__price">
              {formatPrice(listing.price)}
              {listing.type === 'LOCATION' && <span style={{ fontSize: '0.8rem', marginLeft: '4px' }}>/ mois</span>}
            </div>
          </div>

          {/* Info Table */}
          <div className="detail-info-table">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/branding/icon-check.svg" alt="Info" style={{ width: '20px', height: '20px' }} />
              Informations de l'annonce
            </h3>
            <table>
              <tbody>
                <tr>
                  <td className="detail-info-table__label">Référence</td>
                  <td>{listing.id}</td>
                </tr>
                <tr>
                  <td className="detail-info-table__label">Transaction</td>
                  <td>
                    <span className={`detail-type-badge detail-type-badge--${listing.type?.toLowerCase() || 'vente'}`}>
                      {listing.type === 'LOCATION' ? 'Location' : 'Vente'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="detail-info-table__label">Date de publication</td>
                  <td>{publishDate}</td>
                </tr>
                {listing.category && (
                  <tr>
                    <td className="detail-info-table__label">Catégorie</td>
                    <td>{listing.category.name}</td>
                  </tr>
                )}
                <tr>
                  <td className="detail-info-table__label">Wilaya / Commune</td>
                  <td>{listing.wilaya}{listing.commune ? ` / ${listing.commune}` : ''}</td>
                </tr>
                {listing.quartier && (
                  <tr>
                    <td className="detail-info-table__label">Quartier</td>
                    <td>{listing.quartier}</td>
                  </tr>
                )}
                {listing.surface && (
                  <tr>
                    <td className="detail-info-table__label">Surface</td>
                    <td>{listing.surface} m²</td>
                  </tr>
                )}
                {listing.rooms && (
                  <tr>
                    <td className="detail-info-table__label">Pièces</td>
                    <td>{listing.rooms}</td>
                  </tr>
                )}
                {listing.floor && (
                  <tr>
                    <td className="detail-info-table__label">Étage</td>
                    <td>{listing.floor}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Description */}
          <div className="detail-description">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/branding/icon-floor.svg" alt="Description" style={{ width: '20px', height: '20px' }} />
              Description
            </h3>
            <p>{listing.description || 'Aucune description fournie.'}</p>
          </div>
        </div>

        {/* ─── Sidebar (Provider Contact) ──────────────── */}
        <aside className="detail-sidebar">
          <div className="detail-provider-card">
            <div className="detail-provider-card__header">
              <div className="detail-provider-card__avatar">
                {listing.provider?.firstName?.charAt(0) || 'F'}
              </div>
              <div>
                <h4 className="detail-provider-card__name">
                  {listing.provider?.firstName
                    ? `${listing.provider.firstName} ${listing.provider.lastName || ''}`
                    : 'Fournisseur vérifié'}
                </h4>
                {listing.provider?.status === 'VALIDATED' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <img src="/branding/verified-badge.svg" alt="Vérifié" style={{ height: '18px', width: 'auto' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-accent)' }}>Vérifié</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="detail-provider-card__info">
              <img src="/branding/icon-pin.svg" alt="Location" style={{ width: '14px', height: '14px', filter: 'opacity(0.6)' }} />
              <span>{listing.wilaya || 'Algérie'}</span>
            </div>

            {/* Phone */}
            {listing.provider?.phone && (
              <a
                href={`tel:${listing.provider.phone}`}
                className="detail-provider-card__phone"
              >
                📞 {listing.provider.phone}
              </a>
            )}

            {/* Social Contact Buttons */}
            {listing.provider?.phone && (
              <div className="detail-provider-card__socials">
                <a 
                  href={`https://wa.me/${listing.provider.phone.replace(/\D/g, '').replace(/^0/, '213')}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre annonce : ${listing.title} (${listing.price} DA) - Réf: #${listing.id}. Lien: ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn social-btn--whatsapp"
                >
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/whatsapp.svg" alt="WhatsApp" width="18" height="18" />
                  WhatsApp
                </a>
                <a 
                  href={`viber://chat?number=${listing.provider.phone.replace(/\D/g, '').replace(/^0/, '213')}&draft=${encodeURIComponent(`Bonjour, je suis intéressé par votre annonce : ${listing.title} (${listing.price} DA) - Réf: #${listing.id}. Lien: ${window.location.href}`)}`}
                  className="social-btn social-btn--viber"
                >
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/viber.svg" alt="Viber" width="18" height="18" />
                  Viber
                </a>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
