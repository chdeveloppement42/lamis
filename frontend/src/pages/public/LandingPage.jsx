import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories } from '../../api/categories.api';
import { getLatestListings } from '../../api/listings.api';
import { getPlatformStats } from '../../api/stats.api';
import ListingCard from '../../components/ListingCard';
import './LandingPage.css';

const fallbackStats = [
  { number: '500+', label: 'Biens vérifiés' },
  { number: '120+', label: 'Fournisseurs' },
  { number: '10K+', label: 'Visiteurs / mois' },
  { number: '100%', label: 'Validés par admin' },
];

const categoryIcons = {
  appartement: '🏢',
  villa: '🏡',
  bureau: '🏬',
  terrain: '🌳',
  'local-commercial': '🏪',
  entrepot: '🏭',
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [latestListings, setLatestListings] = useState([]);
  const [search, setSearch] = useState({ wilaya: '', category: '', maxPrice: '' });
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));

    getLatestListings()
      .then((data) => setLatestListings(Array.isArray(data) ? data : []))
      .catch(() => setLatestListings([]));

    getPlatformStats()
      .then(data => setPlatformStats([
        { number: `${data.activeListings || 0}+`, label: 'Biens vérifiés' },
        { number: `${data.totalProviders || 0}+`, label: 'Fournisseurs' },
        { number: `${data.citiesCovered || 0}+`, label: 'Villes couvertes' },
        { number: '100%', label: 'Validés par admin' },
      ]))
      .catch(() => setPlatformStats(fallbackStats));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.wilaya) params.set('wilaya', search.wilaya);
    if (search.category) params.set('categoryId', search.category);
    if (search.maxPrice) params.set('maxPrice', search.maxPrice);
    navigate(`/services?${params.toString()}`);
  };

  return (
    <div className="landing">
      {/* ═══ HERO ══════════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__gradient" />
          <div className="hero__pattern" />
        </div>

        <div className="container hero__content">
          <div className="hero__text animate-fade-in-up">
            <div className="hero__badge badge-gold">
              <img 
                src="/branding/verified-badge.svg" 
                alt="Vérifié" 
                style={{ height: '18px', width: 'auto', marginRight: '8px' }} 
              />
              Plateforme 100% vérifiée
            </div>
            <h1 className="hero__title">
              Trouvez votre bien
              <span className="hero__title-accent"> immobilier </span>
              en toute confiance
            </h1>
            <p className="hero__subtitle">
              Chaque bien sur Immo Lamis est vérifié et validé par notre équipe.
              Pas de fausses annonces, pas de mauvaises surprises.
            </p>

            {/* Quick Search — wired to navigate with params */}
            <form className="hero__search glass" onSubmit={handleSearch}>
              <div className="hero__search-field">
                <label>Wilaya</label>
                <input
                  type="text"
                  placeholder="Alger, Oran, Constantine..."
                  className="form-input"
                  value={search.wilaya}
                  onChange={(e) => setSearch({ ...search, wilaya: e.target.value })}
                />
              </div>
              <div className="hero__search-field">
                <label>Type de bien</label>
                <select
                  className="form-input"
                  value={search.category}
                  onChange={(e) => setSearch({ ...search, category: e.target.value })}
                >
                  <option value="">Tous les types</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="hero__search-field">
                <label>Budget max</label>
                <input
                  type="number"
                  placeholder="50 000 000 DA"
                  className="form-input"
                  value={search.maxPrice}
                  onChange={(e) => setSearch({ ...search, maxPrice: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg hero__search-btn">
                Rechercher
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═════════════════════════════════════════════ */}
      <section className="stats-bar">
        <div className="container stats-bar__inner">
          {(platformStats || fallbackStats).map((stat, i) => (
            <div key={i} className="stats-bar__item">
              <span className="stats-bar__number">{stat.number}</span>
              <span className="stats-bar__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CATEGORIES (dynamic) ════════════════════════════════ */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Explorez par catégorie</h2>
            <p className="section-subtitle">
              Trouvez exactement le type de bien qui vous correspond
            </p>
          </div>

          <div className="categories-grid">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/services?categoryId=${cat.id}`}
                className="category-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="category-card__icon">
                  {categoryIcons[cat.slug] || '🏠'}
                </span>
                <span className="category-card__name">{cat.name}</span>
                <span className="category-card__arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LATEST LISTINGS (dynamic) ═════════════════════════════ */}
      {latestListings.length > 0 && (
        <section className="section latest-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Dernières annonces</h2>
              <p className="section-subtitle">
                Les biens les plus récemment publiés sur notre plateforme
              </p>
            </div>

            <div className="latest-grid">
              {latestListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            <div className="latest-section__cta">
              <Link to="/services" className="btn btn-secondary btn-lg">
                Voir toutes les annonces →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ HOW IT WORKS ══════════════════════════════════════════ */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Comment ça marche ?</h2>
            <p className="section-subtitle">
              Un processus simple, transparent et sécurisé
            </p>
          </div>

          <div className="how-grid">
            <div className="how-card">
              <div className="how-card__number">01</div>
              <h3>Inscription Fournisseur</h3>
              <p>Les agents immobiliers s'inscrivent avec leurs documents professionnels pour vérification.</p>
            </div>
            <div className="how-card">
              <div className="how-card__number">02</div>
              <h3>Validation Admin</h3>
              <p>Notre équipe vérifie chaque profil et chaque annonce avant publication sur la plateforme.</p>
            </div>
            <div className="how-card">
              <div className="how-card__number">03</div>
              <h3>Annonces Fiables</h3>
              <p>Les visiteurs accèdent à des biens 100% vérifiés avec des photos protégées par filigrane.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══════════════════════════════════════════════════ */}
      <section className="cta-section">
        <div className="container cta-section__inner">
          <h2>Vous êtes agent immobilier ?</h2>
          <p>Rejoignez notre réseau de fournisseurs vérifiés et publiez vos annonces sur une plateforme de confiance.</p>
          <div className="cta-section__buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              Créer mon compte
            </Link>
            <Link to="/about" className="btn btn-secondary btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>
              En savoir plus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
