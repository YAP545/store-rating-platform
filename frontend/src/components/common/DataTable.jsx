import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const DataTable = ({ columns, data, loading, sortBy, sortOrder, onSort, emptyMessage = 'No data available' }) => {
  const handleHeaderClick = (field) => {
    if (!field || !onSort) return;
    if (sortBy === field) {
      onSort(field, sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      onSort(field, 'ASC');
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', fontSize: '14px' }}>Loading records...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '15px', fontWeight: 500 }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key || col.field}
                onClick={() => col.sortable && handleHeaderClick(col.field)}
                style={{ cursor: col.sortable ? 'pointer' : 'default' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{col.label}</span>
                  {col.sortable && (
                    sortBy === col.field ? (
                      sortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    ) : (
                      <ArrowUpDown size={14} style={{ opacity: 0.4 }} />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map((col) => (
                <td key={col.key || col.field}>
                  {col.render ? col.render(row) : row[col.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
