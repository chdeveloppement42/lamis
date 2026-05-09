import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import './ProviderLayout.css';

export default function ProviderLayout() {
  const location = useLocation();
  const { user, logout, setUser } = useAuth();

  // Sync provider status dynamically without forcing re-login
  useEffect(() => {
    if (user && user.userType === 'PROVIDER') {
      axiosInstance.get('/providers/profile')
        .then(res => {
          if (res.data.status && res.data.status !== user.status) {
            const updatedUser = { ...user, status: res.data.status };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        })
        .catch(() => {});
    }
  }, [location.pathname]); // sync on navigation

  // Status-based logic
  const status = user?.status || 'PENDING';
  const isPending   = status === 'PENDING';
  const isRejected  = status === 'REJECTED';
  const isSuspended = status === 'SUSPENDED';
  const isBlocked   = isPending || isRejected || isSuspended;

  const navLinks = [
    { to: '/provider/listings', label: 'Mes annonces', icon: '📋' },
    {
      to: '/provider/post',
      label: 'Publier',
      icon: isBlocked ? '📝' : '📝', // Keep consistent icon, status handled inside
      disabled: false, // Allow access to save drafts
    },
    { to: '/provider/profile', label: 'Mon profil', icon: '👤' },
  ];

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'F';

  const statusLabel =
    status === 'VALIDATED' ? 'Vérifié' :
    status === 'PENDING'   ? 'En attente' :
    'Restreint';

  return (
    <div className="provider-layout">

      {/* ─── Status Banners ──────────────────────────────────────────── */}
      <div className="provider-layout__banners">
        {isPending && (
          <div className="provider-banner provider-banner--warning">
            <div className="container">
              <span className="provider-banner__icon">⏳</span>
              <div className="provider-banner__content">
                <strong>Compte en attente de validation</strong>
                <p>Votre profil est en cours d'examen par notre équipe. La publication d'annonces sera disponible dès votre validation.</p>
              </div>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="provider-banner provider-banner--danger">
            <div className="container">
              <span className="provider-banner__icon">❌</span>
              <div className="provider-banner__content">
                <strong>Inscription rejetée</strong>
                <p>
                  Veuillez vérifier vos documents dans votre profil ou nous{' '}
                  <a href="mailto:contact@immolamis.dz" style={{ textDecoration: 'underline', fontWeight: 600 }}>
                    contacter
                  </a>.
                </p>
              </div>
            </div>
          </div>
        )}

        {isSuspended && (
          <div className="provider-banner provider-banner--danger">
            <div className="container">
              <span className="provider-banner__icon">🚫</span>
              <div className="provider-banner__content">
                <strong>Compte suspendu</strong>
                <p>Votre accès a été restreint. Veuillez contacter l'administration.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Top Bar ─────────────────────────────────────────────────── */}
      <header className="provider-header">
        <div className="provider-header__inner">
          <Link to="/" className="provider-header__logo">
            <img 
              src="/branding/logo-horizontal.svg" 
              alt="Immo Lamis" 
              className="provider-header__logo-img"
              style={{ height: '45px', width: 'auto' }}
            />
          </Link>

          <nav className="provider-header__nav">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.disabled ? '#' : link.to}
                className={[
                  'provider-header__link',
                  location.pathname === link.to ? 'provider-header__link--active' : '',
                  link.disabled ? 'provider-header__link--disabled' : '',
                ].join(' ')}
                title={link.tooltip}
                onClick={(e) => link.disabled && e.preventDefault()}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="provider-header__actions">
            <div className="provider-header__user">
              <div className="provider-header__avatar">{initials}</div>
              <div className="provider-header__user-info">
                <span className="provider-header__user-name">
                  {user?.firstName || 'Fournisseur'}
                </span>
                <span className={`provider-header__status provider-header__status--${status.toLowerCase()}`}>
                  {statusLabel}
                </span>
              </div>
            </div>
            <button
              className="provider-logout-btn"
              title="Déconnexion"
              onClick={logout}
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────────── */}
      <main className="provider-main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      {/* ─── Mobile Bottom Nav ───────────────────────────────────────── */}
      <nav className="provider-mobile-nav">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.disabled ? '#' : link.to}
            className={[
              'provider-mobile-nav__link',
              location.pathname === link.to ? 'provider-mobile-nav__link--active' : '',
              link.disabled ? 'provider-mobile-nav__link--disabled' : '',
            ].join(' ')}
            onClick={(e) => link.disabled && e.preventDefault()}
          >
            <span className="provider-mobile-nav__icon">{link.icon}</span>
            <span className="provider-mobile-nav__label">{link.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
