import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = '#6366f1' }) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: '-15px',
          right: '-15px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: color,
          opacity: 0.15,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </p>
          <h2 style={{ fontSize: '32px', fontWeight: 700, marginTop: '8px', color: 'var(--text-main)' }}>
            {value}
          </h2>
        </div>
        {Icon && (
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: `${color}20`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={26} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
