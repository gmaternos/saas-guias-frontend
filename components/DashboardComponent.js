import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Componentes
import Header from './Header';
import Footer from './Footer';
import ContentCard from './ContentCard';
import ToolCard from './ToolCard';
import MilestoneCard from './MilestoneCard';
import LoadingSpinner from './LoadingSpinner';

export default function DashboardComponent() {
  const router = useRouter();
  const { userProfile, loading: authLoading } = useAuth();
  const [recommendedContent, setRecommendedContent] = useState([]);
  const [tools, setTools] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Verificar se estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Função para obter saudação baseada na hora do dia
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Função para obter mensagem personalizada baseada na fase materna
  const getPersonalizedMessage = (fase) => {
    switch (fase) {
      case 'gestante':
        return 'Como está se sentindo hoje? Aqui estão algumas informações úteis para sua gestação.';
      case 'recem_nascido':
        return 'Sabemos que esses primeiros meses são intensos. Estamos aqui para ajudar!';
      case 'bebe_4_12':
        return 'Seu bebê está crescendo! Acompanhe seu desenvolvimento e descubra novas atividades.';
      case 'crianca_1_3':
        return 'A fase de descobertas continua! Veja dicas para estimular o desenvolvimento do seu pequeno.';
      case 'planejando':
        return 'Preparando-se para essa jornada incrível? Temos conteúdos especiais para você.';
      default:
        return 'Bem-vinda ao seu espaço personalizado!';
    }
  };

  // Função para obter ícone baseado na fase materna
  const getPhaseIcon = (fase) => {
    switch (fase) {
      case 'gestante':
        return '🤰';
      case 'recem_nascido':
        return '👶';
      case 'bebe_4_12':
        return '🍼';
      case 'crianca_1_3':
        return '🧒';
      case 'planejando':
        return '📝';
      default:
        return '💜';
    }
  };

  // Buscar dados ao carregar a página
  useEffect(() => {
    // Não executar no servidor
    if (!isClient) return;
    
    const fetchDashboardData = async () => {
      if (authLoading || !userProfile) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Buscar conteúdos recomendados
        const contentResponse = await api.get('/content/recommended', {
          params: { limit: 6 }
        });
        setRecommendedContent(contentResponse.data.data.conteudos);
        
        // Buscar ferramentas relevantes para a fase
        const toolsResponse = await api.get('/tools', {
          params: { fase: userProfile.fase_materna, limit: 4 }
        });
        setTools(toolsResponse.data.data.ferramentas);
        
        // Buscar marcos de desenvolvimento
        const milestonesResponse = await api.get('/milestones', {
          params: { fase: userProfile.fase_materna, limit: 3 }
        });
        setMilestones(milestonesResponse.data.data.marcos);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        setError('Não foi possível carregar algumas informações. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
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
        <p className="mb-6 text-center">Você precisa estar logado para acessar esta página.</p>
        <Link href="/auth/login">
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
        <title>Dashboard | Guias Maternos</title>
        <meta name="description" content="Seu espaço personalizado no Guias Maternos" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* Banner de boas-vindas */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-10 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {getGreeting()}, {userProfile.nome.split(' ')[0]}! {getPhaseIcon(userProfile.fase_materna)}
                </h1>
                <p className="text-lg opacity-90">
                  {getPersonalizedMessage(userProfile.fase_materna)}
                </p>
              </div>
              <div className="mt-6 md:mt-0">
                <Link href="/ferramentas">
                  <a className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Explorar Ferramentas
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}

          {/* Conteúdo Recomendado */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Conteúdo Recomendado para Você</h2>
              <Link href="/conteudo">
                <a className="text-purple-600 hover:text-purple-800 font-medium">Ver todos</a>
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : recommendedContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedContent.map((content) => (
                  <ContentCard key={content._id} content={content} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">
                  Ainda não temos recomendações personalizadas para você. 
                  Continue explorando a plataforma para recebermos mais informações sobre seus interesses.
                </p>
              </div>
            )}
          </section>

          {/* Ferramentas Úteis */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Ferramentas para sua Fase</h2>
              <Link href="/ferramentas">
                <a className="text-purple-600 hover:text-purple-800 font-medium">Ver todas</a>
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : tools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tools.map((tool) => (
                  <ToolCard key={tool._id} tool={tool} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">
                  Estamos preparando ferramentas especiais para sua fase. 
                  Em breve teremos novidades!
                </p>
              </div>
            )}
          </section>

          {/* Marcos de Desenvolvimento */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Marcos de Desenvolvimento</h2>
              <Link href="/marcos">
                <a className="text-purple-600 hover:text-purple-800 font-medium">Ver todos</a>
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : milestones.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {milestones.map((milestone, index) => (
                  <MilestoneCard 
                    key={milestone._id} 
                    milestone={milestone} 
                    isLast={index === milestones.length - 1} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">
                  Não encontramos marcos de desenvolvimento para sua fase atual.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
