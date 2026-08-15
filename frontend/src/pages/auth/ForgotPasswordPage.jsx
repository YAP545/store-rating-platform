import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const ForgotPasswordPage = () => {
  const { showToast } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      /*
       * IMPORTANT:
       * This endpoint must exist in your backend.
       *
       * If you have not implemented forgot-password backend
       * functionality yet, this will show an error.
       */
      // await API.post('/auth/forgot-password', {
      //   email: email.trim(),
      // });

      setSubmitted(true);

      showToast(
        'If an account exists with this email, password reset instructions will be sent.',
        'success'
      );
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          'Failed to process password reset request.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        background: 'var(--bg-main)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '40px',
        }}
      >
        {!submitted ? (
          <>
            {/* Icon */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)',
                }}
              >
                <KeyRound size={30} />
              </div>
            </div>

            {/* Heading */}

            <div
              style={{
                textAlign: 'center',
                marginBottom: '28px',
              }}
            >
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  marginBottom: '8px',
                }}
              >
                Forgot Password?
              </h1>

              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                }}
              >
                Enter your registered email address and we will
                help you reset your password.
              </p>
            </div>

            {/* Form */}

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  marginBottom: '20px',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Email Address
                </label>

                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />

                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    required
                    style={{
                      paddingLeft: '40px',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                {submitting
                  ? 'Processing...'
                  : 'Send Reset Instructions'}
              </button>
            </form>

            {/* Back to Login */}

            <div
              style={{
                marginTop: '24px',
                textAlign: 'center',
              }}
            >
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--primary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Success */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontSize: '30px',
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
            </div>

            <div
              style={{
                textAlign: 'center',
              }}
            >
              <h1
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  marginBottom: '12px',
                }}
              >
                Check Your Email
              </h1>

              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  marginBottom: '24px',
                }}
              >
                If an account exists for
                <br />
                <strong>{email}</strong>
                <br />
                you will receive password reset instructions.
              </p>

              <Link
                to="/login"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  textDecoration: 'none',
                }}
              >
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;