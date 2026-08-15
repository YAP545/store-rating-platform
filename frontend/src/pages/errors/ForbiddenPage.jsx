import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ForbiddenPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRedirect = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'SYSTEM_ADMIN') {
      navigate('/admin/dashboard');
    } else if (user.role === 'STORE_OWNER') {
      navigate('/owner/dashboard');
    } else {
      navigate('/user/stores');
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ padding: '48px', maxWidth: '480px', width: '100%' }}>
        <div style={{ color: '#ef4444', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <ShieldAlert size={64} />
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>403</h1>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-main)' }}>Access Forbidden</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          You do not have the required permissions to access this page.
        </p>
        <button onClick={handleRedirect} className="btn btn-primary" style={{ width: '100%' }}>
          Go to Your Dashboard
        </button>
      </div>
    </div>
  );
};

export default ForbiddenPage;
