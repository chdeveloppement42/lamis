import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../components/Toast';
import '../provider/AuthPages.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const userType = 'PROVIDER'; // Fournisseur uniquement
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [resetUrl, setResetUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axiosInstance.post('/auth/forgot-password', {
        email,
        userType,
      });

      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }

      showToast({
        type: 'success',
        message:
          'Si votre compte existe, un email de réinitialisation a été envoyé.',
      });
      if (!data.resetUrl && !data.previewUrl) {
        navigate('/login');
      }
    } catch (err) {
      showToast({
        type: 'error',
        message:
          err.response?.data?.message ||
          'Impossible d’envoyer la demande. Veuillez réessayer.',
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
              <h1>Réinitialisation du mot de passe</h1>
              <p>Entrez votre email pour recevoir un lien de réinitialisation.</p>
            </div>
          </div>

          <div className="auth-card__right">
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form__header">
                <h2>Mot de passe oublié</h2>
              </div>

              <div className="auth-form__groups">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    placeholder="nom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Demander un lien'}
              </button>

              {(resetUrl || previewUrl) && (
                <div className="auth-form__notice" style={{ marginTop: '1rem' }}>
                  <p>SMTP non configuré localement, utilisez ce lien :</p>
                  {resetUrl && (
                    <div>
                      <a href={resetUrl} target="_blank" rel="noreferrer">
                        {resetUrl}
                      </a>
                    </div>
                  )}
                  {previewUrl && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <p>Prévisualisation email :</p>
                      <a href={previewUrl} target="_blank" rel="noreferrer">
                        {previewUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}

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
