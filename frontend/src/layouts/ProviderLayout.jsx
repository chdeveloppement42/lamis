import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  UserCircle, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import './ProviderLayout.css';

export default function ProviderLayout() {
  const location = useLocation();
  const { user, logout, setUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const navLinks = [
    { to: '/provider/listings', label: 'Mes annonces', icon: <LayoutDashboard size={20} /> },
    { to: '/provider/post', label: 'Publier', icon: <PlusCircle size={20} /> },
    { to: '/provider/profile', label: 'Mon profil', icon: <UserCircle size={20} /> },
  ];

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'P';

  return (
    <div className="provider-layout">
      {/* ─── MOBILE SIDEBAR ─── */}
      <div className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} />
      <aside className={`mobile-sidebar ${isMenuOpen ? 'active' : ''}`}>
        <div className="sidebar-top">
          <div className="user-profile-sm">
            <div className="avatar-gold">{initials}</div>
            <span className="user-name-text">{user?.firstName}</span>
          </div>
          <button className="close-btn" onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
        </div>
        <nav className="sidebar-links">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)} className={`s-link ${location.pathname === link.to ? 'active' : ''}`}>
              {link.icon} <span>{link.label}</span>
            </Link>
          ))}
          <button className="s-link logout-danger" onClick={logout}>
            <LogOut size={20} /> <span>Déconnexion</span>
          </button>
        </nav>
      </aside>

      {/* ─── HEADER ─── */}
      <header className="p-header">
        <div className="p-header-inner">
          <div className="p-header-left">
            <button className="burger-menu" onClick={() => setIsMenuOpen(true)}>
              <Menu size={26} />
            </button>
            <Link to="/" className="p-logo">
              <img
                src="/logolamis.svg"
                alt="Immo Lamis"
                className="p-logo-image"
              />
            </Link>
          </div>

          <nav className="p-desktop-nav">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className={`p-nav-item ${location.pathname === link.to ? 'active' : ''}`}>
                {link.label}
              </Link>
            ))}
            {/* Bouton déconnexion intégré au Navbar avec texte */}
            <button className="p-nav-logout" onClick={logout}>
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </nav>

          <div className="p-user-pill desktop-only">
            <div className="avatar-gold">{initials}</div>
          </div>
        </div>
      </header>

      <main className="p-main">
        <div className="p-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
