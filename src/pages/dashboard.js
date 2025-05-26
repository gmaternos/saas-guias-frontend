import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useChildren } from '../contexts/ChildrenContext';
import { useContent } from '../contexts/ContentContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { children, selectedChild, setSelectedChild } = useChildren();
  const { recommendedContent, loading: contentLoading } = useContent();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Guias Maternos</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Olá, {user.name}</span>
            <button 
              onClick={() => router.push('/profile')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              {user.profile?.avatar ? (
                <img 
                  src={user.profile.avatar} 
                  alt={user.name} 
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center">
                  <span className="text-indigo-600 font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Bem-vindo(a) ao seu painel, {user.name}!
          </h2>
          <p className="text-gray-600">
            Acompanhe o desenvolvimento dos seus filhos, acesse conteúdos personalizados e conecte-se com outros pais.
          </p>
        </div>

        {/* Children Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Seus filhos</h2>
            <button
              onClick={() => router.push('/children/new')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Adicionar filho
            </button>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Você ainda não adicionou nenhum filho.</p>
              <button
                onClick={() => router.push('/children/new')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Adicionar seu primeiro filho
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <div 
                  key={child._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedChild && selectedChild._id === child._id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                  onClick={() => setSelectedChild(child)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      {child.gender === 'female' ? (
                        <span className="text-pink-500 text-xl">👧</span>
                      ) : (
                        <span className="text-blue-500 text-xl">👦</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{child.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(child.birthDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Link 
                      href={`/children/${child._id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Access Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Recommended Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Conteúdo recomendado</h2>
            
            {contentLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : recommendedContent.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {selectedChild 
                  ? `Nenhum conteúdo recomendado para ${selectedChild.name} no momento.`
                  : 'Selecione um filho para ver conteúdos recomendados.'}
              </p>
            ) : (
              <div className="space-y-4">
                {recommendedContent.slice(0, 3).map((content) => (
                  <div key={content._id} className="border border-gray-200 rounded-md p-3 hover:border-indigo-300 transition-colors">
                    <h3 className="font-medium text-gray-800 mb-1">{content.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {content.description.length > 100
                        ? `${content.description.substring(0, 100)}...`
                        : content.description}
                    </p>
                    <Link 
                      href={`/content/${content._id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Ler mais
                    </Link>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <Link 
                    href="/content"
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Ver todos os conteúdos
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Acesso rápido</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/development"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
              >
                <span className="text-2xl mb-2">📊</span>
                <span className="text-gray-800 font-medium">Marcos de desenvolvimento</span>
              </Link>
              <Link 
                href="/calendar"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
              >
                <span className="text-2xl mb-2">📅</span>
                <span className="text-gray-800 font-medium">Calendário</span>
              </Link>
              <Link 
                href="/community"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
              >
                <span className="text-2xl mb-2">👨‍👩‍👧‍👦</span>
                <span className="text-gray-800 font-medium">Comunidade</span>
              </Link>
              <Link 
                href="/profile"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
              >
                <span className="text-2xl mb-2">⚙️</span>
                <span className="text-gray-800 font-medium">Configurações</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Community Highlights */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Destaques da comunidade</h2>
            <Link 
              href="/community"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Ver todos
            </Link>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <p>Conecte-se com outros pais e compartilhe experiências.</p>
            <button
              onClick={() => router.push('/community')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Explorar comunidade
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
