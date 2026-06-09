import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Send, Loader2, Home, User, MessageSquare } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './EstimatePage.css';

export default function EstimatePage() {
  const [formData, setFormData] = useState({
    // Informations personnelles
    firstName: '',
    lastName: '',
    address: '',
    postalCode: '',
    city: '',
    phone: '',
    email: '',
    // Détails du bien
    propertyType: 'apartment',
    propertyAddress: '',
    rooms: '',
    livingArea: '',
    landArea: '',
    // Infos supplémentaires
    message: ''
  });

  const [status, setStatus] = useState({ submitted: false, error: null, loading: false });

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ ...status, loading: true, error: null });
    
    try {
      await axiosInstance.post('/estimate', formData);
      setStatus({ submitted: true, error: null, loading: false });
      setFormData({
        firstName: '', lastName: '', address: '', postalCode: '', city: '', phone: '', email: '',
        propertyType: 'apartment', propertyAddress: '', rooms: '', livingArea: '', landArea: '', message: ''
      });
      setTimeout(() => setStatus(s => ({ ...s, submitted: false })), 5000);
    } catch (err) {
      setStatus({ submitted: false, error: err.response?.data?.message || "Erreur réseau. Réessayez.", loading: false });
    }
  };

  return (
    <div className="estimate-wrapper">
      {/* --- HERO SECTION --- */}
      <section className="estimate-hero-luxe">
        <div className="hero-overlay-dark" style={{ backgroundImage: `url('/local.png')` }} />
        <div className="container hero-content-luxe" data-aos="zoom-out">
          <span className="gold-badge">Estimation Gratuite</span>
          <h1 className="massive-title">ESTIMEZ VOTRE <span className="text-gold">BIEN IMMOBILIER</span></h1>
          <p className="hero-subtitle">Obtenez une évaluation gratuite en 2 minutes. Nos experts vous recontacteront sous 24h.</p>
        </div>
      </section>

      {/* --- MAIN FORM SECTION --- */}
      <section className="estimate-main-section">
        <div className="container">
          <div className="estimate-form-container" data-aos="fade-up">
            <div className="form-header">
              <h2>Formulaire d'Estimation</h2>
              <div className="gold-divider"></div>
            </div>

            {status.submitted && <div className="success-msg">✓ Votre demande a été envoyée avec succès ! Nous vous recontacterons très bientôt.</div>}
            {status.error && <div className="error-msg">✗ {status.error}</div>}

            <form onSubmit={handleSubmit} className="estimate-form">
              
              {/* --- SECTION 1: Informations Personnelles --- */}
              <div className="form-section">
                <div className="section-header">
                  <User size={22} className="text-gold" />
                  <h3>Informations Personnelles</h3>
                </div>

                <div className="input-row-2">
                  <div className="input-group-luxe">
                    <label>Prénom *</label>
                    <input 
                      type="text" 
                      name="firstName"
                      placeholder="Ahmed"
                      value={formData.firstName}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="input-group-luxe">
                    <label>Nom *</label>
                    <input 
                      type="text" 
                      name="lastName"
                      placeholder="Benali"
                      value={formData.lastName}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                <div className="input-group-luxe">
                  <label>Adresse *</label>
                  <input 
                    type="text" 
                    name="address"
                    placeholder="123 Rue de la Paix"
                    value={formData.address}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="input-row-2">
                  <div className="input-group-luxe">
                    <label>Code Postal *</label>
                    <input 
                      type="text" 
                      name="postalCode"
                      placeholder="31000"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="input-group-luxe">
                    <label>Ville *</label>
                    <input 
                      type="text" 
                      name="city"
                      placeholder="Oran"
                      value={formData.city}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                <div className="input-row-2">
                  <div className="input-group-luxe">
                    <label>Téléphone *</label>
                    <input 
                      type="tel" 
                      name="phone"
                      placeholder="+213560938285"
                      value={formData.phone}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="input-group-luxe">
                    <label>Email *</label>
                    <input 
                      type="email" 
                      name="email"
                      placeholder="vous@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* --- SECTION 2: Détails du Bien --- */}
              <div className="form-section">
                <div className="section-header">
                  <Home size={22} className="text-gold" />
                  <h3>Détails du Bien à Estimer</h3>
                </div>

                <div className="input-group-luxe">
                  <label>Type de Bien *</label>
                  <select 
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    required
                    className="admin-input"
                  >
                    <option value="apartment">Appartement</option>
                    <option value="house">Maison</option>
                    <option value="land">Terrain</option>
                  </select>
                </div>

                <div className="input-group-luxe">
                  <label>Adresse du Bien *</label>
                  <input 
                    type="text" 
                    name="propertyAddress"
                    placeholder="Adresse complète du bien"
                    value={formData.propertyAddress}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="input-row-3">
                  <div className="input-group-luxe">
                    <label>Nombre de Pièces</label>
                    <input 
                      type="number" 
                      name="rooms"
                      placeholder="3"
                      value={formData.rooms}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                  <div className="input-group-luxe">
                    <label>Superficie Habitable (m²) *</label>
                    <input 
                      type="number" 
                      name="livingArea"
                      placeholder="120"
                      value={formData.livingArea}
                      onChange={handleChange}
                      required
                      min="1"
                      step="0.01"
                    />
                  </div>
                  <div className="input-group-luxe">
                    <label>Superficie Terrain (m²)</label>
                    <input 
                      type="number" 
                      name="landArea"
                      placeholder="300"
                      value={formData.landArea}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* --- SECTION 3: Message --- */}
              <div className="form-section">
                <div className="section-header">
                  <MessageSquare size={22} className="text-gold" />
                  <h3>Informations Supplémentaires</h3>
                </div>

                <div className="input-group-luxe">
                  <label>Message (optionnel)</label>
                  <textarea 
                    rows="5" 
                    name="message"
                    placeholder="Décrivez votre bien, travaux récents, particularités... Tout détail nous aide à mieux estimer votre bien."
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              {/* --- SUBMIT BUTTON --- */}
              <div className="form-actions">
                <button type="submit" className="btn-gold-luxe" disabled={status.loading}>
                  {status.loading ? <Loader2 className="spinner" /> : <><Send size={18} /> DEMANDER UNE ESTIMATION</>}
                </button>
              </div>

              <p className="form-notice">* Champs obligatoires</p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
