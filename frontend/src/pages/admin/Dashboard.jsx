import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingProviders: 0,
    publishedListings: 0,
    activeCategories: 0,
    unreadNotifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/admin/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Fournisseurs en attente', value: stats.pendingProviders, icon: '👥', color: '#fef3c7', to: '/admin/providers?status=PENDING' },
    { label: 'Annonces publiées', value: stats.publishedListings, icon: '🏠', color: '#d1fae5', to: '/admin/listings?status=PUBLISHED' },
    { label: 'Catégories actives', value: stats.activeCategories, icon: '📂', color: '#dbeafe', to: '/admin/categories' },
    { label: 'Notifications non lues', value: stats.unreadNotifications, icon: '🔔', color: '#fce7f3', to: '/admin/notifications' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <h1>Bienvenue sur votre espace Admin 👋</h1>
        <p>Voici un aperçu de l'activité de votre plateforme</p>
      </div>

      <div className="dashboard__stats">
        {statCards.map((card, i) => (
          <Link key={i} to={card.to} className="stat-card" style={{ borderLeftColor: card.color, textDecoration: 'none' }}>
            <div className="stat-card__icon" style={{ backgroundColor: card.color }}>{card.icon}</div>
            <div className="stat-card__info">
              <span className="stat-card__value">{loading ? '…' : card.value}</span>
              <span className="stat-card__label">{card.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="dashboard__actions">
        <h3>Actions rapides</h3>
        <div className="dashboard__actions-grid">
          <button className="dashboard__action-btn dashboard__action-btn--primary" onClick={() => navigate('/admin/providers')}>
            Gérer les fournisseurs
          </button>
          <button className="dashboard__action-btn" onClick={() => navigate('/admin/listings')}>
            Modérer les annonces
          </button>
          <button className="dashboard__action-btn" onClick={() => navigate('/admin/categories')}>
            Gérer les catégories
          </button>
        </div>
      </div>
    </div>
  );
}
