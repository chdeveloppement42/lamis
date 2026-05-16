import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../components/Toast';
import '../provider/AuthPages.css';

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPasswordPage() {
  const query = useQueryParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const defaultToken = query.get('token') || '';
  const defaultUserType = query.get('userType') || 'PROVIDER';

  const [token, setToken] = useState(defaultToken);
  const [userType, setUserType] = useState(defaultUserType);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    if (!token) {
      showToast({ type: 'error', message: 'Le token de réinitialisation est requis.' });
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/auth/reset-password', {
        token,
        newPassword,
        userType,
      });
      showToast({ type: 'success', message: 'Mot de passe réinitialisé avec succès.' });
      navigate('/login');
    } catch (err) {
      showToast({
        type: 'error',
        message:
          err.response?.data?.message ||
          'Impossible de réinitialiser le mot de passe. Vérifiez le lien.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="auth-card auth-card--small">
          <div className="auth-card__left">
            <div className="auth-visual__content">
              <h1>Création du nouveau mot de passe</h1>
              <p>Entrez un nouveau mot de passe pour sécuriser votre compte.</p>
            </div>
          </div>

          <div className="auth-card__right">
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form__header">
                <h2>Réinitialisation</h2>
              </div>

              <div className="auth-form__groups">
                <div className="form-group">
                  <label>Token de réinitialisation</label>
                  <input
                    type="text"
                    required
                    placeholder="Copiez le token depuis le lien"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Type de compte</label>
                  <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                    <option value="PROVIDER">Fournisseur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Nouveau mot de passe</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Confirmer le mot de passe</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Validation en cours...' : 'Valider le nouveau mot de passe'}
              </button>

              <div className="auth-form__footer" style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link to="/login" style={{ color: '#D9B48F', textDecoration: 'none' }}>
                  Retour à la connexion
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
