import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

    try {
      await login(email, password, from);
    } catch (err) {
      const errorMsg = err.response?.status === 401 
        ? (err.response.data.message || 'Identifiants invalides') 
        : 'Une erreur est survenue lors de la connexion.';
      
      showToast({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
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
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

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
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}