import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getListingById } from '../../api/listings.api';
import { formatPrice } from '../../utils/formatPrice';
import { getImageUrl } from '../../utils/urlUtils';
import './DetailPage.css';

export default function ListingDetail() {
  const { id } = useParams();
  const location = useLocation();
  
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

  // Navigation Clavier pour la Galerie
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!listing?.images?.length) return;
      if (e.key === 'ArrowRight') {
        setActiveImage((prev) => (prev + 1) % listing.images.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
      } else if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listing, isLightboxOpen]);

  if (loading) {
    return (
      <div className="detail-loading-wrapper">
        <div className="spinner-gold" />
        <p>Chargement de l'exception immobilière...</p>
      </div>
    );
  }

  const backPath = location.state?.fromPath || '/services';

  if (error || !listing) {
    return (
      <div className="container detail-404">
        <span className="detail-404__icon">🔍</span>
        <h2>Annonce introuvable</h2>
        <Link to="/services" className="btn-aymen-gold">Retour aux annonces</Link>
      </div>
    );
  }

  const images = listing.images || [];
  const mainImageUrl = images.length > 0 ? getImageUrl(images[activeImage].url) : null;
  const publishDate = listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('fr-FR') : '—';

  return (
    <div className="detail-page">
      {/* Fil d'Ariane Luxe */}
      <div className="detail-page__hero">
        <div className="container detail-page__breadcrumb">
          <Link to="/">Accueil</Link>
          <span className="detail-page__sep">›</span>
          <Link to={backPath}>Annonces</Link>
          <span className="detail-page__sep">›</span>
          <span className="detail-page__current">{listing.title}</span>
        </div>
      </div>

      <div className="container detail-content">
        <div className="detail-main">
          {/* Galerie avec Zoom */}
          <div className="detail-gallery">
            <div className="detail-gallery__main" onClick={() => mainImageUrl && setIsLightboxOpen(true)}>
              {mainImageUrl ? <img src={mainImageUrl} alt={listing.title} /> : <div className="placeholder-luxe">Photo non disponible</div>}
            </div>

            {images.length > 1 && (
              <div className="detail-gallery__thumbs">
                {images.map((img, i) => (
                  <button key={i} className={`detail-gallery__thumb ${i === activeImage ? 'active' : ''}`} onClick={() => setActiveImage(i)}>
                    <img src={getImageUrl(img.url)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* En-tête Titre & Prix */}
          <div className="detail-header">
            <div>
              <h1 className="detail-header__title">{listing.title}</h1>
              <div className="detail-header__location">📍 {listing.wilaya}, {listing.commune}</div>
            </div>
            <div className="detail-header__price">
              {formatPrice(listing.price)}
              {listing.type === 'LOCATION' && <span className="price-period">/ mois</span>}
            </div>
          </div>

          {/* Tableau d'informations */}
          <div className="detail-info-table">
            <h3>📋 Caractéristiques</h3>
            <table>
              <tbody>
                <tr><td className="label">Type</td><td>{listing.type}</td></tr>
                <tr><td className="label">Surface</td><td>{listing.surface} m²</td></tr>
                <tr><td className="label">Pièces</td><td>{listing.rooms || 'N/A'}</td></tr>
                <tr><td className="label">Date</td><td>{publishDate}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="detail-description">
            <h3>📝 Description</h3>
            <p>{listing.description}</p>
          </div>
        </div>

        {/* Sidebar Contact */}
        <aside className="detail-sidebar">
          <div className="detail-provider-card">
            <div className="detail-provider-card__header">
              <div className="detail-provider-card__avatar">{listing.provider?.firstName?.charAt(0)}</div>
              <div>
                <h4 className="detail-provider-card__name">{listing.provider?.firstName} {listing.provider?.lastName}</h4>
                <span className="verified-badge">✅ Partenaire Vérifié</span>
              </div>
            </div>

            {listing.provider?.phone && (
              <>
                <a href={`tel:${listing.provider.phone}`} className="btn-phone-luxe">📞 {listing.provider.phone}</a>
                <div className="social-actions">
                  <a href={`https://wa.me/${listing.provider.phone.replace(/\D/g, '')}`} target="_blank" className="social-btn whatsapp">WhatsApp</a>
                  <a href={`viber://chat?number=${listing.provider.phone.replace(/\D/g, '')}`} className="social-btn viber">Viber</a>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Lightbox Mode */}
      {isLightboxOpen && (
        <div className="detail-lightbox" onClick={() => setIsLightboxOpen(false)}>
           <img src={mainImageUrl} alt="Zoom" onClick={(e) => e.stopPropagation()} />
           <button className="close-lightbox">✕</button>
        </div>
      )}
    </div>
  );
}