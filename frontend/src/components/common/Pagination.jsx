import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, totalItems, limit, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', padding: '0 4px' }}>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        Showing page <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{page}</span> of{' '}
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{totalPages}</span> ({totalItems} total records)
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
