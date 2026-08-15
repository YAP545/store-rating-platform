import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, User, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handlePasswordRedirect = () => {
    if (user.role === 'SYSTEM_ADMIN') {
      navigate('/admin/change-password');
      return;
    }

    if (user.role === 'STORE_OWNER') {
      navigate('/owner/change-password');
      return;
    }

    navigate('/user/change-password');
  };

  const getRoleBadge = (role) => {
    if (role === 'SYSTEM_ADMIN') {
      return (
        <span className="badge badge-admin">
          System Admin
        </span>
      );
    }

    if (role === 'STORE_OWNER') {
      return (
        <span className="badge badge-owner">
          Store Owner
        </span>
      );
    }

    return (
      <span className="badge badge-user">
        Normal User
      </span>
    );
  };

  return (
    <header
      style={{
        height: '56px',
        minHeight: '56px',
        width: '100%',
        boxSizing: 'border-box',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >

      {/* Logo */}

      <h2
        style={{
          fontSize: '18px',
          fontWeight: 700,
          margin: 0,
          whiteSpace: 'nowrap',
          background:
            'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Store Rating Platform
      </h2>

      {/* User Section */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
      >

        {/* User Information */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >

          {/* User Icon */}

          <div
            style={{
              width: '32px',
              height: '32px',
              minWidth: '32px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <User size={16} />
          </div>

          {/* Name + Role */}

          <div
            style={{
              lineHeight: 1,
            }}
          >
            <p
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-main)',
                margin: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {user.name}
            </p>

            <div
              style={{
                marginTop: '3px',
              }}
            >
              {getRoleBadge(user.role)}
            </div>
          </div>
        </div>

        {/* Password */}

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handlePasswordRedirect}
          title="Change Password"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          <KeyRound size={15} />
          Password
        </button>

        {/* Logout */}

        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={logout}
          title="Log Out"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          <LogOut size={15} />
          Logout
        </button>

      </div>
    </header>
  );
};

export default Navbar;
