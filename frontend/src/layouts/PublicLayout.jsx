import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './PublicLayout.css';
import { MessageCircle } from 'lucide-react';
export default function PublicLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Remet le scroll en haut à chaque navigation
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    // Évite l'avertissement ESLint (setState dans un effect synchronously)
    requestAnimationFrame(() => {
      setMenuOpen(false);
    });
  }, [location.pathname]);

  const navLinks = [
    { 
      to: '/', 
      label: 'Accueil', 
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> 
    },
    { 
      to: '/services', 
      label: 'Annonces', 
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg> 
    },
    { 
      to: '/about', 
      label: 'À propos', 
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg> 
    },
    { 
      to: '/contact', 
      label: 'Contact', 
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> 
    },
  ];

  return (
    <div className="public-layout">
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="header__inner">
          <Link to="/" className="header__logo">
            <div className="header__logo-icon">IL</div>
            <span className="header__logo-text">
              Immo<span className="header__logo-accent">Lamis</span>
            </span>
          </Link>

          <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`header__nav-link ${location.pathname === link.to ? 'header__nav-link--active' : ''}`}
              >
                <span className="nav-link-icon">{link.icon}</span>
                <span className="nav-link-label">{link.label}</span>
              </Link>
            ))}
            
            {/* Actions visibles uniquement dans le menu burger sur mobile */}
            <div className="header__mobile-actions">
              {user ? (
                 <Link to={user.userType === 'ADMIN' ? '/admin/dashboard' : '/provider/listings'} className="header__nav-link">
                    <span className="nav-link-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                    <span className="nav-link-label">Mon Espace</span>
                 </Link>
              ) : (
                <Link to="/login" className="header__nav-link">
                  <span className="nav-link-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg></span>
                  <span className="nav-link-label">Connexion</span>
                </Link>
              )}
            </div>
          </nav>

          

          <button className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__section">
            <h2 className="header__logo-text">Immo<span className="header__logo-accent">Lamis</span></h2>
            <p className="footer__description">L'excellence immobilière à Algerie. Trouvez des biens d'exception adaptés à vos exigences.</p>
          </div>
          <div className="footer__links">
            <h4>Navigation</h4>
            <Link to="/">Accueil</Link>
            <Link to="/services">Annonces</Link>
            <Link to="/about">À propos</Link>
          </div>
          <div className="footer__links">
            <h4>Support</h4>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Connexion</Link>
            
          </div>
         <div className="footer__links">
  <h4>Contact</h4>
  
  <div className="footer__item">
    📍 Oran, Algérie
  </div>
  
  <a href="tel:+213555000000" className="footer__item footer__contact-link">
    📞 +213 (0) 555 00 00 00
  </a>

  <a 
    href="https://wa.me/213555000000" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="footer__item whatsapp-footer-link"
  >
    <div className="whatsapp-icon-wrapper">
      <MessageCircle size={16} fill="currentColor" />
    </div>
    <span>WhatsApp</span>
  </a>
</div>
        <div className="footer__bottom">
          <div className="footer__bottom-content">
            <p>&copy; 2026 Immo Lamis. Tous droits réservés.</p>
            <p>Créé par le <span className="footer__credit-group">groupe de développement web ch-pub</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
