import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

// Componente de proteção de rotas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Verificar se estamos no lado do cliente
  const isClient = typeof window !== 'undefined';

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/'
  ];

  // Verificar se a rota atual é pública
  const isPublicRoute = publicRoutes.includes(router.pathname);

  // Efeito para redirecionar se necessário
  React.useEffect(() => {
    if (isClient && !loading) {
      // Se o usuário não estiver autenticado e a rota não for pública
      if (!user && !isPublicRoute) {
        router.push('/auth/login');
      }
      
      // Se o usuário estiver autenticado e a rota for de autenticação
      if (user && router.pathname.startsWith('/auth/')) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, isPublicRoute, router, isClient]);

  // Mostrar nada enquanto carrega ou redireciona
  if (loading || (!user && !isPublicRoute) || (user && router.pathname.startsWith('/auth/'))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Renderizar o conteúdo da página
  return children;
};

export default ProtectedRoute;
