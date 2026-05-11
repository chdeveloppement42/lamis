import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { formatPrice } from '../../utils/formatPrice';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { useModal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import './ProviderPages.css';

export default function MyListingsPage() {
  const { showModal } = useModal();
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const isValidated = user?.status === 'VALIDATED';

  const fetchListings = async () => {
    try {
      const res = await axiosInstance.get('/listings/provider/mine');
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handlePublish = async (id) => {
    try {
      await axiosInstance.put(`/listings/${id}`, { status: 'PUBLISHED' });
      showToast({ type: 'success', message: 'Annonce publiée avec succès !' });
      fetchListings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la publication.';
      showToast({ type: 'error', message: msg });
    }
  };

  const handleDelete = (id) => {
    showModal({
      title: 'Supprimer l\'annonce',
      message: 'Supprimer cette annonce définitivement ?',
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/listings/${id}`);
          setListings((prev) => prev.filter((l) => l.id !== id));
        } catch {
          alert('Erreur lors de la suppression.');
        }
      }
    });
  };

  return (
    <div className="provider-page">
      <div className="provider-page__header-row">
        <div className="header-text-group">
          <h1>Mes Annonces</h1>
          <p className="provider-page__subtitle">
            {listings.length} annonce{listings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button 
          className="btn-new-listing"
          onClick={() => navigate('/provider/post')}
        >
          <span className="plus-icon">+</span> Nouvelle annonce
        </button>
      </div>

      {loading ? (
        <div className="provider-card loading-state">
          <p>Chargement de vos biens...</p>
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Aucune annonce"
          description="Vous n'avez pas encore créé d'annonce."
          actionLabel="Créer ma première annonce"
          onAction={() => navigate('/provider/post')}
        />
      ) : (
        <div className="provider-listings-container">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Annonce</th>
                <th>Localisation</th>
                <th>Prix</th>
                <th>Statut</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id}>
                  <td data-label="Annonce" className="td-title-main">
                    <strong>{listing.title}</strong>
                  </td>
                  <td data-label="Localisation">
                    {listing.wilaya}, {listing.commune}
                  </td>
                  <td data-label="Prix" className="td-price">
                    {formatPrice(listing.price)}
                  </td>
                  <td data-label="Statut">
                    <StatusBadge status={listing.status} type="listing" />
                  </td>
                  <td data-label="Date">
                    {new Date(listing.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td data-label="Actions" className="td-actions">
                    <div className="action-flex">
                      {listing.status === 'DRAFT' && (
                        <button
                          className={`btn-publish-sm ${!isValidated ? 'disabled' : ''}`}
                          onClick={() => isValidated && handlePublish(listing.id)}
                          disabled={!isValidated}
                        >
                          Publier
                        </button>
                      )}
                      <button
                        className="btn-delete-icon"
                        onClick={() => handleDelete(listing.id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
