import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';
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
  imagesText: '',
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
      imagesText: listing.images?.map((image) => image.url).join('\n') || '',
    });
    setShowForm(true);
  };

  const updateListingForm = (field) => (event) => {
    setListingForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const buildListingPayload = () => {
    const images = listingForm.imagesText
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean);

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
      images,
    };
  };

  const handleListingSubmit = async (event) => {
    event.preventDefault();
    setSavingListing(true);

    try {
      const payload = buildListingPayload();
      if (editingListing) {
        await axiosInstance.patch(`/listings/admin/${editingListing.id}`, payload);
      } else {
        await axiosInstance.post('/listings/admin', payload);
      }

      showToast({
        type: 'success',
        message: editingListing ? 'Annonce modifiée avec succès.' : 'Annonce ajoutée avec succès.',
      });
      resetListingForm();
      fetchListings();
    } catch (error) {
      showToast({
        type: 'error',
        message: error.response?.data?.message || "Erreur lors de l'enregistrement de l'annonce.",
      });
    } finally {
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
            <input className="admin-input" placeholder="Wilaya" value={listingForm.wilaya} onChange={updateListingForm('wilaya')} required />
            <input className="admin-input" placeholder="Commune" value={listingForm.commune} onChange={updateListingForm('commune')} required />
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

          <textarea
            className="admin-input admin-form-card__textarea"
            rows="3"
            placeholder="URLs des images, une URL par ligne"
            value={listingForm.imagesText}
            onChange={updateListingForm('imagesText')}
          />

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
