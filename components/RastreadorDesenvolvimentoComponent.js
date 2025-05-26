import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import Head from 'next/head';
import Link from 'next/link';

// Componentes
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RastreadorDesenvolvimentoComponent() {
  // Adicionando valores padrão e verificação para useAuth
  const { userProfile = null, loading: authLoading = true } = useAuth() || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [childData, setChildData] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Verificar se estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Buscar dados ao carregar a página
  useEffect(() => {
    // Não executar no servidor
    if (!isClient) return;
    
    const fetchData = async () => {
      // Verificação adicional para evitar erros
      if (authLoading || !userProfile) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Buscar dados da criança
        const childResponse = await api.get('/child');
        setChildData(childResponse.data.data.child);
        
        // Buscar marcos de desenvolvimento
        const milestonesResponse = await api.get('/milestones/all');
        setMilestones(milestonesResponse.data.data.milestones);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userProfile, authLoading, isClient]);

  // Mostrar loading enquanto carrega autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="mb-6 text-center">Você precisa estar logado para acessar esta ferramenta.</p>
        <Link href="/login">
          <a className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Fazer Login
          </a>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Rastreador de Desenvolvimento | Guias Maternos</title>
        <meta name="description" content="Acompanhe o desenvolvimento do seu filho" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Rastreador de Desenvolvimento</h1>
          
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Conteúdo da ferramenta */}
              <p className="text-lg mb-6">
                Esta ferramenta permite acompanhar o desenvolvimento do seu filho com base em marcos importantes para cada idade.
              </p>
              
              {/* Implementação da ferramenta */}
              {/* ... Conteúdo específico da ferramenta ... */}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
