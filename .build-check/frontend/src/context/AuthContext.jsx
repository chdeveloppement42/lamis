import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // On mount, check if there's a user in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password, redirectPath = null) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { access_token, user } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      // Route based on redirectPath or user type
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (user.userType === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/provider/profile'); // Or wherever provider dashboard is
      }

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      // We throw the error so the UI can catch it and display messages (e.g. invalid creds or suspended)
      throw error; 
    }
  };

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Tell the backend to clear the HttpOnly refresh_token cookie
      await axiosInstance.post('/auth/logout');
    } catch {
      // Proceed with client-side logout even if the call fails
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const hasPermission = (action) => {
    if (!user || user.userType !== 'ADMIN') return false;
    if (user.isSuperAdmin) return true;
    // SuperAdmin gets all permissions from the backend, but just in case:
    if (user.permissions?.includes('all')) return true;
    return user.permissions?.includes(action);
  };

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    register,
    logout,
    hasPermission,
    setUser
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
