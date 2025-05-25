import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import api from '../services/api';

// Verificar se estamos no servidor ou no cliente
const isServer = typeof window === 'undefined';

// Criar contexto de autenticação
const AuthContext = createContext();

// Provider de autenticação
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const router = useRouter();

  // Efeito para monitorar mudanças no estado de autenticação
  useEffect(() => {
    // Não executar no servidor
    if (isServer) {
      setLoading(false);
      return;
    }

    const setupAuth = async () => {
      try {
        // Importar Firebase dinamicamente apenas no cliente
        const { getAuth, onAuthStateChanged } = await import('firebase/auth');
        const auth = getAuth();
        
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          setCurrentUser(user);
          setLoading(true);
          
          if (user) {
            try {
              // Buscar perfil do usuário na API
              const response = await api.get('/auth/profile');
              setUserProfile(response.data.data.user);
            } catch (error) {
              console.error('Erro ao buscar perfil do usuário:', error);
              
              // Se o perfil não existir, redirecionar para completar cadastro
              if (error.response && error.response.status === 404) {
                router.push('/auth/complete-profile');
              }
            }
          } else {
            setUserProfile(null);
          }
          
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Erro ao inicializar Firebase Auth:', error);
        setLoading(false);
      }
    };
    
    setupAuth();
  }, [router]);

  // Função para login com email e senha
  const login = async (email, password) => {
    if (isServer) return false;
    
    setAuthError(null);
    try {
      const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      setAuthError(getAuthErrorMessage(error.code));
      return false;
    }
  };

  // Função para registro com email e senha
  const register = async (email, password) => {
    if (isServer) return false;
    
    setAuthError(null);
    try {
      const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Erro no registro:', error);
      setAuthError(getAuthErrorMessage(error.code));
      return false;
    }
  };

  // Função para login com Google
  const loginWithGoogle = async () => {
    if (isServer) return false;
    
    setAuthError(null);
    try {
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return true;
    } catch (error) {
      console.error('Erro no login com Google:', error);
      setAuthError(getAuthErrorMessage(error.code));
      return false;
    }
  };

  // Função para logout
  const logout = async () => {
    if (isServer) return false;
    
    try {
      const { getAuth, signOut } = await import('firebase/auth');
      const auth = getAuth();
      await signOut(auth);
      router.push('/');
      return true;
    } catch (error) {
      console.error('Erro no logout:', error);
      return false;
    }
  };

  // Função para recuperação de senha
  const resetPassword = async (email) => {
    if (isServer) return false;
    
    setAuthError(null);
    try {
      const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      setAuthError(getAuthErrorMessage(error.code));
      return false;
    }
  };

  // Função para completar perfil do usuário
  const completeProfile = async (userData) => {
    if (isServer) return false;
    
    try {
      const response = await api.post('/auth/register', userData);
      setUserProfile(response.data.data.user);
      return true;
    } catch (error) {
      console.error('Erro ao completar perfil:', error);
      return false;
    }
  };

  // Função para atualizar perfil do usuário
  const updateProfile = async (userData) => {
    if (isServer) return false;
    
    try {
      const response = await api.put('/auth/profile', userData);
      setUserProfile(response.data.data.user);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  };

  // Função para obter mensagem de erro amigável
  const getAuthErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado. Verifique seu email.';
      case 'auth/wrong-password':
        return 'Senha incorreta. Tente novamente.';
      case 'auth/email-already-in-use':
        return 'Este email já está sendo usado por outra conta.';
      case 'auth/weak-password':
        return 'A senha é muito fraca. Use pelo menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'Email inválido. Verifique o formato.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      default:
        return 'Ocorreu um erro. Tente novamente.';
    }
  };

  // Valores do contexto
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
};

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
  
  return useContext(AuthContext);
};
