import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../components/Toast';
import { DataTable } from '../../components/DataTable';

export default function UsersManager() {
  const { showToast } = useToast();
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', roleId: '',
  });

  const fetchData = async () => {
    try {
      const [adminsRes, rolesRes] = await Promise.all([
        axiosInstance.get('/admin/users'),
        axiosInstance.get('/roles'),
      ]);
      setAdmins(adminsRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.post('/admin/users', {
        ...formData,
        roleId: parseInt(formData.roleId),
      });
      showToast({ type: 'success', message: 'Administrateur créé avec succès !' });
      setFormData({ firstName: '', lastName: '', email: '', password: '', roleId: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      showToast({ type: 'error', message: err.response?.data?.message || 'Erreur lors de la création' });
    } finally {
      setSaving(false);
    }
  };

  const handleSuspend = async (id) => {
    try {
      await axiosInstance.patch(`/admin/users/${id}/suspend`);
      showToast({ type: 'success', message: 'Utilisateur suspendu.' });
      fetchData();
    } catch (err) {
      showToast({ type: 'error', message: err.response?.data?.message || 'Erreur' });
    }
  };

  const handleReactivate = async (id) => {
    try {
      await axiosInstance.patch(`/admin/users/${id}/reactivate`);
      showToast({ type: 'success', message: 'Utilisateur réactivé.' });
      fetchData();
    } catch (err) {
      showToast({ type: 'error', message: err.response?.data?.message || 'Erreur' });
    }
  };

  const handleResetPassword = async (id) => {
    const newPassword = prompt('Nouveau mot de passe :');
    if (!newPassword) return;
    try {
      await axiosInstance.patch(`/admin/users/${id}/reset-password`, { newPassword });
      showToast({ type: 'success', message: 'Mot de passe réinitialisé avec succès.' });
    } catch (err) {
      showToast({ type: 'error', message: err.response?.data?.message || 'Erreur' });
    }
  };

  const statusBadge = (status) => {
    const map = {
      VALIDATED: 'admin-badge--success',
      SUSPENDED: 'admin-badge--danger',
      PENDING: 'admin-badge--warning',
    };
    return <span className={`admin-badge ${map[status] || ''}`}>{status}</span>;
  };

  const columns = [
    {
      header: 'Nom',
      width: '20%',
      field: 'name',
      render: (admin) => <strong>{admin.firstName} {admin.lastName}</strong>
    },
    {
      header: 'Email',
      width: '20%',
      field: 'email'
    },
    {
      header: 'Rôle',
      width: '15%',
      field: 'role',
      render: (admin) => admin.role?.name || '—'
    },
    {
      header: 'Statut',
      width: '10%',
      field: 'status',
      render: (admin) => statusBadge(admin.status)
    },
    {
      header: 'Créé par',
      width: '15%',
      field: 'createdBy',
      render: (admin) => admin.createdBy ? `${admin.createdBy.firstName} ${admin.createdBy.lastName}` : '—'
    },
    {
      header: 'Actions',
      width: '20%',
      render: (admin) => (
        <div className="data-table__actions">
          {!admin.isSuperAdmin && (
            <>
              {admin.status === 'VALIDATED' ? (
                <button className="admin-btn admin-btn--sm admin-btn--warning" onClick={() => handleSuspend(admin.id)}>⏸️ Suspendre</button>
              ) : (
                <button className="admin-btn admin-btn--sm admin-btn--success" onClick={() => handleReactivate(admin.id)}>▶️ Réactiver</button>
              )}
              <button className="admin-btn admin-btn--sm admin-btn--outline" onClick={() => handleResetPassword(admin.id)}>🔑 MDP</button>
            </>
          )}
          {admin.isSuperAdmin && <span className="admin-badge admin-badge--info">Super Admin</span>}
        </div>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Gestion des utilisateurs</h1>
          <p className="admin-page__subtitle">{admins.length} administrateur(s)</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Fermer' : '+ Nouvel administrateur'}
        </button>
      </div>

      {showForm && (
        <form className="admin-inline-form admin-inline-form--grid" onSubmit={handleSubmit}>
          <input className="admin-input" placeholder="Prénom" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
          <input className="admin-input" placeholder="Nom" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
          <input className="admin-input" type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input className="admin-input" type="password" placeholder="Mot de passe" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          <select className="admin-input" value={formData.roleId} onChange={(e) => setFormData({...formData, roleId: e.target.value})} required>
            <option value="">Sélectionner un rôle</option>
            {roles.filter(r => !r.isSuperAdmin).map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? 'Création...' : 'Créer'}
          </button>
        </form>
      )}

      <DataTable 
        columns={columns}
        data={admins}
        isLoading={loading}
        emptyMessage="Aucun administrateur trouvé."
        searchPlaceholder="Rechercher par nom, email..."
      />
    </div>
  );
}
