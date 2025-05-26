import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useContent } from '../../contexts/ContentContext';
import { useChildren } from '../../contexts/ChildrenContext';

const ContentPage = () => {
  const router = useRouter();
  const { getContentList, getRecommendedContent } = useContent();
  const { selectedChild } = useChildren();
  
  const [contentList, setContentList] = useState([]);
  const [recommendedContent, setRecommendedContent] = useState([]);
  const [activeTab, setActiveTab] = useState('recommended');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar conteúdo recomendado quando o filho selecionado mudar
  useEffect(() => {
    const fetchRecommendedContent = async () => {
      if (!selectedChild) return;
      
      try {
        setIsLoading(true);
        const data = await getRecommendedContent(selectedChild._id);
        setRecommendedContent(data);
      } catch (error) {
        console.error('Erro ao buscar conteúdo recomendado:', error);
        setError('Não foi possível carregar o conteúdo recomendado.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedContent();
  }, [selectedChild, getRecommendedContent]);

  // Buscar lista completa de conteúdo
  useEffect(() => {
    const fetchContentList = async () => {
      try {
        setIsLoading(true);
        const data = await getContentList();
        setContentList(data);
        
        // Extrair categorias únicas
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Erro ao buscar lista de conteúdo:', error);
        setError('Não foi possível carregar a biblioteca de conteúdo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContentList();
  }, [getContentList]);

  // Filtrar conteúdo por categoria e termo de busca
  const filteredContent = contentList.filter(content => {
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Renderizar conteúdo com base na aba ativa
  const renderContent = () => {
    const contentToRender = activeTab === 'recommended' ? recommendedContent : filteredContent;
    
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      );
    }
    
    if (contentToRender.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {activeTab === 'recommended' 
              ? 'Nenhum conteúdo recomendado disponível no momento.'
              : 'Nenhum conteúdo encontrado com os filtros selecionados.'}
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentToRender.map(content => (
          <div 
            key={content._id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {content.coverImage && (
              <div className="h-40 overflow-hidden">
                <img 
                  src={content.coverImage} 
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900">{content.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  content.category === 'saude' ? 'bg-green-100 text-green-800' :
                  content.category === 'educacao' ? 'bg-blue-100 text-blue-800' :
                  content.category === 'alimentacao' ? 'bg-yellow-100 text-yellow-800' :
                  content.category === 'desenvolvimento' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {content.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {content.description.length > 120
                  ? `${content.description.substring(0, 120)}...`
                  : content.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(content.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <button
                  onClick={() => router.push(`/content/${content._id}`)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Ler mais
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Biblioteca de Conteúdo</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('recommended')}
              className={`${
                activeTab === 'recommended'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Recomendados para você
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`${
                activeTab === 'all'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Todos os conteúdos
            </button>
          </nav>
        </div>

        {/* Filters (only for "all" tab) */}
        {activeTab === 'all' && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0 md:w-1/3">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por categoria
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="all">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:w-1/2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar conteúdo
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite para buscar..."
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {renderContent()}
      </main>
    </div>
  );
};

export default ContentPage;
