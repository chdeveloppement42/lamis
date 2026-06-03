import { useState, useMemo, useEffect } from 'react';
import EmptyState from '../EmptyState';
import TableRowSkeleton from '../TableRowSkeleton';
import './DataTable.css';

export default function DataTable({
  title,
  subtitle,
  columns,
  data,
  isLoading,
  emptyMessage = "Aucune donnée disponible",
  searchable = true,
  searchPlaceholder = "Rechercher...",
  keyField = "id",
  actions,
  getSearchText,
  selectable = false,
  selectedIds = [],
  onSelectedIdsChange
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    
    return data.filter(item => {
      if (getSearchText) {
        return getSearchText(item).toLowerCase().includes(lowerSearch);
      }

      return Object.values(item).some(val => {
        if (typeof val === 'string') return val.toLowerCase().includes(lowerSearch);
        if (typeof val === 'number') return val.toString().includes(lowerSearch);
        return false;
      });
    });
  }, [data, searchTerm, getSearchText]);

  const visibleIds = useMemo(
    () => filteredData.map((row) => row[keyField]),
    [filteredData, keyField]
  );

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIdSet.has(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIdSet.has(id));

  useEffect(() => {
    if (!selectable || !onSelectedIdsChange) return;

    const availableIds = new Set(data.map((row) => row[keyField]));
    const nextSelectedIds = selectedIds.filter((id) => availableIds.has(id));

    if (nextSelectedIds.length !== selectedIds.length) {
      onSelectedIdsChange(nextSelectedIds);
    }
  }, [data, keyField, onSelectedIdsChange, selectable, selectedIds]);

  const toggleRowSelection = (id) => {
    if (!onSelectedIdsChange) return;

    onSelectedIdsChange(
      selectedIdSet.has(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id]
    );
  };

  const toggleVisibleSelection = () => {
    if (!onSelectedIdsChange) return;

    if (allVisibleSelected) {
      onSelectedIdsChange(selectedIds.filter((id) => !visibleIds.includes(id)));
      return;
    }

    onSelectedIdsChange(Array.from(new Set([...selectedIds, ...visibleIds])));
  };

  const columnCount = columns.length + (selectable ? 1 : 0);

  return (
    <div className="data-table-wrapper">
      {/* HEADER PRESTIGE */}
      {(title || subtitle) && (
        <div className="admin-page__header">
          <div className="header-text-stack">
            {title && <h1 className="admin-page__title">{title}</h1>}
            {subtitle && <p className="admin-page__subtitle">{subtitle}</p>}
          </div>
        </div>
      )}

      {/* CONTROLES */}
      <div className="data-table-controls">
        {searchable && (
          <div className="data-table-search">
            <span className="data-table-search__icon">🔍</span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="data-table-search__input"
            />
          </div>
        )}
        
        <div className="data-table-info">
          {isLoading ? 'Chargement...' : `${filteredData.length} résultat(s)`}
        </div>

        {actions && <div className="data-table-actions">{actions}</div>}
      </div>

      {/* TABLEAU RESPONSIVE */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {selectable && (
                <th className="data-table__select-col">
                  <input
                    type="checkbox"
                    aria-label="Selectionner tous les resultats visibles"
                    checked={allVisibleSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = !allVisibleSelected && someVisibleSelected;
                    }}
                    onChange={toggleVisibleSelection}
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width }}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRowSkeleton columns={columnCount} rows={5} />
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columnCount} style={{ padding: 0 }}>
                  <EmptyState 
                    title="Aucun résultat" 
                    description={searchTerm ? `Aucun résultat pour "${searchTerm}"` : emptyMessage} 
                    icon="📋"
                  />
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr key={row[keyField]}>
                  {selectable && (
                    <td className="data-table__select-col" data-label="Selection">
                      <input
                        type="checkbox"
                        aria-label="Selectionner cette ligne"
                        checked={selectedIdSet.has(row[keyField])}
                        onChange={() => toggleRowSelection(row[keyField])}
                      />
                    </td>
                  )}
                  {columns.map((col, idx) => (
                    <td key={idx} data-label={col.header}> 
                      {col.render ? col.render(row) : row[col.field]} 
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
