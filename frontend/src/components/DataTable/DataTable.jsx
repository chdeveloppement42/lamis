import { useState, useMemo } from 'react';
import EmptyState from '../EmptyState';
import TableRowSkeleton from '../TableRowSkeleton';
import './DataTable.css';

export default function DataTable({
  columns,
  data,
  isLoading,
  emptyMessage = "Aucune donnée disponible",
  searchable = true,
  searchPlaceholder = "Rechercher...",
  keyField = "id",
  actions
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced/Memoized search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    
    return data.filter(item => {
      // Basic flat search across string values
      return Object.values(item).some(val => {
        if (typeof val === 'string') {
          return val.toLowerCase().includes(lowerSearch);
        }
        if (typeof val === 'number') {
          return val.toString().includes(lowerSearch);
        }
        return false;
      });
    });
  }, [data, searchTerm]);

  return (
    <div className="data-table-wrapper">
      {/* Header & Controls */}
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
        {actions && (
          <div className="data-table-actions">
            {actions}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width }}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRowSkeleton columns={columns.length} rows={5} />
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: 0 }}>
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
                  {columns.map((col, idx) => (
                    <td key={idx}>{col.render ? col.render(row) : row[col.field]}</td>
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
