import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    pendingProviders: 0,
    publishedListings: 0,
    activeCategories: 0,
    unreadNotifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/admin/dashboard-stats');
        if (res.data) setStats(res.data);
      } catch (err) {
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
        setIsVisible(true); 
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Fournisseurs en attente', value: stats.pendingProviders, icon: '👥', color: '#fef3c7' },
    { label: 'Annonces publiées', value: stats.publishedListings, icon: '🏠', color: '#d1fae5' },
    { label: 'Catégories actives', value: stats.activeCategories, icon: '📂', color: '#dbeafe' },
    { label: 'Notifications non lues', value: stats.unreadNotifications, icon: '🔔', color: '#fce7f3', pulse: true },
  ];

  return (
    <div className={`dashboard ${isVisible ? 'dashboard--visible' : ''}`}>
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Bienvenue sur votre espace Admin 👋</h1>
          <p className="admin-page__subtitle">Voici un aperçu de l'activité de votre plateforme</p>
        </div>
      </div>

      <div className="dashboard__stats">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`stat-card ${card.pulse && stats.unreadNotifications > 0 ? 'stat-card--pulse' : ''}`}
            style={{
              borderLeft: `4px solid ${card.color}`,
              animationDelay: `${i * 0.15}s`
            }}
          >
            <div className="stat-card__icon" style={{ backgroundColor: card.color }}>
              {card.icon}
            </div>
            <div className="stat-card__info">
              <span className="stat-card__value">
                {loading ? <span className="loader-dots">...</span> : card.value}
              </span>
              <span className="stat-card__label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
