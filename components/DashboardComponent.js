import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';
import Link from 'next/link';

// Componentes
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import ToolCard from '@/components/ToolCard';
import ContentCard from '@/components/ContentCard';

export default function DashboardComponent() {
  // Adicionando valores padrão e verificação para useAuth
  const { userProfile = null, loading: authLoading = true } = useAuth() || {};
  const [isClient, setIsClient] = useState(false);

  // Verificar se estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

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
        <p className="mb-6 text-center">Você precisa estar logado para acessar o dashboard.</p>
        <Link href="/login">
          <a className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Fazer Login
          </a>
        </Link>
      </div>
    );
  }

  // Ferramentas disponíveis
  const tools = [
    {
      id: 'rastreador-desenvolvimento',
      title: 'Rastreador de Desenvolvimento',
      description: 'Acompanhe o desenvolvimento do seu filho com base em marcos importantes para cada idade.',
      icon: '📊',
      url: '/ferramentas/rastreador-desenvolvimento'
    },
    // Adicione outras ferramentas conforme necessário
  ];

  // Conteúdos em destaque
  const featuredContent = [
    {
      id: 'guia-sono',
      title: 'Guia do Sono Infantil',
      description: 'Dicas e estratégias para melhorar o sono do seu bebê.',
      image: '/images/sono.jpg',
      url: '/conteudos/guia-sono'
    },
    // Adicione outros conteúdos conforme necessário
  ];

  return (
    <>
      <Head>
        <title>Dashboard | Guias Maternos</title>
        <meta name="description" content="Dashboard de ferramentas e conteúdos para mães e pais" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            {userProfile && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Olá, {userProfile.name || 'Usuário'}</p>
                <p className="text-xs text-gray-500">Bem-vindo(a) de volta!</p>
              </div>
            )}
          </div>
          
          {/* Seção de Ferramentas */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ferramentas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map(tool => (
                <ToolCard 
                  key={tool.id}
                  title={tool.title}
                  description={tool.description}
                  icon={tool.icon}
                  url={tool.url}
                />
              ))}
            </div>
          </section>
          
          {/* Seção de Conteúdos em Destaque */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Conteúdos em Destaque</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredContent.map(content => (
                <ContentCard 
                  key={content.id}
                  title={content.title}
                  description={content.description}
                  image={content.image}
                  url={content.url}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
