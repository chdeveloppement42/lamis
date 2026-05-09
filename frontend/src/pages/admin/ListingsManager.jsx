import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { DataTable } from '../../components/DataTable';

import { LISTING_STATUS, ACCOUNT_STATUS, getStatusLabel } from '../../utils/statusUtils';
import StatusBadge from '../../components/StatusBadge';
import { useModal } from '../../components/Modal';

export default function ListingsManager() {
  const { showModal } = useModal();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchListings();
  }, [fetchListings]);

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
          fetchListings(); // Refresh list
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
          {l.status !== 'PUBLISHED' && (
            <button onClick={() => handleAction(l.id, 'publish')} className="admin-btn admin-btn--sm admin-btn--primary">Publier</button>
          )}
          {l.status === 'PUBLISHED' && (
            <button onClick={() => handleAction(l.id, 'unpublish')} className="admin-btn admin-btn--sm admin-btn--warning">Dépublier</button>
          )}
          <button onClick={() => handleAction(l.id, 'delete')} className="admin-btn admin-btn--sm admin-btn--outline" style={{ color: 'var(--color-danger)' }}>Supprimer</button>
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
      </div>

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
