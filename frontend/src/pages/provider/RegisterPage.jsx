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

  // Redirection automatique si déjà connecté
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
      <div className="auth-card register-card">
        
        {/* Côté Gauche - Branding */}
        <div className="auth-card__left">
          <div className="auth-visual__content">
            <Link to="/" className="auth-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1>Immo<span style={{ color: '#D9B48F' }}>Lamis</span></h1>
            </Link>
            <div style={{ marginTop: '2.5rem' }}>
              <h1>Devenez Partenaire</h1>
              <p>Rejoignez le premier réseau immobilier et gérez vos biens avec des outils professionnels.</p>
            </div>
          </div>
          <div className="auth-visual__footer">
            Propulsé par CH-PUB
          </div>
        </div>

        {/* Côté Droit - Formulaire */}
        <div className="auth-card__right">
          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); step === 1 ? nextStep() : handleSubmit(e); }}>
            <div className="auth-form__header">
              <h2>Inscription</h2>
              <p>Étape {step} sur 2 — Informations {step === 1 ? 'personnelles' : 'professionnelles'}</p>
            </div>

            {step === 1 ? (
              <div className="auth-form__groups">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Prénom</label>
                    <input type="text" required placeholder="Ahmed" value={formData.firstName} onChange={update('firstName')} />
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input type="text" required placeholder="Benali" value={formData.lastName} onChange={update('lastName')} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email professionnel</label>
                  <input type="email" required placeholder="contact@agence.com" value={formData.email} onChange={update('email')} />
                  {errors.email && <span style={{ color: '#e53e3e', fontSize: '0.7rem' }}>{errors.email}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input type="tel" required placeholder="0555..." value={formData.phone} onChange={update('phone')} />
                  </div>
                  <div className="form-group">
                    <label>Mot de passe</label>
                    <input type="password" required placeholder="••••••••" value={formData.password} onChange={update('password')} />
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #edf2f7' }}>
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
                  <label>Justificatif d'activité (PDF/Image)</label>
                  <div className="file-upload-wrapper" style={{ 
                    border: '2px dashed #e2e8f0', 
                    padding: '2rem', 
                    borderRadius: '12px', 
                    textAlign: 'center',
                    background: documentFile ? '#f0fff4' : '#f8fafc'
                  }}>
                    <input type="file" id="doc" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
                    <label htmlFor="doc" style={{ cursor: 'pointer', color: '#34657F', fontWeight: '800', fontSize: '0.8rem' }}>
                      {documentFile ? `✅ ${documentFile.name}` : '📁 CLIQUER POUR AJOUTER UN DOCUMENT'}
                    </label>
                    <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>Registre de commerce ou carte d'identité (Max 5Mo)</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                  Note : Vos informations seront vérifiées par notre équipe administrative avant validation finale.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              {step === 2 && (
                <button type="button" className="auth-submit-btn" onClick={() => setStep(1)} 
                  style={{ background: '#e2e8f0', color: '#475569', flex: 1 }}>
                  Retour
                </button>
              )}
              <button type="submit" className="auth-submit-btn" disabled={loading} style={{ flex: 2 }}>
                {loading ? "Chargement..." : step === 1 ? 'Continuer →' : 'Créer mon compte'}
              </button>
            </div>

            <div className="auth-form__footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Déjà partenaire ? <Link to="/login" style={{ color: '#D9B48F', fontWeight: '700', textDecoration: 'none' }}>Se connecter</Link>
              </p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}