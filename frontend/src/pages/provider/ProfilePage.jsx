import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import LocationSelector from '../../components/LocationSelector';
import './ProviderPages.css';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  // Sensitive update state
  const [sensitiveSaving, setSensitiveSaving] = useState(false);

  useEffect(() => {
    axiosInstance.get('/providers/profile')
      .then((res) => {
        setProfile(res.data);
        if (res.data.status && res.data.status !== user.status) {
          const updatedUser = { ...user, status: res.data.status };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      })
      .catch(() => showToast({ type: 'error', message: 'Erreur lors du chargement du profil.' }))
      .finally(() => setLoading(false));
  }, []);

  const update = (field) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axiosInstance.patch('/providers/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        wilaya: profile.wilaya,
        commune: profile.commune,
        quartier: profile.quartier,
      });
      setProfile({ ...profile, ...res.data });
      showToast({ type: 'success', message: 'Profil mis à jour avec succès !' });
    } catch (err) {
      showToast({ type: 'error', message: err.response?.data?.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSensitiveUpdate = async (e) => {
    e.preventDefault();
    setSensitiveSaving(true);
    try {
      const body = {};
      if (profile.newEmail) body.email = profile.newEmail;
      const res = await axiosInstance.patch('/providers/profile/sensitive', body);
      setProfile({ ...profile, ...res.data });
      if (res.data.status && res.data.status !== user.status) {
        const updatedUser = { ...user, status: res.data.status };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      showToast({ type: 'warning', message: 'Données mises à jour. Votre compte est en attente de re-validation.' });
    } catch (err) {
      showToast({ type: 'error', message: err.response?.data?.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setSensitiveSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    setPwSaving(true);
    try {
      const res = await axiosInstance.patch('/providers/profile/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      showToast({ type: 'success', message: res.data.message || 'Mot de passe modifié avec succès !' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast({ type: 'error', message: err.response?.data?.message || 'Erreur lors du changement de mot de passe.' });
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="provider-page">
        <h1>Mon Profil</h1>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="provider-page">
      <h1>Mon Profil</h1>
      <p className="provider-page__subtitle">Gérez vos informations personnelles</p>

      <div className="provider-page__grid">
        {/* ─── Personal Info ─────────────────────────── */}
        <form className="provider-card" onSubmit={handleSaveProfile}>
          <h3>Informations personnelles</h3>
          <div className="provider-card__row">
            <div className="form-group">
              <label className="form-label">Prénom</label>
              <input type="text" className="form-input" value={profile?.firstName || ''} onChange={update('firstName')} />
            </div>
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input type="text" className="form-input" value={profile?.lastName || ''} onChange={update('lastName')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Téléphone</label>
            <input type="tel" className="form-input" value={profile?.phone || ''} onChange={update('phone')} />
          </div>
          
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#374151' }}>Localisation</h4>
            <LocationSelector
              wilaya={profile?.wilaya}
              commune={profile?.commune}
              quartier={profile?.quartier}
              onWilayaChange={(val) => update('wilaya')(val)}
              onCommuneChange={(val) => update('commune')(val)}
              onQuartierChange={(val) => update('quartier')(val)}
              required={false}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>

        {/* ─── Password Change ──────────────── */}
        <form className="provider-card" onSubmit={handlePasswordChange}>
          <h3>🔒 Changer le mot de passe</h3>

          <div className="form-group">
            <label className="form-label">Mot de passe actuel</label>
            <input type="password" className="form-input" required placeholder="••••••••"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
          </div>
          <div className="provider-card__row">
            <div className="form-group">
              <label className="form-label">Nouveau mot de passe</label>
              <input type="password" className="form-input" required placeholder="Min. 4 caractères"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmer</label>
              <input type="password" className="form-input" required placeholder="Retapez"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={pwSaving}>
            {pwSaving ? 'Modification...' : 'Modifier le mot de passe'}
          </button>
        </form>

        {/* ─── Sensitive Data ────────────────────────── */}
        <form className="provider-card provider-card--warning" onSubmit={handleSensitiveUpdate}>
          <h3>⚠️ Données sensibles</h3>
          <p className="provider-card__warning-text">
            La modification de votre email ou de votre document justificatif entraînera la suspension temporaire
            de votre compte en attente de re-validation par un administrateur.
          </p>
          <div className="form-group">
            <label className="form-label">Email actuel : {profile?.email}</label>
            <input type="email" className="form-input" placeholder="Nouvel email (optionnel)"
              value={profile?.newEmail || ''}
              onChange={(e) => setProfile({ ...profile, newEmail: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Document justificatif</label>
            <input type="file" className="form-input" />
          </div>
          <button className="btn" type="submit" style={{ background: 'var(--color-warning)', color: '#fff' }} disabled={sensitiveSaving}>
            {sensitiveSaving ? 'Enregistrement...' : 'Mettre à jour (Déclenchera une re-validation)'}
          </button>
        </form>
      </div>
    </div>
  );
}
