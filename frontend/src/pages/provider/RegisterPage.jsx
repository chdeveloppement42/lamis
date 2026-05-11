import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import LocationSelector from '../../components/LocationSelector';
import './AuthPages.css';

export default function RegisterPage() {
  const { register, login, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '', 
    wilaya: '', commune: '', quartier: '',
  });
  const [errors, setErrors] = useState({});
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const target = user.userType === 'ADMIN' ? '/admin/dashboard' : '/provider/listings';
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'firstName' && !value.trim()) error = 'Prénom requis';
    if (name === 'lastName' && !value.trim()) error = 'Nom requis';
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Email invalide';
    if (name === 'password' && value.length < 6) error = 'Min. 6 caractères';
    if (name === 'phone' && !value.trim()) error = 'Téléphone requis';
    if (name === 'wilaya' && !value) error = 'Wilaya requise';
    if (name === 'commune' && !value) error = 'Commune requise';
    return error;
  };

  const update = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      showToast({ type: 'warning', message: 'Fichier trop volumineux (max 5Mo)' });
      e.target.value = '';
      return;
    }
    setDocumentFile(file);
    if (file) showToast({ type: 'success', message: `Document prêt : ${file.name}` });
  };

  const nextStep = () => {
    const newErrors = {};
    ['firstName', 'lastName', 'email', 'password', 'phone', 'wilaya', 'commune'].forEach(key => {
      newErrors[key] = validateField(key, formData[key]);
    });
    
    if (Object.values(newErrors).some(err => err)) {
      setErrors(newErrors);
      showToast({ type: 'warning', message: 'Veuillez compléter les champs obligatoires.' });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (documentFile) data.append('document', documentFile);

      const res = await register(data);
      showToast({ type: 'success', message: res.message || 'Inscription réussie !' });
      const from = location.state?.from?.pathname || null;
      await login(formData.email, formData.password, from);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de l\'inscription';
      showToast({ type: 'error', message: msg });
      if (msg.toLowerCase().includes('email')) {
        setStep(1);
        setErrors(prev => ({ ...prev, email: 'Email déjà utilisé' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="auth-container">
    {/* Ajout d'une classe spécifique register-card pour plus de contrôle */}
    <div className="auth-card register-card">
      
      <div className="auth-card__left">
        <div className="auth-visual__content">
          <Link to="/" className="auth-logo">
            <h1>Immo<span className="text-gold">Lamis</span></h1>
          </Link>
          {/* Réduction de la marge du haut de 2.5rem à 1.5rem */}
          <div className="auth-visual__main-text" style={{ marginTop: '1.5rem' }}>
            <h1>Devenez Partenaire</h1>
            <p>Rejoignez le premier réseau immobilier de référence.</p>
          </div>
        </div>
        <div className="auth-visual__footer">Propulsé par CH-PUB</div>
      </div>

      <div className="auth-card__right">
        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); step === 1 ? nextStep() : handleSubmit(e); }}>
          <div className="auth-form__header" style={{ marginBottom: '0.8rem' }}>
            <h2 style={{ fontSize: '1.4rem' }}>Inscription</h2>
            <p style={{ fontSize: '0.8rem' }}>Étape {step}/2 — {step === 1 ? 'Infos personnelles' : 'Documents'}</p>
          </div>

          {step === 1 ? (
            <div className="auth-form__groups">
              {/* Utilisation de form-row-2 pour gagner de la hauteur */}
              <div className="form-row-2">
                <div className="form-group">
                  <label>Prénom</label>
                  <input type="text" required placeholder="Ahmed" value={formData.firstName} onChange={update('firstName')} />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input type="text" required placeholder="Benali" value={formData.lastName} onChange={update('lastName')} />
                </div>
              </div>

              {/* Email et Password sur la même ligne pour gagner une ligne entière */}
              <div className="form-row-2">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" required placeholder="contact@agence.com" value={formData.email} onChange={update('email')} />
                </div>
                <div className="form-group">
                  <label>Mot de passe</label>
                  <input type="password" required placeholder="••••••••" value={formData.password} onChange={update('password')} />
                </div>
              </div>

              {/* Téléphone seul ou avec un autre champ */}
              <div className="form-group">
                <label>Téléphone</label>
                <input type="tel" required placeholder="0555..." value={formData.phone} onChange={update('phone')} />
              </div>

              {/* Le LocationSelector est souvent le plus grand, on réduit son wrapper */}
              <div className="location-box-wrapper" style={{ padding: '0.5rem', marginTop: '0.2rem' }}>
                <LocationSelector
                  wilaya={formData.wilaya}
                  commune={formData.commune}
                  quartier={formData.quartier}
                  onWilayaChange={(val) => update('wilaya')(val)}
                  onCommuneChange={(val) => update('commune')(val)}
                  onQuartierChange={(val) => update('quartier')(val)}
                />
              </div>
            </div>
          ) : (
            <div className="auth-form__groups">
              <div className="form-group">
                <label>Justificatif d'activité</label>
                {/* On réduit le padding du container d'upload */}
                <div className={`file-upload-container ${documentFile ? 'has-file' : ''}`} style={{ padding: '1rem' }}>
                  <input type="file" id="doc" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
                  <label htmlFor="doc" className="file-upload-label" style={{ fontSize: '0.75rem' }}>
                    {documentFile ? `✅ ${documentFile.name}` : '📁 CLIQUEZ ICI'}
                  </label>
                </div>
              </div>
              <p className="verification-note" style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>
                Note : Vérification par notre équipe avant validation.
              </p>
            </div>
          )}

          {/* Actions resserrées */}
          <div className="auth-actions-group" style={{ marginTop: '1rem', gap: '0.5rem' }}>
            {step === 2 && (
              <button type="button" className="auth-btn-back" onClick={() => setStep(1)} style={{ padding: '0.6rem' }}>
                Retour
              </button>
            )}
            <button type="submit" className="auth-submit-btn" disabled={loading} style={{ padding: '0.7rem' }}>
              {loading ? "..." : step === 1 ? 'Continuer' : 'Créer mon compte'}
            </button>
          </div>

          <div className="auth-form__footer" style={{ marginTop: '0.8rem' }}>
            <p style={{ fontSize: '0.8rem' }}>Déjà partenaire ? <Link to="/login" className="link-gold">Se connecter</Link></p>
          </div>
        </form>
      </div>
    </div>
  </div>
);
}