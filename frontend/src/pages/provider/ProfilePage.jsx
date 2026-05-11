import React, { useState, useEffect } from 'react';
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

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
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

  const update = (field) => (valOrEvent) => {
    const value = valOrEvent?.target ? valOrEvent.target.value : valOrEvent;
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
      showToast({ type: 'error', message: err.response?.data?.message || 'Erreur.' });
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    setPwSaving(true);
    try {
      await axiosInstance.patch('/providers/profile/password', pwForm);
      showToast({ type: 'success', message: 'Mot de passe modifié !' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast({ type: 'error', message: err.response?.data?.message || 'Erreur.' });
    } finally { setPwSaving(false); }
  };

  if (loading) return <div className="provider-page loading-center"><p>Chargement du profil...</p></div>;

  return (
    <div className="provider-page">
      <header className="page-header">
        <h1>Mon Profil</h1>
        <p className="provider-page__subtitle">Gérez vos informations et la sécurité de votre compte</p>
      </header>

      <div className="provider-page__grid">
        {/* Colonne Gauche : Infos & Localisation */}
        <div className="grid-column">
          <form className="provider-card" onSubmit={handleSaveProfile}>
            <h3>👤 Informations personnelles</h3>
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
            
            <div className="location-section-box">
              <h4>📍 Localisation</h4>
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

            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>

        {/* Colonne Droite : Sécurité & Zone Sensible */}
        <div className="grid-column">
          <form className="provider-card" onSubmit={handlePasswordChange}>
            <h3>🔒 Sécurité</h3>
            <div className="form-group">
              <label className="form-label">Mot de passe actuel</label>
              <input type="password" className="form-input" required value={pwForm.currentPassword} onChange={(e) => setPwForm({...pwForm, currentPassword: e.target.value})} />
            </div>
            <div className="provider-card__row">
              <div className="form-group">
                <label className="form-label">Nouveau</label>
                <input type="password" className="form-input" required value={pwForm.newPassword} onChange={(e) => setPwForm({...pwForm, newPassword: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmer</label>
                <input type="password" className="form-input" required value={pwForm.confirmPassword} onChange={(e) => setPwForm({...pwForm, confirmPassword: e.target.value})} />
              </div>
            </div>
            <button className="btn-primary btn-outline-gold" type="submit" disabled={pwSaving}>
              {pwSaving ? 'Mise à jour...' : 'Changer le mot de passe'}
            </button>
          </form>

          <form className="provider-card provider-card--warning" onSubmit={(e) => e.preventDefault()}>
            <h3>⚠️ Données critiques</h3>
            <p className="warning-note">
              Changer votre email suspend l'activité le temps d'une nouvelle vérification.
            </p>
            <div className="form-group">
              <label className="form-label">Email : {profile?.email}</label>
              <input type="email" className="form-input" placeholder="Nouvel email" />
            </div>
            <button className="btn-danger-soft">Mettre à jour l'email</button>
          </form>
        </div>
      </div>
    </div>
  );
}