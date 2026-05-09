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
        <div>
          <h1>Mes Annonces</h1>
          <p className="provider-page__subtitle">{listings.length} annonce{listings.length !== 1 ? 's' : ''}</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/provider/post')}
        >
          + Nouvelle annonce
        </button>
      </div>

      {loading ? (
        <div className="provider-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Chargement...</p>
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
        <div className="provider-listings-table">
          <table>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Localisation</th>
                <th>Prix</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td className="provider-listings-table__title">{listing.title}</td>
                    <td>{listing.wilaya}, {listing.commune}</td>
                    <td>{formatPrice(listing.price)}</td>
                    <td>
                      <StatusBadge status={listing.status} type="listing" />
                    </td>
                    <td>{new Date(listing.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {listing.status === 'DRAFT' && (
                          <button
                            className={`btn btn-sm btn-primary ${!isValidated ? 'btn--disabled' : ''}`}
                            onClick={() => isValidated && handlePublish(listing.id)}
                            disabled={!isValidated}
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                            title={!isValidated ? 'Validation requise' : ''}
                          >
                            Publier
                          </button>
                        )}
                        <button
                          className="btn btn-sm"
                          style={{ color: 'var(--color-danger)', border: 'none', background: 'transparent' }}
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
