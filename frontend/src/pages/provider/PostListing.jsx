import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import axiosInstance from '../../api/axiosInstance';
import { getCategories } from '../../api/categories.api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import LocationSelector from '../../components/LocationSelector';
import './ProviderPages.css';

export default function PostListing() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [listing, setListing] = useState({
    title: '', 
    description: '', 
    price: '', 
    type: 'VENTE',
    wilaya: '', 
    commune: '', 
    quartier: '', 
    surface: '',
    rooms: '',
    floor: '',
    categoryId: '', 
    status: 'DRAFT',
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [step, setStep] = useState(1);

  const isValidated = user?.status === 'VALIDATED';

  useEffect(() => {
    if (user && user.status !== 'VALIDATED') {
      showToast({ type: 'info', message: 'Note : Votre compte est en attente de validation. Vous pouvez préparer vos annonces en brouillon.' });
      // Remove navigate - allow staying on page
    }
  }, [user]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const update = (field) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setListing(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const options = {
      maxSizeMB: 0.8, // 800KB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp'
    };

    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          const compressedFile = await imageCompression(file, options);
          return compressedFile;
        })
      );
      setImages((prev) => [...prev, ...compressedFiles]);
    } catch (error) {
      console.error('Error compressing images:', error);
      showToast({ type: 'error', message: 'Erreur lors de la compression des images.' });
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!listing.title || !listing.description || !listing.price || !listing.categoryId) {
        showToast({ type: 'warning', message: 'Veuillez remplir tous les champs de cette étape.' });
        return false;
      }
    }
    if (currentStep === 2) {
      if (!listing.wilaya || !listing.commune) {
        showToast({ type: 'warning', message: 'Veuillez remplir les champs obligatoires de localisation (Wilaya et Commune).' });
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e, finalStatus = 'DRAFT') => {
    e.preventDefault();
    
    if (finalStatus === 'PUBLISHED' && !isValidated) {
      showToast({ type: 'warning', message: 'Votre compte doit être validé par un administrateur avant de pouvoir publier des annonces.' });
      return;
    }

    if (finalStatus === 'PUBLISHED' && images.length === 0) {
      showToast({ type: 'warning', message: 'Veuillez ajouter au moins une image pour publier.' });
      return;
    }

    setUploading(true);

    try {
      let imageUrls = [];

      // 1. Upload images if present
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((image) => {
          formData.append('images', image, image.name.replace(/\.[^/.]+$/, "") + ".webp");
        });

        const mediaRes = await axiosInstance.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        imageUrls = mediaRes.data.urls;
      }

      // 2. Submit listing data with URLs
      const payload = {
        ...listing,
        status: finalStatus,
        price: parseFloat(listing.price),
        surface: listing.surface ? parseFloat(listing.surface) : undefined,
        rooms: listing.rooms ? parseInt(listing.rooms, 10) : undefined,
        floor: listing.floor ? parseInt(listing.floor, 10) : undefined,
        categoryId: parseInt(listing.categoryId, 10),
        images: imageUrls,
      };

      await axiosInstance.post('/listings', payload);
      
      const successMsg = finalStatus === 'DRAFT' 
        ? 'Brouillon sauvegardé avec succès !' 
        : `Annonce "${listing.title}" créée avec succès !`;
        
      showToast({ type: 'success', message: successMsg });
      
      // Reset form
      setListing({ title: '', description: '', price: '', type: 'VENTE', wilaya: '', commune: '', quartier: '', surface: '', rooms: '', floor: '', categoryId: '', status: 'DRAFT' });
      setImages([]);
      setStep(1);
    } catch (error) {
      console.error('Error submitting listing:', error);
      const msg = error.response?.data?.message || 'Erreur lors de la création de l\'annonce.';
      showToast({ type: 'error', message: msg });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="provider-page">
      <h1>Publier une annonce</h1>
      <p className="provider-page__subtitle">Étape {step} sur 3</p>

      {!isValidated && (
        <div className="admin-badge admin-badge--warning" style={{ marginBottom: '1.5rem', width: '100%', padding: '1rem', whiteSpace: 'normal', lineHeight: '1.5' }}>
          ⚠️ Votre compte est en attente de validation. Vous pouvez sauvegarder des brouillons, mais vous ne pourrez pas publier tant qu'un administrateur n'aura pas validé votre profil.
        </div>
      )}

      {/* Progress Bar */}
      <div className="post-progress">
        <div className={`post-progress__step ${step >= 1 ? 'post-progress__step--active' : ''}`}>1. Informations générales</div>
        <div className={`post-progress__step ${step >= 2 ? 'post-progress__step--active' : ''}`}>2. Localisation</div>
        <div className={`post-progress__step ${step >= 3 ? 'post-progress__step--active' : ''}`}>3. Médias</div>
      </div>

      <div className="provider-card">
        {step === 1 && (
          <div className="post-step">
            <div className="form-group">
              <label className="form-label">Titre de l'annonce</label>
              <input type="text" className="form-input" placeholder="Ex: Appartement F3 lumineux" value={listing.title} onChange={update('title')} />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows="5" placeholder="Décrivez votre bien en détail..." value={listing.description} onChange={update('description')} style={{ resize: 'vertical' }} />
            </div>

            <div className="provider-card__row">
              <div className="form-group">
                <label className="form-label">Type d'annonce</label>
                <select className="form-input" value={listing.type} onChange={update('type')}>
                  <option value="VENTE">Vente</option>
                  <option value="LOCATION">Location</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select className="form-input" value={listing.categoryId} onChange={update('categoryId')}>
                  <option value="">Sélectionner...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="provider-card__row">
              <div className="form-group">
                <label className="form-label">Prix (DA)</label>
                <input type="number" className="form-input" placeholder="12 000 000" value={listing.price} onChange={update('price')} />
              </div>
              <div className="form-group">
                <label className="form-label">Surface (m²) <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.7 }}>(optionnel)</span></label>
                <input type="number" className="form-input" placeholder="85" value={listing.surface} onChange={update('surface')} />
              </div>
            </div>

            <div className="provider-card__row">
              <div className="form-group">
                <label className="form-label">Pièces <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.7 }}>(optionnel)</span></label>
                <input type="number" className="form-input" placeholder="3" value={listing.rooms} onChange={update('rooms')} />
              </div>
              <div className="form-group">
                <label className="form-label">Étage <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.7 }}>(optionnel)</span></label>
                <input type="number" className="form-input" placeholder="2" value={listing.floor} onChange={update('floor')} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="post-step">
            <LocationSelector
              wilaya={listing.wilaya}
              commune={listing.commune}
              quartier={listing.quartier}
              onWilayaChange={(val) => update('wilaya')(val)}
              onCommuneChange={(val) => update('commune')(val)}
              onQuartierChange={(val) => update('quartier')(val)}
            />
          </div>
        )}

        {step === 3 && (
          <div className="post-step">
            <div className="form-group">
              <label className="form-label">Photos ({images.length} sélectionnées)</label>
              <div className="provider-upload">
                <label className="provider-upload__zone" style={{ cursor: 'pointer', display: 'block' }}>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  <span style={{ fontSize: '2rem' }}>📷</span>
                  <p>Cliquez pour sélectionner vos photos</p>
                  <span className="provider-upload__hint">Max 800KB par image • Auto-compressé en WebP</span>
                </label>
              </div>

              {images.length > 0 && (
                <div className="post-images-preview" style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                  {images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={URL.createObjectURL(img)} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="provider-card__footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {step > 1 && (
              <button type="button" className="btn btn-outline" onClick={prevStep}>
                ← Précédent
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" disabled={uploading} className="btn btn-secondary" onClick={(e) => handleSubmit(e, 'DRAFT')}>
              {uploading ? '...' : 'Sauvegarder en brouillon'}
            </button>
            
            {step < 3 ? (
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Suivant →
              </button>
            ) : (
              <button type="button" disabled={uploading || !isValidated} className="btn btn-primary" onClick={(e) => handleSubmit(e, 'PUBLISHED')}>
                {uploading ? 'Publication...' : 'Publier l\'annonce'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
