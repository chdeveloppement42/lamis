import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { login, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  // Redirection si déjà connecté
  useEffect(() => {
    if (user) {
      const target = from || (user.userType === 'ADMIN' ? '/admin/dashboard' : '/provider/profile');
      navigate(target, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      await login(email, password, from);
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      const message = Array.isArray(apiMessage) ? apiMessage[0] : apiMessage;
      const errorMsg = getLoginErrorMessage(err.response?.status, message);
      
      setLoginError(errorMsg);
      showToast({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const getLoginErrorMessage = (status, message) => {
    const normalizedMessage = String(message || '').toLowerCase();

    if (normalizedMessage.includes("n'existe") || normalizedMessage.includes('introuvable')) {
      return "Ce compte n'existe pas. Vérifiez votre email ou créez un compte.";
    }

    if (normalizedMessage.includes('mot de passe') || normalizedMessage.includes('password')) {
      return 'Mot de passe incorrect. Veuillez réessayer.';
    }

    if (status === 401) {
      return 'Email ou mot de passe incorrect.';
    }

    return 'Une erreur est survenue lors de la connexion. Veuillez réessayer.';
  };

  return (
    <div className="auth-page-wrapper">
      {/* SECTION IMAGE AU DÉBUT (HERO) */}
      <section className="contact-hero-luxe">
        <div className="hero-overlay-dark" style={{ backgroundImage: `url('/login.png')` }} />
        <div className="container hero-content-luxe" data-aos="zoom-out">
          <span className="gold-badge">Espace Partenaire</span>
          <h1 className="massive-title">ACCÉDEZ À <span className="text-gold">VOTRE COMPTE</span></h1>
        </div>
      </section>
    <div className="auth-container">
      <div className="auth-card">
        
        {/* Côté Gauche - Visuel Bleu Immo Lamis */}
        <div className="auth-card__left">
          <div className="auth-visual__content">
            <Link to="/" className="auth-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1>Immo<span style={{ color: '#D9B48F' }}>Lamis</span></h1>
            </Link>
            <div style={{ marginTop: '2.5rem' }}>
              <h1>Ravis de vous revoir !</h1>
              <p>Gérez vos annonces et développez votre activité sur la plateforme immobilière de référence.</p>
            </div>
          </div>
          <div className="auth-visual__footer">
            © {new Date().getFullYear()} Immo Lamis — CH-PUB
          </div>
        </div>

        {/* Côté Droit - Formulaire Blanc Épuré */}
        <div className="auth-card__right">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__header">
              <h2>Connexion</h2>
              <p>Entrez vos accès pour accéder au tableau de bord</p>
            </div>

            <div className="auth-form__groups">
              <div className="form-group">
                <label>Email professionnel</label>
                <input
                  type="email"
                  required
                  placeholder="nom@exemple.com"
                  value={email}
                  aria-invalid={Boolean(loginError)}
                  aria-describedby={loginError ? 'login-error' : undefined}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLoginError('');
                  }}
                />
              </div>

              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  aria-invalid={Boolean(loginError)}
                  aria-describedby={loginError ? 'login-error' : undefined}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError('');
                  }}
                />
              </div>
            </div>

            {loginError && (
              <div id="login-error" className="auth-error" role="alert">
                {loginError}
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Authentification..." : 'Se connecter au compte'}
            </button>

            <div className="auth-form__footer" style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Pas encore de compte ?
              </p>
              <Link to="/register" style={{ color: '#D9B48F', fontWeight: '700', textDecoration: 'none' }}>
                Devenir fournisseur partenaire
              </Link>
              <div style={{ marginTop: '0.8rem' }}>
                <Link to="/forgot-password" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
    </div>
  );
}
