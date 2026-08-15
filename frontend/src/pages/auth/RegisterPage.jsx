import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Store, UserPlus, User, Mail, MapPin, Lock } from 'lucide-react';

const RegisterPage = () => {
  const { register, isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'SYSTEM_ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'STORE_OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/user/stores');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.name || !formData.email || !formData.address || !formData.password) {
      return 'All fields are required';
    }
    if (formData.name.length < 20 || formData.name.length > 60) {
      return 'Name must be between 20 and 60 characters long';
    }
    if (formData.address.length > 400) {
      return 'Address cannot exceed 400 characters';
    }
    if (formData.password.length < 8 || formData.password.length > 16) {
      return 'Password must be between 8 and 16 characters';
    }
    if (!/[A-Z]/.test(formData.password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await register(formData.name, formData.email, formData.address, formData.password);
      navigate('/user/stores');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '16px', background: 'rgba(236, 72, 153, 0.15)', color: 'var(--accent-pink)', marginBottom: '12px' }}>
            <Store size={36} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>Create Account</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Register as a normal user to discover and rate stores
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name (20–60 characters)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Alexander Hamilton Registered Client"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ paddingLeft: '40px' }}
              />
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <span style={{ fontSize: '11px', color: formData.name.length < 20 || formData.name.length > 60 ? '#fca5a5' : 'var(--text-muted)' }}>
              Current length: {formData.name.length} chars (Min 20, Max 60)
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Physical Address (Max 400 characters)</label>
            <div style={{ position: 'relative' }}>
              <textarea
                name="address"
                className="form-textarea"
                rows={2}
                placeholder="123 Main Street, Suite 400, Springfield"
                value={formData.address}
                onChange={handleChange}
                required
                style={{ paddingLeft: '40px' }}
              />
              <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '20px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password (8–16 chars, 1 Uppercase, 1 Special)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Password@123"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '12px' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Complete Registration'} <UserPlus size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
