import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Send, Loader2, Home, User } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import './EstimateFormModal.css';

export default function EstimateFormModal({ isOpen, onClose, categories = [] }) {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Page 1: Infos personnelles
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    wilaya: 'Oran',
    city: '',
    // Page 2: Détails du bien
    categoryId: '',
    categoryName: '',
    propertyAddress: '',
    rooms: '',
    livingArea: '',
    landArea: '',
    facades: '1',
    floor: '',
    hasElevator: false,
    hasPapers: 'tous',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const category = categories.find(c => String(c.id) === String(categoryId));
    setFormData(prev => ({
      ...prev,
      categoryId,
      categoryName: category?.name || ''
    }));
  };

  const handleNextPage = (e) => {
    e.preventDefault();
    
    // Validation page 1
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.wilaya) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setError(null);
    setPage(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation page 2
    if (!formData.categoryId || !formData.livingArea) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axiosInstance.post('/estimate', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        postalCode: formData.wilaya,
        city: formData.city,
        propertyType: formData.categoryName || formData.categoryId,
        propertyAddress: formData.propertyAddress,
        rooms: formData.rooms,
        livingArea: formData.livingArea,
        landArea: formData.landArea,
        facades: formData.facades,
        floor: formData.floor,
        hasElevator: formData.hasElevator,
        hasPapers: formData.hasPapers,
        message: formData.message
      });

      setSuccess(true);
      setTimeout(() => {
        handleReset();
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', address: '', 
      wilaya: 'Oran', city: '', categoryId: '', categoryName: '',
      propertyAddress: '', rooms: '', livingArea: '', landArea: '',
      facades: '1', floor: '', hasElevator: false, hasPapers: 'tous', message: ''
    });
    setPage(1);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="estimate-modal-overlay" onClick={onClose}>
      <div className="estimate-modal-content" onClick={e => e.stopPropagation()}>
        <button className="estimate-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        {success ? (
          <div className="estimate-success-screen">
            <div className="success-icon">✓</div>
            <h2>Demande Envoyée !</h2>
            <p>Merci pour votre estimation. Nous vous recontacterons rapidement.</p>
            <div className="whatsapp-prompt">
              <p>Vous pouvez aussi nous contacter directement :</p>
              <a 
                href="https://wa.me/213560938285?text=Bonjour,%20je%20souhaite%20une%20estimation%20pour%20un%20bien%20immobilier" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-whatsapp-estimate"
              >
                💬 Discuter sur WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={page === 1 ? handleNextPage : handleSubmit}>
            <div className="estimate-modal-header">
              <h2>{page === 1 ? '👤 Vos Informations' : '🏠 Détails du Bien'}</h2>
              <p>{page === 1 ? 'Page 1/2' : 'Page 2/2'}</p>
            </div>

            {error && <div className="estimate-error-msg">{error}</div>}

            <div className="estimate-form-content">
              {page === 1 ? (
                // Page 1: Informations Personnelles
                <>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Prénom *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Ahmed"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Nom *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Benali"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="vous@email.com"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Téléphone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+213560938285"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Adresse</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Rue de la Paix"
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Wilaya *</label>
                      <input
                        type="text"
                        name="wilaya"
                        value={formData.wilaya}
                        onChange={handleChange}
                        placeholder="Oran"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Ville</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Oran"
                      />
                    </div>
                  </div>
                </>
              ) : (
                // Page 2: Détails du Bien
                <>
                  <div className="form-group">
                    <label>Catégorie de bien *</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleCategoryChange}
                      required
                    >
                      <option value="">-- Sélectionnez une catégorie --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Adresse du bien</label>
                    <input
                      type="text"
                      name="propertyAddress"
                      value={formData.propertyAddress}
                      onChange={handleChange}
                      placeholder="Adresse complète du bien"
                    />
                  </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label>Nombre de pièces</label>
                      <input
                        type="number"
                        name="rooms"
                        value={formData.rooms}
                        onChange={handleChange}
                        placeholder="3"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Superficie habitable (m²) *</label>
                      <input
                        type="number"
                        name="livingArea"
                        value={formData.livingArea}
                        onChange={handleChange}
                        placeholder="120"
                        required
                        min="1"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Superficie terrain (m²)</label>
                      <input
                        type="number"
                        name="landArea"
                        value={formData.landArea}
                        onChange={handleChange}
                        placeholder="300"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label>facades</label>
                      <select name="facades" value={formData.facades} onChange={handleChange}>
                        <option value="1">1 facades</option>
                        <option value="2">2 facades</option>
                        <option value="3">3 facades</option>
                        <option value="4">4 facades</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Étage</label>
                      <input
                        type="number"
                        name="floor"
                        value={formData.floor}
                        onChange={handleChange}
                        placeholder="2"
                        min="0"
                      />
                    </div>
                    <div className="form-group checkbox-group-wrapper">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="hasElevator"
                          checked={formData.hasElevator}
                          onChange={handleChange}
                        />
                        Ascenseur
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Situation juridique (Papiers)</label>
                    <select name="hasPapers" value={formData.hasPapers} onChange={handleChange}>
                      <option value="tous">Acte Notarié + Livret Foncier</option>
                      <option value="acte_seul">Acte Notarié uniquement</option>
                      <option value="livret_seul">Livret Foncier uniquement</option>
                      <option value="aucun">En cours de régularisation / Aucun</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Message supplémentaire</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Détails supplémentaires..."
                      rows="3"
                    ></textarea>
                  </div>
                </>
              )}
            </div>

            <div className="estimate-modal-actions">
              {page === 2 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setPage(1)}
                >
                  <ArrowLeft size={18} /> Retour
                </button>
              )}
              
              {page === 1 ? (
                <button type="submit" className="btn-primary">
                  Suivant <ArrowRight size={18} />
                </button>
              ) : (
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="spinner" /> Envoi en cours...</>
                  ) : (
                    <><Send size={18} /> Demander l'estimation</>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
