import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './PublicLayout.css';

export default function PublicLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/',        label: 'Accueil' },
    { to: '/services', label: 'Annonces' },
    { to: '/about',   label: 'À propos' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="public-layout">

      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="header__inner">
          <Link to="/" className="header__logo">
            <img
              src="/branding/logo-horizontal.svg"
              alt="Immo Lamis"
              className="header__logo-img"
              style={{ height: '55px', width: 'auto' }}
            />
          </Link>

          <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`header__nav-link ${location.pathname === link.to ? 'header__nav-link--active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            {user ? (
              <Link
                to={user.userType === 'ADMIN' ? '/admin/dashboard' : '/provider/listings'}
                className="btn btn-primary btn-sm"
              >
                Mon Espace
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Se connecter
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Devenir fournisseur
                </Link>
              </>
            )}
          </div>

          <button
            className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT ───────────────────────────────────────── */}
      <main className="public-main">
        <Outlet />
      </main>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="footer__logo">
              <img
                src="/branding/logo-horizontal.svg"
                alt="Immo Lamis"
                className="footer__logo-img"
                style={{ height: '50px', width: 'auto', filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <p className="footer__description">
              Plateforme immobilière de confiance. Tous les biens sont vérifiés et validés par notre équipe.
            </p>
          </div>

          <div className="footer__links">
            <h4>Navigation</h4>
            <Link to="/">Accueil</Link>
            <Link to="/services">Annonces</Link>
            <Link to="/about">À propos</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer__links">
            <h4>Espace Pro</h4>
            <Link to="/register">Devenir fournisseur</Link>
            <Link to="/login">Se connecter</Link>
          </div>

          <div className="footer__links">
            <h4>Contact</h4>
            <span>contact@immolamis.com</span>
            <span>+213 555 123 456</span>
            <span>Alger, Algérie</span>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} Immo Lamis. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
