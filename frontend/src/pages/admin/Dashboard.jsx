import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    pendingProviders: 0,
    totalProviders: 0,
    publishedListings: 0,
    draftListings: 0,
    unpublishedListings: 0,
    totalListings: 0,
    activeCategories: 0,
    unreadNotifications: 0,
    monthlyProviders: [],
    monthlyListings: [],
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
    { label: 'Agents immobiliers en attente', value: stats.pendingProviders, icon: '👥', color: '#fef3c7' },
    { label: 'Total agents immobiliers', value: stats.totalProviders, icon: '🧑‍💼', color: '#fde68a' },
    { label: 'Annonces publiées', value: stats.publishedListings, icon: '🏠', color: '#d1fae5' },
    { label: 'Annonces brouillon', value: stats.draftListings, icon: '📝', color: '#fbcfe8' },
    { label: 'Annonces dépubliées', value: stats.unpublishedListings, icon: '🚫', color: '#fed7aa' },
    { label: 'Total annonces', value: stats.totalListings, icon: '📊', color: '#c7d2fe' },
    { label: 'Catégories actives', value: stats.activeCategories, icon: '📂', color: '#dbeafe' },
    { label: 'Notifications non lues', value: stats.unreadNotifications, icon: '🔔', color: '#fce7f3', pulse: true },
  ];

  const listingStatusData = [
    { label: 'Publiées', value: stats.publishedListings, color: '#34d399' },
    { label: 'Brouillon', value: stats.draftListings, color: '#fbbf24' },
    { label: 'Dépubliées', value: stats.unpublishedListings, color: '#f87171' },
  ];
  const listingTotal = Math.max(stats.publishedListings + stats.draftListings + stats.unpublishedListings, 1);

  const getMonthLabels = (months = 12) => {
    const labels = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' }));
    }
    return labels;
  };

  const normalizeMonthlyData = (monthlyData) => {
    const labels = getMonthLabels(12);
    const countsByMonth = monthlyData.reduce((acc, item) => {
      const [year, month] = item.month.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      const label = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
      acc[label] = item.count;
      return acc;
    }, {});

    return labels.map((label) => ({
      label,
      value: countsByMonth[label] ?? 0,
    }));
  };

  const monthlyListingData = normalizeMonthlyData(stats.monthlyListings);
  const monthlyProviderData = normalizeMonthlyData(stats.monthlyProviders);

  const totalProviders = stats.totalProviders;
  const activeProviders = Math.max(totalProviders - stats.pendingProviders, 0);
  const pendingProvidersRatio = totalProviders > 0 ? Math.round((stats.pendingProviders / totalProviders) * 100) : 0;

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

      <div className="dashboard__charts">
        <div className="chart-card">
          <div className="chart-card__header">Répartition des annonces</div>
          <div className="bar-chart">
            {listingStatusData.map((item) => (
              <div key={item.label} className="bar-row">
                <div className="bar-row__label">{item.label}</div>
                <div className="bar-row__bar-wrapper">
                  <div
                    className="bar-row__bar"
                    style={{
                      width: `${Math.round((item.value / listingTotal) * 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <div className="bar-row__value">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card chart-card--compact">
          <div className="chart-card__header">Statut des agents immobiliers</div>
          <div className="donut-chart-card">
            <div className="donut-chart">
              <svg viewBox="0 0 36 36" className="donut-chart__svg">
                <circle className="donut-chart__ring" cx="18" cy="18" r="15" />
                <circle
                  className="donut-chart__segment"
                  cx="18"
                  cy="18"
                  r="15"
                  strokeDasharray={`${pendingProvidersRatio} ${100 - pendingProvidersRatio}`}
                  strokeDashoffset="25"
                />
              </svg>
              <div className="donut-chart__label">
                <span>{pendingProvidersRatio}%</span>
                <small>En attente</small>
              </div>
            </div>
            <div className="donut-legend">
              <div className="donut-legend__item">
                <span className="donut-legend__dot" style={{ background: '#fcd34d' }} />
                <span>{stats.pendingProviders} en attente</span>
              </div>
              <div className="donut-legend__item">
                <span className="donut-legend__dot" style={{ background: '#60a5fa' }} />
                <span>{activeProviders} validés</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard__monthly">
        <div className="chart-card">
          <div className="chart-card__header">Annonces créées par mois</div>
          <div className="bar-chart">
            {monthlyListingData.map((item) => (
              <div key={item.label} className="bar-row">
                <div className="bar-row__label">{item.label}</div>
                <div className="bar-row__bar-wrapper">
                  <div
                    className="bar-row__bar"
                    style={{
                      width: `${Math.round((item.value / Math.max(...monthlyListingData.map((row) => row.value), 1)) * 100)}%`,
                      backgroundColor: '#60a5fa',
                    }}
                  />
                </div>
                <div className="bar-row__value">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card__header">Agents immobiliers inscrits par mois</div>
          <div className="bar-chart">
            {monthlyProviderData.map((item) => (
              <div key={item.label} className="bar-row">
                <div className="bar-row__label">{item.label}</div>
                <div className="bar-row__bar-wrapper">
                  <div
                    className="bar-row__bar"
                    style={{
                      width: `${Math.round((item.value / Math.max(...monthlyProviderData.map((row) => row.value), 1)) * 100)}%`,
                      backgroundColor: '#f59e0b',
                    }}
                  />
                </div>
                <div className="bar-row__value">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}