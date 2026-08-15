import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ padding: '48px', maxWidth: '480px', width: '100%' }}>
        <div style={{ color: 'var(--accent-pink)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <HelpCircle size={64} />
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>404</h1>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-main)' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
          Return to Application
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
