import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../services/api';

// Criar contexto de autenticação
const AuthContext = createContext();

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provedor de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        // Verificar se há token no localStorage
        if (authService.isAuthenticated()) {
          // Buscar dados do usuário
          const { data } = await authService.getProfile();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Se houver erro, limpar token
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Função para login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await authService.login({ email, password });
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError(error.response?.data?.error?.message || 'Erro ao fazer login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para registro
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await authService.register(userData);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setError(error.response?.data?.error?.message || 'Erro ao registrar');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para logout
  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/auth/login');
  };

  // Função para atualizar perfil
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await authService.updateProfile(profileData);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError(error.response?.data?.error?.message || 'Erro ao atualizar perfil');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar senha
  const updatePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await authService.updatePassword(passwordData);
      return data;
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      setError(error.response?.data?.error?.message || 'Erro ao atualizar senha');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Valores a serem disponibilizados pelo contexto
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
