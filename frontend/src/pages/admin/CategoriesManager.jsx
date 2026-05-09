import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../components/Toast';
import { useModal } from '../../components/Modal';
import { DataTable } from '../../components/DataTable';

export default function CategoriesManager() {
  const { showToast } = useToast();
  const { showModal } = useModal();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await axiosInstance.put(`/categories/${editingId}`, formData);
        showToast({ type: 'success', message: 'Catégorie modifiée avec succès !' });
      } else {
        await axiosInstance.post('/categories', formData);
        showToast({ type: 'success', message: 'Catégorie créée avec succès !' });
      }
      setFormData({ name: '' });
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      showToast({ type: 'error', message: err.response?.data?.message || 'Erreur' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    showModal({
      title: 'Supprimer la catégorie',
      message: 'Supprimer cette catégorie ?',
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/categories/${id}`);
          showToast({ type: 'success', message: 'Catégorie supprimée.' });
          fetchCategories();
        } catch (err) {
          showToast({ type: 'error', message: err.response?.data?.message || 'Impossible de supprimer (annonces liées ?)' });
        }
      }
    });
  };

  const columns = [
    {
      header: 'ID',
      width: '10%',
      field: 'id'
    },
    {
      header: 'Nom',
      width: '30%',
      field: 'name',
      render: (cat) => <strong>{cat.name}</strong>
    },
    {
      header: 'Slug',
      width: '20%',
      field: 'slug',
      render: (cat) => <code>{cat.slug}</code>
    },
    {
      header: 'Créée le',
      width: '20%',
      field: 'createdAt',
      render: (cat) => new Date(cat.createdAt).toLocaleDateString('fr-FR')
    },
    {
      header: 'Actions',
      width: '20%',
      render: (cat) => (
        <div className="data-table__actions">
          <button className="admin-btn admin-btn--sm admin-btn--outline" onClick={() => handleEdit(cat)}>✏️ Modifier</button>
          <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(cat.id)}>🗑️ Supprimer</button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Gestion des catégories</h1>
          <p className="admin-page__subtitle">{categories.length} catégorie(s) au total</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '' }); }}>
          {showForm ? '✕ Fermer' : '+ Nouvelle catégorie'}
        </button>
      </div>

      {showForm && (
        <form className="admin-inline-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom de la catégorie"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            required
            className="admin-input"
          />
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? 'Enregistrement...' : (editingId ? 'Modifier' : 'Créer')}
          </button>
        </form>
      )}

      <DataTable 
        columns={columns}
        data={categories}
        isLoading={loading}
        emptyMessage="Aucune catégorie trouvée."
        searchPlaceholder="Rechercher par nom..."
      />
    </div>
  );
}
