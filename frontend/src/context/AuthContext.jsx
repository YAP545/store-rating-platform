import React, {
  createContext,
  useState,
  useEffect,
} from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error('Invalid saved user:', error);
      localStorage.removeItem('user');
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token');
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (email, password) => {
    setLoading(true);

    try {
      const res = await API.post('/auth/login', {
        email,
        password,
      });

      const accessToken = res.data.accessToken;
      const userData = res.data.user;

      if (!accessToken || !userData) {
        throw new Error('Invalid login response from server.');
      }

      localStorage.setItem('token', accessToken);
      localStorage.setItem(
        'user',
        JSON.stringify(userData)
      );

      setToken(accessToken);
      setUser(userData);

      showToast(
        'Welcome back! Login successful.',
        'success'
      );

      return userData;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check credentials.';

      showToast(message, 'error');

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (
    name,
    email,
    address,
    password
  ) => {
    setLoading(true);

    try {
      const res = await API.post('/auth/register', {
        name,
        email,
        address,
        password,
      });

      const accessToken = res.data.accessToken;
      const userData = res.data.user;

      if (!accessToken || !userData) {
        throw new Error(
          'Invalid registration response from server.'
        );
      }

      localStorage.setItem('token', accessToken);
      localStorage.setItem(
        'user',
        JSON.stringify(userData)
      );

      setToken(accessToken);
      setUser(userData);

      showToast(
        'Registration successful! Account created.',
        'success'
      );

      return userData;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please try again.';

      showToast(message, 'error');

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const changePassword = async (
    currentPassword,
    newPassword
  ) => {
    setLoading(true);

    try {
      const res = await API.post(
        '/auth/change-password',
        {
          currentPassword,
          newPassword,
        }
      );

      showToast(
        'Password updated successfully!',
        'success'
      );

      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Failed to update password.';

      showToast(message, 'error');

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);

    showToast(
      'Logged out successfully',
      'info'
    );
  };

  // ==========================================
  // AUTH STATE
  // ==========================================

  const isAuthenticated =
    Boolean(token) && Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        toast,
        showToast,
        login,
        register,
        changePassword,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;