import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import './AdminProfilePage.css';

export default function AdminProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      showToast({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    if (form.newPassword.length < 4) {
      showToast({ type: 'error', message: 'Le nouveau mot de passe doit contenir au moins 4 caractères.' });
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.patch('/admin/profile/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      showToast({ type: 'success', message: res.data.message || 'Mot de passe modifié avec succès !' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast({ type: 'error', message: err.response?.data?.message || 'Erreur lors du changement de mot de passe.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-profile">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Mon Profil</h1>
          <p className="admin-page__subtitle">Gérez vos informations personnelles et votre sécurité</p>
        </div>
      </div>

      {/* Info Card - Identité (la carte reste la même, on ne touche pas à son CSS) */}
      <div className="admin-profile__info-card">
        <div className="admin-profile__avatar">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="admin-profile__details">
          <h3>{user?.firstName} {user?.lastName}</h3>
          <span className="admin-profile__role">
            {user?.isSuperAdmin ? '🛡️ Super Admin' : '👤 Admin'}
          </span>
          <span className="admin-profile__email">{user?.email}</span>
        </div>
      </div>

      {/* Section Sécurité (uniformisée) */}
      <div className="admin-section">
        <h2 className="admin-section__title">🔒 Sécurité du compte</h2>

        <form onSubmit={handleSubmit} className="admin-profile__form">
          <div className="form-group">
            <label className="form-label">Mot de passe actuel</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="••••••••"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
          </div>

          <div className="admin-profile__form-row">
            <div className="form-group">
              <label className="form-label">Nouveau mot de passe</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="Nouveau"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmation</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="Retapez le mot de passe"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn-profile-submit" disabled={loading}>
            {loading ? 'Modification en cours...' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
