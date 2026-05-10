import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  UserCircle, 
  LogOut, 
  Clock, 
  AlertTriangle, 
  XCircle,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import './ProviderLayout.css';

export default function ProviderLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();

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
  }, [location.pathname, user, setUser]);

  const status = user?.status || 'PENDING';
  const isPending = status === 'PENDING';
  const isRejected = status === 'REJECTED';
  const isSuspended = status === 'SUSPENDED';

  const navLinks = [
    { to: '/provider/listings', label: 'Mes annonces', icon: <LayoutDashboard size={20} /> },
    { to: '/provider/post', label: 'Publier', icon: <PlusCircle size={20} /> },
    { to: '/provider/profile', label: 'Mon profil', icon: <UserCircle size={20} /> },
  ];

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'P';

  const statusLabel =
    status === 'VALIDATED' ? 'Vérifié' :
    status === 'PENDING' ? 'En attente' :
    'Restreint';

  return (
    <div className="provider-layout">
      {/* ─── BANNIÈRES DE STATUT ─── */}
      <div className="provider-layout__banners">
        {isPending && (
          <div className="provider-banner provider-banner--warning">
            <div className="banner-container">
              <Clock className="banner-icon" size={20} />
              <div className="banner-content">
                <strong>Compte en attente de validation</strong>
                <p>Votre profil est en cours d'examen. La publication sera disponible dès validation.</p>
              </div>
            </div>
          </div>
        )}

        {(isRejected || isSuspended) && (
          <div className="provider-banner provider-banner--danger">
            <div className="banner-container">
              {isRejected ? <XCircle size={20} /> : <AlertTriangle size={20} />}
              <div className="banner-content">
                <strong>Accès {isRejected ? 'rejeté' : 'suspendu'}</strong>
                <p>Veuillez contacter l'administration à <span className="gold-text">contact@immolamis.dz</span></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── HEADER PRINCIPAL ─── */}
      <header className="provider-header">
        <div className="provider-header__inner">
          <Link to="/" className="provider-header__logo">
  <div className="logo-wrapper">
   <div className="logo-text">
      <span className="brand-main">IMMO</span>
      <span className="brand-sub">LAMIS</span>
    </div>
  </div>
</Link>

          <nav className="provider-header__nav">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`provider-header__link ${location.pathname === link.to ? 'active' : ''}`}
              >
                <span className="link-icon">{link.icon}</span>
                <span className="link-label">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="provider-header__actions">
            <div className="provider-header__user-pill">
  <div className="user-avatar">{initials}</div>
  <div className="user-details">
    <div className="user-name-row">
      <span className="user-name">{user?.firstName}</span>
      <button className="logout-action-inline" onClick={logout} title="Déconnexion">
        <LogOut size={14} />
      </button>
    </div>
    <span className={`user-status status--${status.toLowerCase()}`}>
      {statusLabel}
    </span>
  </div>
</div>
          </div>
        </div>
      </header>

      {/* ─── CONTENU PRINCIPAL ─── */}
      <main className="provider-main-content">
        <div className="content-container">
          <Outlet />
        </div>
      </main>

      {/* ─── NAV MOBILE BOTTOM ─── */}
      <nav className="provider-mobile-nav">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`mobile-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}