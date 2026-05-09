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
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    phone: '', 
    wilaya: '', 
    commune: '', 
    quartier: '',
  });
  const [errors, setErrors] = useState({});
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
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
    const value = e.target ? e.target.value : e; // Handle both event and raw value
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (field) => (e) => {
    setErrors(prev => ({ ...prev, [field]: validateField(field, e.target.value) }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      showToast({ type: 'warning', message: 'Le fichier est trop volumineux (max 5Mo)' });
      e.target.value = '';
      return;
    }
    setDocumentFile(file);
    if (file) {
      showToast({ type: 'success', message: `Document sélectionné : ${file.name}` });
    }
  };

  const nextStep = () => {
    const newErrors = {};
    // Only validate fields relevant to step 1
    const step1Fields = ['firstName', 'lastName', 'email', 'password', 'phone', 'wilaya', 'commune'];
    step1Fields.forEach(key => {
      newErrors[key] = validateField(key, formData[key]);
    });
    
    if (Object.values(newErrors).some(err => err)) {
      setErrors(newErrors);
      showToast({ type: 'warning', message: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (documentFile) {
        data.append('document', documentFile);
      }

      const res = await register(data);
      showToast({ type: 'success', message: res.message || 'Inscription réussie ! Connexion en cours...' });
      
      // Auto-login
      const from = location.state?.from?.pathname || null;
      await login(formData.email, formData.password, from);

    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de l\'inscription';
      showToast({ type: 'error', message: msg });
      
      // If it says email already exists, go back to step 1
      if (msg.toLowerCase().includes('email')) {
        setStep(1);
        setErrors(prev => ({ ...prev, email: 'Cet email est déjà utilisé' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__left">
        <div className="auth-page__brand">
          <Link to="/" className="auth-page__logo">
            <img 
              src="/branding/logo-horizontal.svg" 
              alt="Immo Lamis" 
              style={{ height: '60px', width: 'auto', marginBottom: '1rem' }} 
            />
          </Link>
          <h1>Rejoignez-nous</h1>
          <p>Créez votre compte fournisseur et publiez vos biens immobiliers</p>
        </div>
      </div>

      <div className="auth-page__right">
        <div className="auth-form-container" style={{ maxWidth: '600px' }}>
          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); step === 1 ? nextStep() : handleSubmit(e); }}>
            <h2>Inscription Fournisseur</h2>
            <p className="auth-form__subtitle">Étape {step} sur 2</p>

            {step === 1 && (
              <div className="post-step">
                <div className="auth-form__row">
                  <div className="form-group">
                    <label className="form-label">Prénom</label>
                    <input type="text" className={`form-input ${errors.firstName ? 'form-input--error' : ''}`} placeholder="Prénom" value={formData.firstName} onChange={update('firstName')} onBlur={handleBlur('firstName')} />
                    {errors.firstName && <span className="form-error" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom</label>
                    <input type="text" className={`form-input ${errors.lastName ? 'form-input--error' : ''}`} placeholder="Nom" value={formData.lastName} onChange={update('lastName')} onBlur={handleBlur('lastName')} />
                    {errors.lastName && <span className="form-error" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.lastName}</span>}
                  </div>
                </div>

                <div className="auth-form__row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className={`form-input ${errors.email ? 'form-input--error' : ''}`} placeholder="votre@email.com" value={formData.email} onChange={update('email')} onBlur={handleBlur('email')} />
                    {errors.email && <span className="form-error" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input type="tel" className={`form-input ${errors.phone ? 'form-input--error' : ''}`} placeholder="+213 555..." value={formData.phone} onChange={update('phone')} onBlur={handleBlur('phone')} />
                    {errors.phone && <span className="form-error" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mot de passe</label>
                  <input type="password" className={`form-input ${errors.password ? 'form-input--error' : ''}`} placeholder="Min. 6 caractères" value={formData.password} onChange={update('password')} onBlur={handleBlur('password')} />
                  {errors.password && <span className="form-error" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.password}</span>}
                </div>

                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#374151' }}>Localisation</h3>
                  <LocationSelector
                    wilaya={formData.wilaya}
                    commune={formData.commune}
                    quartier={formData.quartier}
                    onWilayaChange={(val) => update('wilaya')(val)}
                    onCommuneChange={(val) => update('commune')(val)}
                    onQuartierChange={(val) => update('quartier')(val)}
                    error={errors.wilaya || errors.commune}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="post-step">
                <div className="form-group">
                  <label className="form-label">Document justificatif (Optionnel : Registre, Carte ID, etc.)</label>
                  <div className="provider-upload">
                    <label 
                      className="provider-upload__zone" 
                      style={{ 
                        cursor: 'pointer', 
                        display: 'block', 
                        padding: '2rem 1rem',
                        border: documentFile ? '2px dashed var(--color-success)' : '2px dashed var(--color-gray-300)',
                        backgroundColor: documentFile ? 'var(--color-success-50)' : 'transparent',
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>
                        {documentFile ? '✅' : '📄'}
                      </span>
                      <p style={{ fontWeight: documentFile ? 'bold' : 'normal', color: documentFile ? 'var(--color-success)' : 'inherit' }}>
                        {documentFile ? documentFile.name : 'Cliquez pour sélectionner un document (Optionnel)'}
                      </p>
                      {!documentFile && <span className="provider-upload__hint">Format PDF, JPG ou PNG. Max 5Mo.</span>}
                      {documentFile && <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', display: 'block', marginTop: '0.5rem' }}>Cliquez pour changer le document</span>}
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
              {step === 2 && (
                <button type="button" className="btn btn-outline" onClick={prevStep} disabled={loading} style={{ flex: 1 }}>
                  ← Précédent
                </button>
              )}
              
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                {step === 1 ? 'Suivant →' : (loading ? 'Création...' : 'Créer mon compte')}
              </button>
            </div>

            <p className="auth-form__footer" style={{ marginTop: '1.5rem' }}>
              Déjà un compte ? <Link to="/login">Se connecter</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
