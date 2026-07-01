import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useModal } from '../../components/Modal';
import './PermissionsManager.css';
export default function PermissionsManager() {
  const { showModal } = useModal();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', permissionIds: [] });

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        axiosInstance.get('/roles'),
        axiosInstance.get('/roles/permissions'),
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleTogglePermission = (permId) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permId)
        ? prev.permissionIds.filter(id => id !== permId)
        : [...prev.permissionIds, permId],
    }));
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      permissionIds: role.permissions.map(rp => rp.permission.id),
    });
    setShowForm(true);
  };

  const selectAllPermissions = () => {
    setFormData(prev => {
      const allIds = permissions.map((perm) => perm.id);
      return {
        ...prev,
        permissionIds: prev.permissionIds.length === allIds.length ? [] : allIds,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await axiosInstance.put(`/roles/${editingRole.id}`, formData);
      } else {
        await axiosInstance.post('/roles', formData);
      }
      setFormData({ name: '', permissionIds: [] });
      setEditingRole(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = (role) => {
    showModal({
      title: 'Supprimer le rôle',
      message: `Supprimer le rôle "${role.name}" ? Tous les utilisateurs de ce rôle seront suspendus.`,
      onConfirm: async () => {
        try {
          const res = await axiosInstance.delete(`/roles/${role.id}`);
          alert(res.data.message);
          fetchData();
        } catch (err) {
          alert(err.response?.data?.message || 'Erreur');
        }
      }
    });
  };

  if (loading) return <div className="admin-loading">Chargement...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Gestion des permissions</h1>
          <p className="admin-page__subtitle">{roles.length} rôle(s) · {permissions.length} permission(s)</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => {
          setShowForm(!showForm);
          setEditingRole(null);
          setFormData({ name: '', permissionIds: !showForm ? permissions.map((perm) => perm.id) : [] });
        }}>
          {showForm ? '✕ Fermer' : '+ Nouveau rôle'}
        </button>
      </div>

      {showForm && (
        <form className="admin-role-form" onSubmit={handleSubmit}>
          <div className="admin-role-form__header">
            <input
              className="admin-input"
              placeholder="Nom du rôle"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="admin-role-form__permissions">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4>Permissions :</h4>
              <button 
                type="button" 
                className="admin-btn admin-btn--sm admin-btn--outline"
                onClick={selectAllPermissions}
              >
                {formData.permissionIds.length === permissions.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            </div>
            
            {Object.entries(
              permissions.reduce((acc, perm) => {
                const parts = perm.action.split(':');
                const entity = parts.length > 1 ? parts[1] : 'autres';
                if (!acc[entity]) acc[entity] = [];
                acc[entity].push(perm);
                return acc;
              }, {})
            ).map(([group, perms]) => (
              <div key={group} className="permission-group">
                <h5 className="permission-group__title">{group}</h5>
                <div className="permissions-grid">
                  {perms.map((perm) => (
                    <label key={perm.id} className="permission-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.permissionIds.includes(perm.id)}
                        onChange={() => handleTogglePermission(perm.id)}
                      />
                      <span className="permission-checkbox__label">
                        <strong>{perm.action.split(':')[0]}</strong>
                        {perm.description && <small>{perm.description}</small>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button type="submit" className="admin-btn admin-btn--primary">
            {editingRole ? 'Mettre à jour' : 'Créer le rôle'}
          </button>
        </form>
      )}

      <div className="roles-grid">
        {roles.map((role) => (
          <div key={role.id} className={`role-card ${role.isSuperAdmin ? 'role-card--super' : ''}`}>
            <div className="role-card__header">
              <h3>{role.name}</h3>
              {role.isSuperAdmin && <span className="admin-badge admin-badge--info">Super Admin</span>}
              <span className="admin-badge">{role._count?.admins || 0} utilisateur(s)</span>
            </div>
            <div className="role-card__permissions">
              {role.permissions.map((rp) => (
                <span key={rp.id} className="permission-tag">{rp.permission.action}</span>
              ))}
              {role.permissions.length === 0 && <span className="permission-tag permission-tag--empty">Aucune permission</span>}
            </div>
            {!role.isSuperAdmin && (
              <div className="role-card__actions">
                <button className="admin-btn admin-btn--sm admin-btn--outline" onClick={() => handleEdit(role)}>✏️ Modifier</button>
                <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(role)}>🗑️ Supprimer</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
