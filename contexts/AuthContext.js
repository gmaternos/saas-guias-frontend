import { createContext, useState, useEffect, useContext } from 'react';
import api from '@/services/api';

// Verificar se estamos no servidor
const isServer = typeof window === 'undefined';

// Criar o contexto de autenticação
const AuthContext = createContext();

// Provedor do contexto de autenticação
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Verificar autenticação ao carregar
  useEffect(() => {
    // Não executar no servidor
    if (isServer) return;

    const checkAuth = async () => {
      setLoading(true);
      try {
        // Verificar se há token no localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setCurrentUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }
        
        // Configurar token no cabeçalho das requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Buscar perfil do usuário
        const response = await api.get('/user/profile');
        
        if (response.data.success) {
          setCurrentUser({ token });
          setUserProfile(response.data.data.user);
        } else {
          // Token inválido ou expirado
          localStorage.removeItem('token');
          setCurrentUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('token');
        setCurrentUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Função de login
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token } = response.data.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Buscar perfil após login
        const profileResponse = await api.get('/user/profile');
        
        if (profileResponse.data.success) {
          setCurrentUser({ token });
          setUserProfile(profileResponse.data.data.user);
          return true;
        }
      } else {
        setAuthError(response.data.message || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setAuthError(error.response?.data?.message || 'Erro ao conectar ao servidor');
    }
    return false;
  };

  // Função de registro
  const register = async (userData) => {
    setAuthError(null);
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { token } = response.data.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Buscar perfil após registro
        const profileResponse = await api.get('/user/profile');
        
        if (profileResponse.data.success) {
          setCurrentUser({ token });
          setUserProfile(profileResponse.data.data.user);
          return true;
        }
      } else {
        setAuthError(response.data.message || 'Erro ao registrar');
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setAuthError(error.response?.data?.message || 'Erro ao conectar ao servidor');
    }
    return false;
  };

  // Função de login com Google
  const loginWithGoogle = async (googleToken) => {
    setAuthError(null);
    try {
      const response = await api.post('/auth/google', { token: googleToken });
      
      if (response.data.success) {
        const { token } = response.data.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Buscar perfil após login com Google
        const profileResponse = await api.get('/user/profile');
        
        if (profileResponse.data.success) {
          setCurrentUser({ token });
          setUserProfile(profileResponse.data.data.user);
          return true;
        }
      } else {
        setAuthError(response.data.message || 'Erro ao fazer login com Google');
      }
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
      setAuthError(error.response?.data?.message || 'Erro ao conectar ao servidor');
    }
    return false;
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    setUserProfile(null);
    return true;
  };

  // Função para redefinir senha
  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      const response = await api.post('/auth/reset-password', { email });
      
      if (response.data.success) {
        return true;
      } else {
        setAuthError(response.data.message || 'Erro ao solicitar redefinição de senha');
      }
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      setAuthError(error.response?.data?.message || 'Erro ao conectar ao servidor');
    }
    return false;
  };

  // Função para completar perfil
  const completeProfile = async (profileData) => {
    setAuthError(null);
    try {
      const response = await api.post('/user/complete-profile', profileData);
      
      if (response.data.success) {
        setUserProfile(response.data.data.user);
        return true;
      } else {
        setAuthError(response.data.message || 'Erro ao completar perfil');
      }
    } catch (error) {
      console.error('Erro ao completar perfil:', error);
      setAuthError(error.response?.data?.message || 'Erro ao conectar ao servidor');
    }
    return false;
  };

  // Função para atualizar perfil
  const updateProfile = async (profileData) => {
    setAuthError(null);
    try {
      const response = await api.put('/user/profile', profileData);
      
      if (response.data.success) {
        setUserProfile(response.data.data.user);
        return true;
      } else {
        setAuthError(response.data.message || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setAuthError(error.response?.data?.message || 'Erro ao conectar ao servidor');
    }
    return false;
  };

  // Valor do contexto
  const value = {
    currentUser,
    userProfile,
    loading,
    authError,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    completeProfile,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  // Retornar um objeto vazio se estiver no servidor
  if (isServer) {
    return {
      currentUser: null,
      userProfile: null,
      loading: false,
      authError: null,
      login: () => Promise.resolve(false),
      register: () => Promise.resolve(false),
      loginWithGoogle: () => Promise.resolve(false),
      logout: () => Promise.resolve(false),
      resetPassword: () => Promise.resolve(false),
      completeProfile: () => Promise.resolve(false),
      updateProfile: () => Promise.resolve(false)
    };
  }
  
  const context = useContext(AuthContext);
  
  // Garantir que sempre retorne um objeto válido, mesmo se o contexto for undefined
  return context || {
    currentUser: null,
    userProfile: null,
    loading: false,
    authError: null,
    login: () => Promise.resolve(false),
    register: () => Promise.resolve(false),
    loginWithGoogle: () => Promise.resolve(false),
    logout: () => Promise.resolve(false),
    resetPassword: () => Promise.resolve(false),
    completeProfile: () => Promise.resolve(false),
    updateProfile: () => Promise.resolve(false)
  };
};
