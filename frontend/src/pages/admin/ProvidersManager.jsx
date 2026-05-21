import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { getImageUrl } from '../../utils/urlUtils';
import { DataTable } from '../../components/DataTable';
import LocationSelector from '../../components/LocationSelector';

import { ACCOUNT_STATUS } from '../../utils/statusUtils';
import StatusBadge from '../../components/StatusBadge';
import { useModal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { getPhoneError, normalizePhoneNumber } from '../../utils/phoneUtils';

const emptyProviderForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  wilaya: '',
  commune: '',
  quartier: '',
  documentUrl: '',
  status: ACCOUNT_STATUS.VALIDATED,
};

export default function ProvidersManager() {
  const { showModal } = useModal();
  const { showToast } = useToast();
  const formRef = useRef(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [providerForm, setProviderForm] = useState(emptyProviderForm);
  const [savingProvider, setSavingProvider] = useState(false);

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

  useEffect(() => {
    if (!showForm) return;

    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [showForm, editingProvider]);

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

  const resetProviderForm = () => {
    setProviderForm(emptyProviderForm);
    setEditingProvider(null);
    setShowForm(false);
  };

  const startCreateProvider = () => {
    setProviderForm(emptyProviderForm);
    setEditingProvider(null);
    setShowForm(true);
  };

  const startEditProvider = (provider) => {
    setEditingProvider(provider);
    setProviderForm({
      firstName: provider.firstName || '',
      lastName: provider.lastName || '',
      email: provider.email || '',
      password: '',
      phone: provider.phone || '',
      wilaya: provider.wilaya || '',
      commune: provider.commune || '',
      quartier: provider.quartier || '',
      documentUrl: provider.documentUrl || '',
      status: provider.status || ACCOUNT_STATUS.VALIDATED,
    });
    setShowForm(true);
  };

  const updateProviderForm = (field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setProviderForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProviderSubmit = async (event) => {
    event.preventDefault();
    const phoneError = getPhoneError(providerForm.phone);
    if (phoneError) {
      showToast({ type: 'warning', message: phoneError });
      return;
    }

    setSavingProvider(true);

    try {
      const payload = { ...providerForm, phone: normalizePhoneNumber(providerForm.phone) };
      if (editingProvider) {
        delete payload.password;
        await axiosInstance.patch(`/providers/${editingProvider.id}`, payload);
      } else {
        await axiosInstance.post('/providers', payload);
      }

      showToast({
        type: 'success',
        message: editingProvider ? 'Fournisseur modifiÃ© avec succÃ¨s.' : 'Fournisseur ajoutÃ© avec succÃ¨s.',
      });
      resetProviderForm();
      fetchProviders();
    } catch (error) {
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Erreur lors de l\'enregistrement du fournisseur.',
      });
    } finally {
      setSavingProvider(false);
    }
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
          <div className="providers-manager__identity">
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
          <button onClick={() => startEditProvider(p)} className="admin-btn admin-btn--sm admin-btn--outline">Modifier</button>
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
        <button className="admin-btn admin-btn--primary" onClick={startCreateProvider}>
          Ajouter un fournisseur
        </button>
      </div>

      {showForm && (
        <form ref={formRef} className="admin-form-card" onSubmit={handleProviderSubmit}>
          <div className="admin-form-card__header">
            <h3>{editingProvider ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}</h3>
            <button type="button" className="admin-btn admin-btn--sm admin-btn--outline" onClick={resetProviderForm}>
              Annuler
            </button>
          </div>

          <div className="admin-form-grid">
            <input className="admin-input" placeholder="Prénom" value={providerForm.firstName} onChange={updateProviderForm('firstName')} required />
            <input className="admin-input" placeholder="Nom" value={providerForm.lastName} onChange={updateProviderForm('lastName')} required />
            <input className="admin-input" type="email" placeholder="Email" value={providerForm.email} onChange={updateProviderForm('email')} required />
            {!editingProvider && (
              <input className="admin-input" type="password" placeholder="Mot de passe" value={providerForm.password} onChange={updateProviderForm('password')} required minLength={6} />
            )}
            <input
              className="admin-input"
              placeholder="+213555000000"
              value={providerForm.phone}
              onBlur={() => setProviderForm((prev) => ({ ...prev, phone: normalizePhoneNumber(prev.phone) }))}
              onChange={updateProviderForm('phone')}
              required
            />
            <select className="admin-input" value={providerForm.status} onChange={updateProviderForm('status')}>
              <option value={ACCOUNT_STATUS.PENDING}>En attente</option>
              <option value={ACCOUNT_STATUS.VALIDATED}>Validé</option>
              <option value={ACCOUNT_STATUS.SUSPENDED}>Suspendu</option>
              <option value={ACCOUNT_STATUS.REJECTED}>Rejeté</option>
            </select>
            <input className="admin-input" placeholder="Quartier" value={providerForm.quartier} onChange={updateProviderForm('quartier')} />
            <input className="admin-input" placeholder="URL du document" value={providerForm.documentUrl} onChange={updateProviderForm('documentUrl')} />
          </div>

          <div className="admin-location-field">
            <LocationSelector
              wilaya={providerForm.wilaya}
              commune={providerForm.commune}
              onWilayaChange={updateProviderForm('wilaya')}
              onCommuneChange={updateProviderForm('commune')}
            />
          </div>

          <div className="admin-form-card__actions">
            <button className="admin-btn admin-btn--primary" disabled={savingProvider}>
              {savingProvider ? 'Enregistrement...' : editingProvider ? 'Modifier' : 'Ajouter'}
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
