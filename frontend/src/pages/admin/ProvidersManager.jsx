import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { getImageUrl } from '../../utils/urlUtils';
import { DataTable } from '../../components/DataTable';

import { ACCOUNT_STATUS } from '../../utils/statusUtils';
import StatusBadge from '../../components/StatusBadge';
import { useModal } from '../../components/Modal';

export default function ProvidersManager() {
  const { showModal } = useModal();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/providers?status=${statusFilter}` : '/providers';
      const response = await axiosInstance.get(url);
      setProviders(response.data);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProviders();
  }, [fetchProviders]);

  const handleAction = (id, action) => {
    showModal({
      title: 'Confirmation',
      message: `Voulez-vous vraiment ${action} ce fournisseur ?`,
      onConfirm: async () => {
        try {
          await axiosInstance.patch(`/providers/${id}/${action}`);
          fetchProviders();
        } catch (error) {
          console.error(`Failed to ${action} provider:`, error);
          const message = error.response?.data?.message || 'Erreur lors de l\'opération';
          alert(`Erreur : ${message}`);
        }
      }
    });
  };

  const columns = [
    {
      header: 'Fournisseur',
      width: '30%',
      field: 'email',
      render: (p) => (
        <div className="data-table__user">
          <div className="data-table__avatar">
            {p.firstName?.charAt(0) || p.email?.charAt(0) || 'F'}
          </div>
          <div>
            <strong>{p.firstName} {p.lastName}</strong>
            <span className="data-table__email">{p.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      width: '15%',
      field: 'phone',
      render: (p) => p.phone || '—'
    },
    {
      header: 'Document',
      width: '10%',
      field: 'documentUrl',
      render: (p) => (
        p.documentUrl ? (
          <a href={getImageUrl(p.documentUrl)} target="_blank" rel="noreferrer" className="admin-btn admin-btn--sm admin-btn--outline">Voir</a>
        ) : '—'
      )
    },
    {
      header: 'Statut',
      width: '15%',
      field: 'status',
      render: (p) => <StatusBadge status={p.status} type="account" />
    },
    {
      header: 'Inscription',
      width: '10%',
      field: 'createdAt',
      render: (p) => new Date(p.createdAt).toLocaleDateString()
    },
    {
      header: 'Actions',
      width: '20%',
      render: (p) => (
        <div className="data-table__actions">
          {p.status === ACCOUNT_STATUS.PENDING && (
            <>
              <button onClick={() => handleAction(p.id, 'validate')} className="admin-btn admin-btn--sm admin-btn--primary">Valider</button>
              <button onClick={() => handleAction(p.id, 'reject')} className="admin-btn admin-btn--sm admin-btn--outline" style={{ color: 'var(--color-danger)' }}>Rejeter</button>
            </>
          )}
          {p.status === ACCOUNT_STATUS.VALIDATED && (
            <button onClick={() => handleAction(p.id, 'suspend')} className="admin-btn admin-btn--sm admin-btn--warning">Suspendre</button>
          )}
          {p.status === ACCOUNT_STATUS.SUSPENDED && (
            <button onClick={() => handleAction(p.id, 'reactivate')} className="admin-btn admin-btn--sm admin-btn--primary">Réactiver</button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h2 className="admin-page__title">Fournisseurs</h2>
          <p className="admin-page__subtitle">Gérer les comptes fournisseurs et leurs documents</p>
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
            <option value={ACCOUNT_STATUS.PENDING}>En attente</option>
            <option value={ACCOUNT_STATUS.VALIDATED}>Validés</option>
            <option value={ACCOUNT_STATUS.SUSPENDED}>Suspendus</option>
            <option value={ACCOUNT_STATUS.REJECTED}>Rejetés</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={providers}
        isLoading={loading}
        emptyMessage="Aucun fournisseur trouvé."
        searchPlaceholder="Rechercher par nom, email..."
      />
    </div>
  );
}
