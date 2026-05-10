import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './NotificationsPage.css';
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const typeIcon = (type) => {
    const map = {
      'NEW_PROVIDER': '👤',
      'NEW_LISTING': '🏠',
      'PROVIDER_VALIDATED': '✅',
      'PROVIDER_REJECTED': '❌',
      'CONTACT_MESSAGE': '📩',
    };
    return map[type] || '🔔';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="admin-loading">Chargement...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Notifications</h1>
          <p className="admin-page__subtitle">{unreadCount} non lue(s) sur {notifications.length}</p>
        </div>
        {unreadCount > 0 && (
          <button className="admin-btn admin-btn--outline" onClick={handleMarkAllRead}>
            ✓ Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <span className="notifications-empty__icon">🔔</span>
            <p>Aucune notification pour le moment</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-card ${!notif.isRead ? 'notification-card--unread' : ''}`}
              onClick={() => !notif.isRead && handleMarkRead(notif.id)}
            >
              <div className="notification-card__icon">{typeIcon(notif.type)}</div>
              <div className="notification-card__content">
                <p className="notification-card__message">{notif.message}</p>
                <span className="notification-card__time">
                  {new Date(notif.createdAt).toLocaleString('fr-FR')}
                </span>
              </div>
              {!notif.isRead && <div className="notification-card__dot" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
