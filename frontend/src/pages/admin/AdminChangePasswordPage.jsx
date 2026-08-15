import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { KeyRound, Lock, CheckCircle } from 'lucide-react';

const AdminChangePasswordPage = () => {
  const { changePassword, loading } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      setError('New password must be between 8 and 16 characters.');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError(
        'New password must contain at least one uppercase letter.'
      );
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(newPassword)) {
      setError(
        'New password must contain at least one special character.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        'New password and confirm password do not match.'
      );
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        'New password must be different from your current password.'
      );
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);

      setSuccess('Password changed successfully.');

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(
        err?.message || 'Failed to change password.'
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: '650px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          marginBottom: '24px',
        }}
      >
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 700,
            color: 'var(--text-main)',
            margin: 0,
          }}
        >
          Change Password
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            marginTop: '6px',
          }}
        >
          Update your administrator account password securely.
        </p>
      </div>

      <div
        className="glass-panel"
        style={{
          padding: '32px',
        }}
      >
        {error && (
          <div
            style={{
              padding: '12px 16px',
              marginBottom: '20px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: '12px 16px',
              marginBottom: '20px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Current Password
            </label>

            <div
              style={{
                position: 'relative',
              }}
            >
              <input
                type="password"
                name="currentPassword"
                className="form-input"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="current-password"
                style={{
                  paddingLeft: '40px',
                }}
              />

              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              New Password
            </label>

            <div
              style={{
                position: 'relative',
              }}
            >
              <input
                type="password"
                name="newPassword"
                className="form-input"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
                style={{
                  paddingLeft: '40px',
                }}
              />

              <KeyRound
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            <span
              style={{
                display: 'block',
                marginTop: '6px',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              8–16 characters, at least 1 uppercase letter and
              1 special character.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">
              Confirm New Password
            </label>

            <div
              style={{
                position: 'relative',
              }}
            >
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
                style={{
                  paddingLeft: '40px',
                }}
              />

              <CheckCircle
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <KeyRound size={18} />

            {loading
              ? 'Updating Password...'
              : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminChangePasswordPage;

