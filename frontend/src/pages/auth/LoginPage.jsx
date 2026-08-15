import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  Store,
  LogIn,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

const LoginPage = () => {
  const { login, isAuthenticated, user, showToast } =
    useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('NORMAL_USER');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get('expired') === 'true') {
      showToast(
        'Your session has expired. Please log in again.',
        'info'
      );
    }
  }, [location, showToast]);

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

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);

    try {
      const loggedUser = await login(email, password);

      if (
        selectedRole === 'SYSTEM_ADMIN' &&
        loggedUser.role !== 'SYSTEM_ADMIN'
      ) {
        setError(
          'This account is not a System Admin account. Please select the correct login type.'
        );
        return;
      }

      if (
        selectedRole === 'STORE_OWNER' &&
        loggedUser.role !== 'STORE_OWNER'
      ) {
        setError(
          'This account is not a Store Owner account. Please select the correct login type.'
        );
        return;
      }

      if (
        selectedRole === 'NORMAL_USER' &&
        loggedUser.role !== 'NORMAL_USER'
      ) {
        setError(
          'This account is not a Normal User account. Please select the correct login type.'
        );
        return;
      }

      if (loggedUser.role === 'SYSTEM_ADMIN') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'STORE_OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/user/stores');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const loginOptions = [
    {
      role: 'NORMAL_USER',
      title: 'User Login',
      description: 'Rate and review stores',
      icon: User,
    },
    {
      role: 'STORE_OWNER',
      title: 'Store Owner',
      description: 'Manage your store',
      icon: Store,
    },
    {
      role: 'SYSTEM_ADMIN',
      title: 'Admin Login',
      description: 'Manage the platform',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="login-page">

      {/* Decorative Background */}
      <div className="login-decoration login-decoration-one"></div>
      <div className="login-decoration login-decoration-two"></div>
      <div className="login-decoration login-decoration-three"></div>
      <div className="login-decoration login-decoration-four"></div>

      {/* Header */}
      <header className="login-top-header">

        <Link to="/" className="login-brand">
          <div className="login-brand-icon">
            <Store size={32} strokeWidth={2.2} />
          </div>

          <div className="login-brand-text">
            <span className="brand-store">Store</span>
            <span className="brand-platform">Rating</span>
          </div>
        </Link>

        <Link to="/" className="back-home-button">
          <ArrowLeft size={17} />
          <span>Back to Home</span>
        </Link>

      </header>

      {/* Main */}
      <main className="login-content">

        <div className="login-card">

          {/* Login Header */}
          <div className="login-header">

            <div className="login-header-icon">
              <Store size={36} strokeWidth={2} />
            </div>

            <h1>Welcome Back</h1>

            <p>
              Sign in to access your Store Rating account
            </p>

          </div>

          {/* Login Type */}
          <div className="login-type-section">

            <p className="login-type-title">
              Choose your login type
            </p>

            <div className="login-options">

              {loginOptions.map((option) => {
                const Icon = option.icon;
                const isSelected =
                  selectedRole === option.role;

                return (
                  <button
                    key={option.role}
                    type="button"
                    className={
                      isSelected
                        ? 'login-option selected'
                        : 'login-option'
                    }
                    onClick={() =>
                      handleRoleSelect(option.role)
                    }
                    disabled={submitting}
                  >

                    <div className="login-option-icon">
                      <Icon
                        size={27}
                        strokeWidth={2}
                      />
                    </div>

                    <div className="login-option-title">
                      {option.title}
                    </div>

                    <div className="login-option-description">
                      {option.description}
                    </div>

                  </button>
                );
              })}

            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* Email */}
            <div className="form-group">

              <label
                htmlFor="login-email"
                className="form-label"
              >
                Email Address
              </label>

              <div className="login-input-wrapper">

                <Mail
                  size={18}
                  className="login-input-icon"
                />

                <input
                  id="login-email"
                  type="email"
                  className="login-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  disabled={submitting}
                  autoComplete="email"
                  required
                />

              </div>

            </div>

            {/* Password */}
            <div className="form-group">

              <label
                htmlFor="login-password"
                className="form-label"
              >
                Password
              </label>

              <div className="login-input-wrapper">

                <Lock
                  size={18}
                  className="login-input-icon"
                />

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  className="login-input password-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  disabled={submitting}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={submitting}
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* Remember / Forgot */}
            <div className="login-extra">

              <label className="remember-label">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  disabled={submitting}
                />

                <span className="custom-checkbox">
                  {rememberMe && (
                    <Check size={13} strokeWidth={3} />
                  )}
                </span>

                <span>Remember me</span>

              </label>

              <Link
                to="/forgot-password"
                className="forgot-link"
              >
                Forgot Password?
              </Link>

            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-submit"
              disabled={submitting}
            >

              {submitting ? (
                <>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn size={18} />
                </>
              )}

            </button>

          </form>

          {/* Divider */}
          <div className="login-divider">

            <span></span>

            <div>OR</div>

            <span></span>

          </div>

          {/* Register */}
          <div className="login-register">

            <span>
              Don't have a normal user account?{' '}
            </span>

            <Link to="/register">
              Register here
            </Link>

          </div>

        </div>

      </main>

      {/* Page Styles */}
      <style>{`

        /* =====================================================
           LOGIN PAGE
        ===================================================== */

        .login-page {
          min-height: 100vh;
          width: 100%;
          position: relative;

          display: flex;
          flex-direction: column;

          background: linear-gradient(
            135deg,
            #f7ffff 0%,
            #f2fbfb 45%,
            #ffffff 100%
          );

          overflow-x: hidden;

          color: #10213d;

          box-sizing: border-box;
        }

        .login-page *,
        .login-page *::before,
        .login-page *::after {
          box-sizing: border-box;
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .login-top-header {
          min-height: 82px;
          width: 100%;

          padding: 0 38px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          background: #ffffff;

          border-bottom: 2px solid #159a92;

          position: relative;

          z-index: 10;
        }


        /* =====================================================
           BRAND
        ===================================================== */

        .login-brand {
          display: flex;
          align-items: center;

          gap: 12px;

          text-decoration: none;

          color: #10213d;
        }

        .login-brand-icon {
          width: 45px;
          height: 45px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #078b83;
        }

        .login-brand-text {
          font-size: 24px;
          font-weight: 800;
        }

        .brand-store {
          color: #078b83;
        }

        .brand-platform {
          color: #10213d;
          margin-left: 5px;
        }


        /* =====================================================
           BACK HOME
        ===================================================== */

        .back-home-button {
          height: 44px;

          padding: 0 20px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 9px;

          border: 1.5px solid #078b83;

          border-radius: 9px;

          background: #ffffff;

          color: #087c76;

          font-size: 14px;
          font-weight: 700;

          text-decoration: none;

          transition: all 0.2s ease;
        }

        .back-home-button:hover {
          background: #edfafa;
          transform: translateY(-1px);
        }


        /* =====================================================
           MAIN
        ===================================================== */

        .login-content {
          flex: 1;

          width: 100%;

          display: flex;

          align-items: center;
          justify-content: center;

          padding: 35px 20px 45px;

          position: relative;

          z-index: 2;
        }


        /* =====================================================
           CARD
        ===================================================== */

        .login-card {
          width: 100%;

          max-width: 660px;

          padding: 38px 42px 34px;

          background: rgba(255, 255, 255, 0.98);

          border: 1px solid #e3e9ef;

          border-radius: 20px;

          box-shadow:
            0 18px 45px rgba(16, 33, 61, 0.12);

          position: relative;

          z-index: 5;
        }


        /* =====================================================
           LOGIN HEADER
        ===================================================== */

        .login-header {
          text-align: center;

          margin-bottom: 30px;
        }

        .login-header-icon {
          width: 72px;
          height: 72px;

          margin: 0 auto 18px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #e9f8f6;

          color: #078b83;
        }

        .login-header h1 {
          margin: 0;

          font-size: 31px;

          line-height: 1.2;

          font-weight: 800;

          color: #10213d;
        }

        .login-header p {
          margin: 9px 0 0;

          color: #5d708c;

          font-size: 15px;

          line-height: 1.5;
        }


        /* =====================================================
           LOGIN TYPE
        ===================================================== */

        .login-type-section {
          margin-bottom: 25px;
        }

        .login-type-title {
          margin: 0 0 14px;

          text-align: center;

          font-size: 15px;

          font-weight: 800;

          color: #111d32;
        }

        .login-options {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 14px;
        }

        .login-option {
          min-height: 126px;

          padding: 18px 10px;

          border: 1.5px solid #dce4ed;

          border-radius: 13px;

          background: #ffffff;

          cursor: pointer;

          color: #10213d;

          text-align: center;

          transition: all 0.2s ease;

          font-family: inherit;
        }

        .login-option:hover {
          border-color: #48aaa4;

          background: #f7fcfc;
        }

        .login-option.selected {
          border: 2px solid #078b83;

          background: #effaf9;

          box-shadow:
            0 5px 15px
            rgba(7, 139, 131, 0.08);
        }

        .login-option:disabled {
          cursor: not-allowed;

          opacity: 0.65;
        }

        .login-option-icon {
          color: #64758c;

          margin-bottom: 10px;

          display: flex;

          justify-content: center;
        }

        .login-option.selected
        .login-option-icon {
          color: #078b83;
        }

        .login-option-title {
          font-size: 15px;

          font-weight: 800;

          margin-bottom: 6px;
        }

        .login-option-description {
          color: #5d708c;

          font-size: 12px;

          line-height: 1.4;
        }


        /* =====================================================
           ERROR
        ===================================================== */

        .login-error {
          margin-bottom: 18px;

          padding: 12px 14px;

          border: 1px solid #f0b5b5;

          border-radius: 9px;

          background: #fff3f3;

          color: #b42318;

          font-size: 13px;

          line-height: 1.5;
        }


        /* =====================================================
           FORM
        ===================================================== */

        .login-form {
          width: 100%;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-label {
          display: block;

          margin-bottom: 8px;

          font-size: 14px;

          font-weight: 700;

          color: #33445e;
        }


        /* =====================================================
           INPUT
        ===================================================== */

        .login-input-wrapper {
          position: relative;

          width: 100%;
        }

        .login-input-icon {
          position: absolute;

          left: 14px;

          top: 50%;

          transform:
            translateY(-50%);

          color: #6b7d95;

          z-index: 2;

          pointer-events: none;
        }

        .login-input {
          width: 100%;

          height: 51px;

          padding:
            0 45px 0 45px;

          border: 1.5px solid #d2ddea;

          border-radius: 9px;

          background: #ffffff;

          color: #182943;

          font-size: 14px;

          outline: none;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .login-input:focus {
          border-color: #078b83;

          box-shadow:
            0 0 0 3px
            rgba(7, 139, 131, 0.10);
        }

        .login-input::placeholder {
          color: #8b9bb0;
        }

        .login-input:disabled {
          background: #f6f8fa;

          cursor: not-allowed;
        }


        /* =====================================================
           PASSWORD
        ===================================================== */

        .password-input {
          padding-right: 48px;
        }

        .password-toggle {
          position: absolute;

          right: 13px;

          top: 50%;

          transform:
            translateY(-50%);

          border: none;

          background: transparent;

          color: #70819a;

          cursor: pointer;

          padding: 4px;

          display: flex;

          align-items: center;

          justify-content: center;
        }

        .password-toggle:hover {
          color: #078b83;
        }


        /* =====================================================
           REMEMBER / FORGOT
        ===================================================== */

        .login-extra {
          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-top: 3px;

          margin-bottom: 19px;
        }

        .remember-label {
          display: flex;

          align-items: center;

          gap: 9px;

          color: #62738b;

          font-size: 13px;

          cursor: pointer;

          user-select: none;
        }

        .remember-label input {
          display: none;
        }

        .custom-checkbox {
          width: 19px;

          height: 19px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 4px;

          border: 1.5px solid #078b83;

          background: #ffffff;

          color: #ffffff;
        }

        .remember-label
        input:checked
        + .custom-checkbox {
          background: #078b83;
        }

        .forgot-link {
          color: #078b83;

          font-size: 13px;

          font-weight: 700;

          text-decoration: none;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }


        /* =====================================================
           SIGN IN
        ===================================================== */

        .login-submit {
          width: 100%;

          height: 55px;

          border: none;

          border-radius: 9px;

          background: #078b83;

          color: #ffffff;

          font-size: 16px;

          font-weight: 800;

          cursor: pointer;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 9px;

          transition: all 0.2s ease;

          box-shadow:
            0 7px 18px
            rgba(7, 139, 131, 0.18);
        }

        .login-submit:hover:not(:disabled) {
          background: #06766f;

          transform: translateY(-1px);

          box-shadow:
            0 9px 22px
            rgba(7, 139, 131, 0.25);
        }

        .login-submit:disabled {
          opacity: 0.7;

          cursor: not-allowed;
        }


        /* =====================================================
           DIVIDER
        ===================================================== */

        .login-divider {
          display: flex;

          align-items: center;

          gap: 14px;

          margin: 23px 0;
        }

        .login-divider span {
          flex: 1;

          height: 1px;

          background: #e4e9ef;
        }

        .login-divider div {
          color: #74849a;

          font-size: 13px;
        }


        /* =====================================================
           REGISTER
        ===================================================== */

        .login-register {
          text-align: center;

          color: #61728a;

          font-size: 14px;
        }

        .login-register a {
          color: #078b83;

          font-weight: 700;

          text-decoration: none;
        }

        .login-register a:hover {
          text-decoration: underline;
        }


        /* =====================================================
           DECORATIONS
        ===================================================== */

        .login-decoration {
          position: absolute;

          pointer-events: none;

          z-index: 1;
        }

        .login-decoration-one {
          width: 220px;
          height: 220px;

          left: 75px;
          top: 15px;

          border-radius: 50%;

          background:
            rgba(7, 139, 131, 0.06);
        }

        .login-decoration-two {
          width: 430px;
          height: 430px;

          right: -170px;
          bottom: -230px;

          border-radius: 50%;

          background:
            rgba(7, 139, 131, 0.06);
        }

        .login-decoration-three {
          width: 70px;
          height: 70px;

          left: 80px;
          bottom: 120px;

          border-radius: 50%;

          background:
            rgba(7, 139, 131, 0.06);
        }

        .login-decoration-four {
          width: 110px;
          height: 110px;

          right: 65px;
          top: 110px;

          opacity: 0.45;

          background-image:
            radial-gradient(
              #9ed9d5 2px,
              transparent 2px
            );

          background-size: 22px 22px;
        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 800px) {

          .login-top-header {
            min-height: 78px;

            padding: 0 20px;
          }

          .login-brand-text {
            font-size: 20px;
          }

          .back-home-button {
            padding: 0 13px;
          }

          .login-content {
            padding:
              25px 15px 35px;
          }

          .login-card {
            max-width: 620px;

            padding:
              32px 25px 28px;
          }

          .login-options {
            gap: 10px;
          }
        }


        @media (max-width: 600px) {

          .login-card {
            padding: 28px 18px;
          }

          .login-header h1 {
            font-size: 27px;
          }

          .login-header p {
            font-size: 13px;
          }

          .login-options {
            grid-template-columns: 1fr;
          }

          .login-option {
            min-height: 90px;

            display: grid;

            grid-template-columns:
              40px 1fr;

            grid-template-rows:
              auto auto;

            column-gap: 10px;

            text-align: left;

            align-items: center;
          }

          .login-option-icon {
            grid-row: 1 / 3;

            margin: 0;

            justify-content: center;
          }

          .login-option-title {
            margin: 0;
          }

          .login-option-description {
            margin: 0;
          }

          .login-extra {
            align-items: flex-start;

            gap: 15px;
          }

        }


        @media (max-width: 400px) {

          .login-top-header {
            padding: 0 12px;
          }

          .login-brand-text {
            font-size: 17px;
          }

          .back-home-button span {
            display: none;
          }

          .login-content {
            padding:
              18px 10px 25px;
          }

          .login-card {
            border-radius: 15px;

            padding: 25px 15px;
          }

          .login-header-icon {
            width: 62px;
            height: 62px;
          }

          .login-header h1 {
            font-size: 24px;
          }

          .login-extra {
            flex-direction: column;

            align-items: flex-start;
          }

        }

      `}</style>

    </div>
  );
};

export default LoginPage;