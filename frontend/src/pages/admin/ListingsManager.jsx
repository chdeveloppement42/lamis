import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';
import imageCompression from 'browser-image-compression';
import LocationSelector from '../../components/LocationSelector';
import { getCategories } from '../../api/categories.api';
import { DataTable } from '../../components/DataTable';

import { LISTING_STATUS, ACCOUNT_STATUS, getStatusLabel } from '../../utils/statusUtils';
import StatusBadge from '../../components/StatusBadge';
import { useModal } from '../../components/Modal';
import { useToast } from '../../components/Toast';

const emptyListingForm = {
  providerId: '',
  title: '',
  description: '',
  price: '',
  type: 'VENTE',
  categoryId: '',
  status: LISTING_STATUS.DRAFT,
  wilaya: '',
  commune: '',
  quartier: '',
  surface: '',
  rooms: '',
  floor: '',
  // images handled via upload only
};

export default function ListingsManager() {
  const { showModal } = useModal();
  const { showToast } = useToast();
  const formRef = useRef(null);
  const [listings, setListings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [listingForm, setListingForm] = useState(emptyListingForm);
  const [savingListing, setSavingListing] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/listings/admin/all?status=${statusFilter}` : '/listings/admin/all';
      const response = await axiosInstance.get(url);
      setListings(response.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchFormOptions = useCallback(async () => {
    try {
      const [providersResponse, categoriesResponse] = await Promise.all([
        axiosInstance.get('/providers'),
        getCategories(),
      ]);
      setProviders(providersResponse.data);
      setCategories(categoriesResponse);
    } catch (error) {
      console.error('Failed to fetch form options:', error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFormOptions();
  }, [fetchFormOptions]);

  useEffect(() => {
    if (!showForm) return;

    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [showForm, editingListing]);

  const resetListingForm = () => {
    setListingForm(emptyListingForm);
    setEditingListing(null);
    setShowForm(false);
  };

  const startCreateListing = () => {
    setListingForm(emptyListingForm);
    setEditingListing(null);
    setShowForm(true);
  };

  const startEditListing = (listing) => {
    setEditingListing(listing);
    setListingForm({
      providerId: listing.provider?.id || '',
      title: listing.title || '',
      description: listing.description || '',
      price: listing.price ?? '',
      type: listing.type || 'VENTE',
      categoryId: listing.category?.id || '',
      status: listing.status || LISTING_STATUS.DRAFT,
      wilaya: listing.wilaya || '',
      commune: listing.commune || '',
      quartier: listing.quartier || '',
      surface: listing.surface ?? '',
      rooms: listing.rooms ?? '',
      floor: listing.floor ?? '',
      // images managed via upload
    });
    setShowForm(true);
  };

  const updateListingForm = (field) => (event) => {
    setListingForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp',
    };

    try {
      const compressed = await Promise.all(files.map(async (f) => imageCompression(f, options)));
      setImages((prev) => [...prev, ...compressed]);
    } catch (err) {
      console.error('Error compressing images', err);
      showToast({ type: 'error', message: 'Erreur lors de la préparation des images.' });
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const buildListingPayload = () => {
    // images will be provided from upload step (uploadedUrls)
    return {
      providerId: Number(listingForm.providerId),
      title: listingForm.title,
      description: listingForm.description,
      price: Number(listingForm.price),
      type: listingForm.type,
      categoryId: Number(listingForm.categoryId),
      status: listingForm.status,
      wilaya: listingForm.wilaya,
      commune: listingForm.commune,
      quartier: listingForm.quartier || undefined,
      surface: listingForm.surface ? Number(listingForm.surface) : undefined,
      rooms: listingForm.rooms ? Number(listingForm.rooms) : undefined,
      floor: listingForm.floor ? Number(listingForm.floor) : undefined,
      images: [],
    };
  };

  const handleListingSubmit = async (event) => {
    event.preventDefault();
    setSavingListing(true);
    try {
      // 1) If there are images selected locally, upload them first
      let uploadedUrls = [];
      if (images.length > 0) {
        setUploadingImages(true);
        const formData = new FormData();
        images.forEach((img) => {
          formData.append('images', img, img.name?.replace(/\.[^/.]+$/, '') + '.webp');
        });

        const mediaRes = await axiosInstance.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        uploadedUrls = mediaRes.data.urls || [];
        setUploadingImages(false);
      }

      // 2) Build payload and merge uploaded URLs with any manual URLs
      const payload = buildListingPayload();
      payload.images = [...(payload.images || []), ...uploadedUrls];

      if (editingListing) {
        await axiosInstance.patch(`/listings/admin/${editingListing.id}`, payload);
      } else {
        await axiosInstance.post('/listings/admin', payload);
      }

      showToast({ type: 'success', message: editingListing ? 'Annonce modifiée avec succès.' : 'Annonce ajoutée avec succès.' });
      resetListingForm();
      setImages([]);
      fetchListings();
    } catch (error) {
      console.error('Failed to save listing (admin):', error);
      showToast({ type: 'error', message: error.response?.data?.message || "Erreur lors de l'enregistrement de l'annonce." });
    } finally {
      setUploadingImages(false);
      setSavingListing(false);
    }
  };

  const handleAction = (id, action) => {
    showModal({
      title: 'Confirmation',
      message: `Voulez-vous vraiment ${action} cette annonce ?`,
      onConfirm: async () => {
        try {
          if (action === 'delete') {
            await axiosInstance.delete(`/listings/admin/${id}`);
          } else {
            await axiosInstance.patch(`/listings/${id}/${action}`);
          }
          fetchListings();
        } catch (error) {
          console.error(`Failed to ${action} listing:`, error);
          alert('Erreur lors de l\'opération');
        }
      }
    });
  };

  const columns = [
    {
      header: 'Annonce',
      width: '20%',
      field: 'title',
      render: (l) => <strong>{l.title}</strong>
    },
    {
      header: 'Fournisseur',
      width: '15%',
      field: 'provider',
      render: (l) => `${l.provider?.firstName || ''} ${l.provider?.lastName || ''}`.trim() || '—'
    },
    {
      header: 'Catégorie',
      width: '10%',
      field: 'category',
      render: (l) => <span className="admin-badge admin-badge--info">{l.category?.name || '—'}</span>
    },
    {
      header: 'Prix',
      width: '10%',
      field: 'price',
      render: (l) => `${l.price} DA`
    },
    {
      header: 'Statut',
      width: '15%',
      field: 'status',
      render: (l) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <StatusBadge status={l.status} type="listing" />
          {l.provider?.status && l.provider.status !== ACCOUNT_STATUS.VALIDATED && (
            <span className="admin-badge" style={{ backgroundColor: '#64748b', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
              Masqué (Fournisseur {getStatusLabel(l.provider.status, 'account')})
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Date',
      width: '10%',
      field: 'createdAt',
      render: (l) => new Date(l.createdAt).toLocaleDateString()
    },
    {
      header: 'Actions',
      width: '20%',
      render: (l) => (
        <div className="data-table__actions">
          <button
            type="button"
            title="Modifier"
            aria-label="Modifier"
            data-tooltip="Modifier"
            onClick={() => startEditListing(l)}
            className="admin-btn admin-btn--icon admin-btn--outline"
          >
            ✏️
          </button>
          {l.status !== 'PUBLISHED' && (
            <button
              type="button"
              title="Publier"
              aria-label="Publier"
              data-tooltip="Publier"
              onClick={() => handleAction(l.id, 'publish')}
              className="admin-btn admin-btn--icon admin-btn--primary"
            >
              ✅
            </button>
          )}
          {l.status === 'PUBLISHED' && (
            <button
              type="button"
              title="Dépublier"
              aria-label="Dépublier"
              data-tooltip="Dépublier"
              onClick={() => handleAction(l.id, 'unpublish')}
              className="admin-btn admin-btn--icon admin-btn--warning"
            >
              🚫
            </button>
          )}
          <button
            type="button"
            title="Supprimer"
            aria-label="Supprimer"
            data-tooltip="Supprimer"
            onClick={() => handleAction(l.id, 'delete')}
            className="admin-btn admin-btn--icon admin-btn--outline admin-btn--danger"
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h2 className="admin-page__title">Modération des Annonces</h2>
          <p className="admin-page__subtitle">{listings.length} annonces au total</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={startCreateListing}>
          Ajouter une annonce
        </button>
      </div>

      {showForm && (
        <form ref={formRef} className="admin-form-card" onSubmit={handleListingSubmit}>
          <div className="admin-form-card__header">
            <h3>{editingListing ? "Modifier l'annonce" : 'Ajouter une annonce'}</h3>
            <button type="button" className="admin-btn admin-btn--sm admin-btn--outline" onClick={resetListingForm}>
              Annuler
            </button>
          </div>

          <div className="admin-form-grid admin-form-grid--wide">
            <select className="admin-input" value={listingForm.providerId} onChange={updateListingForm('providerId')} required>
              <option value="">Sélectionner un fournisseur</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.firstName} {provider.lastName} - {provider.email}
                </option>
              ))}
            </select>
            <select className="admin-input" value={listingForm.categoryId} onChange={updateListingForm('categoryId')} required>
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <input className="admin-input" placeholder="Titre" value={listingForm.title} onChange={updateListingForm('title')} required />
            <input className="admin-input" type="number" min="0" placeholder="Prix DA" value={listingForm.price} onChange={updateListingForm('price')} required />
            <select className="admin-input" value={listingForm.type} onChange={updateListingForm('type')}>
              <option value="VENTE">Vente</option>
              <option value="LOCATION">Location</option>
            </select>
            <select className="admin-input" value={listingForm.status} onChange={updateListingForm('status')}>
              <option value={LISTING_STATUS.DRAFT}>Brouillon</option>
              <option value={LISTING_STATUS.PUBLISHED}>Publié</option>
              <option value={LISTING_STATUS.UNPUBLISHED}>Dépublié</option>
            </select>
            <div style={{ gridColumn: '1 / -1' }}>
              <LocationSelector
                wilaya={listingForm.wilaya}
                commune={listingForm.commune}
                onWilayaChange={(val) => setListingForm((p) => ({ ...p, wilaya: val }))}
                onCommuneChange={(val) => setListingForm((p) => ({ ...p, commune: val }))}
                showCommune
                required
              />
            </div>
            <input className="admin-input" placeholder="Quartier" value={listingForm.quartier} onChange={updateListingForm('quartier')} />
            <input className="admin-input" type="number" min="0" placeholder="Surface m²" value={listingForm.surface} onChange={updateListingForm('surface')} />
            <input className="admin-input" type="number" min="0" placeholder="Pièces" value={listingForm.rooms} onChange={updateListingForm('rooms')} />
            <input className="admin-input" type="number" placeholder="Étage" value={listingForm.floor} onChange={updateListingForm('floor')} />
          </div>

          <textarea
            className="admin-input admin-form-card__textarea"
            rows="4"
            placeholder="Description"
            value={listingForm.description}
            onChange={updateListingForm('description')}
            required
          />

          <div style={{ marginTop: '1rem' }}>
            <label className="admin-form-label">Photos ({images.length} sélectionnées)</label>
            <div className="provider-upload">
              <label className="provider-upload__zone" style={{ cursor: 'pointer', display: 'block' }}>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                <span style={{ fontSize: '2rem' }}>📷</span>
                <p>Cliquez pour sélectionner vos photos</p>
                <span className="provider-upload__hint">Max 800KB par image • Auto-compressé en WebP</span>
              </label>
            </div>

            {images.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
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

          <div className="admin-form-card__actions">
            <button className="admin-btn admin-btn--primary" disabled={savingListing}>
              {savingListing ? 'Enregistrement...' : editingListing ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      )}

      <div className="admin-inline-form">
        <div className="admin-inline-form--grid">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-input"
          >
            <option value="">Tous les statuts</option>
            <option value="DRAFT">Brouillons</option>
            <option value="PUBLISHED">Publiées</option>
            <option value="UNPUBLISHED">Dépubliées</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={listings}
        isLoading={loading}
        emptyMessage="Aucune annonce trouvée."
        searchPlaceholder="Rechercher par titre, catégorie..."
      />
    </div>
  );
}
