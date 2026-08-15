import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import {
  User,
  Mail,
  Shield,
  Lock,
  KeyRound,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Edit3,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

const AdminSettingsPage = () => {
  const { user, changePassword, showToast, loading: authLoading } = useContext(AuthContext);

  // ==========================================
  // EDIT PROFILE MODAL STATE
  // ==========================================
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // ==========================================
  // CHANGE PASSWORD FORM STATE
  // ==========================================
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // ==========================================
  // PLATFORM PREFERENCES STATE
  // ==========================================
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('platform_preferences');
      return saved
        ? JSON.parse(saved)
        : {
            emailNotifications: true,
            auditLogging: true,
            compactTables: false,
          };
    } catch {
      return {
        emailNotifications: true,
        auditLogging: true,
        compactTables: false,
      };
    }
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  // ==========================================
  // HANDLERS — PROFILE
  // ==========================================
  const handleOpenEditProfile = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditProfileOpen(false);
    showToast('Profile editing is not available yet.', 'info');
  };

  // ==========================================
  // HANDLERS — PASSWORD CHANGE
  // ==========================================
  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleClearPasswordForm = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const validatePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword.trim()) {
      return 'Current password is required.';
    }
    if (!newPassword.trim()) {
      return 'New password is required.';
    }
    if (!confirmPassword.trim()) {
      return 'Confirm password is required.';
    }
    if (newPassword !== confirmPassword) {
      return 'New passwords do not match.';
    }
    if (newPassword.length < 8 || newPassword.length > 16) {
      return 'New password must be between 8 and 16 characters.';
    }
    if (!/[A-Z]/.test(newPassword)) {
      return 'New password must contain at least one uppercase letter.';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return 'New password must contain at least one special character.';
    }
    if (currentPassword === newPassword) {
      return 'New password must be different from your current password.';
    }
    return null;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const validationMsg = validatePassword();
    if (validationMsg) {
      setPasswordError(validationMsg);
      return;
    }

    setSubmittingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess('Password changed successfully.');
      showToast('Password changed successfully.', 'success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      const errMsg = err?.message || err?.response?.data?.message || 'Failed to change password.';
      setPasswordError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setSubmittingPassword(false);
    }
  };

  // ==========================================
  // HANDLERS — PREFERENCES
  // ==========================================
  const handleTogglePref = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavingPreferences(true);
    setTimeout(() => {
      try {
        localStorage.setItem('platform_preferences', JSON.stringify(preferences));
      } catch (err) {
        console.error(err);
      }
      setSavingPreferences(false);
      showToast('Preferences saved successfully.', 'success');
    }, 300);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* ========================================
          HEADER
      ======================================== */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>Admin Settings</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', margin: 0 }}>
          Manage your administrator account and platform preferences
        </p>
      </div>

      {/* ========================================
          MAIN TWO-COLUMN GRID LAYOUT
      ======================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* ====================================================
            LEFT COLUMN: PROFILE & PREFERENCES
        ==================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* SECTION 1 — ADMINISTRATOR PROFILE */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  Administrator Profile
                </h2>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleOpenEditProfile}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Edit3 size={14} /> Edit Profile
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Full Name
                </span>
                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginTop: '2px',
                    marginBottom: 0,
                  }}
                >
                  {user?.name || 'System Administrator'}
                </p>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Email Address
                </span>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-main)',
                    marginTop: '2px',
                    marginBottom: 0,
                  }}
                >
                  {user?.email || 'admin@storerating.com'}
                </p>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Assigned Role
                </span>
                <div style={{ marginTop: '4px' }}>
                  <span className="badge badge-admin">
                    {user?.role || 'SYSTEM_ADMIN'}
                  </span>
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Account Status
                </span>
                <div
                  style={{
                    marginTop: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#10b981',
                    }}
                  />
                  Active
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5 — PLATFORM PREFERENCES */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Sliders size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Platform Preferences
              </h2>
            </div>

            <form onSubmit={handleSavePreferences}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={() => handleTogglePref('emailNotifications')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Send system email notifications for administrative events</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={preferences.auditLogging}
                    onChange={() => handleTogglePref('auditLogging')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Enable detailed audit log records for administrative actions</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={preferences.compactTables}
                    onChange={() => handleTogglePref('compactTables')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Use compact row height in dashboard tables</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingPreferences}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} />
                  {savingPreferences ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ====================================================
            RIGHT COLUMN: CHANGE PASSWORD & SECURITY
        ==================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* SECTION 3 — CHANGE PASSWORD */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <KeyRound size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Change Password
              </h2>
            </div>

            {passwordError && (
              <div
                style={{
                  padding: '12px 16px',
                  marginBottom: '18px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#dc2626',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div
                style={{
                  padding: '12px 16px',
                  marginBottom: '18px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#059669',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              {/* CURRENT PASSWORD */}
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    className="form-input"
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChangeInput}
                    disabled={submittingPassword || authLoading}
                    autoComplete="current-password"
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
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
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* NEW PASSWORD */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    className="form-input"
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChangeInput}
                    disabled={submittingPassword || authLoading}
                    autoComplete="new-password"
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
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
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <span
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                  }}
                >
                  8–16 characters, at least 1 uppercase letter and 1 special character.
                </span>
              </div>

              {/* CONFIRM NEW PASSWORD */}
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="form-input"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChangeInput}
                    disabled={submittingPassword || authLoading}
                    autoComplete="new-password"
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
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
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* BUTTONS */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '20px',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClearPasswordForm}
                  disabled={submittingPassword || authLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingPassword || authLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <KeyRound size={16} />
                  {submittingPassword ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          {/* SECTION 4 — ACCOUNT SECURITY */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Shield size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Account Security
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Authentication Protocol
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                  JWT (Bearer Token)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Role Level
                </span>
                <span className="badge badge-admin">
                  SYSTEM_ADMIN
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Account Status
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                  Active
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Security Guards
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Passport JWT & RBAC
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Administrator Profile"
      >
        <form onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditProfileOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSettingsPage;
