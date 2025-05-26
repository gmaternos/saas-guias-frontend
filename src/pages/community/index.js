import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCommunity } from '../../contexts/CommunityContext';
import { useAuth } from '../../contexts/AuthContext';

const CommunityPage = () => {
  const router = useRouter();
  const { topics, getTopics, createTopic, likeTopic } = useCommunity();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [topicForm, setTopicForm] = useState({
    title: '',
    content: '',
    category: 'geral'
  });
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'popular', 'comments'

  // Buscar tópicos ao carregar a página
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true);
        await getTopics();
      } catch (error) {
        console.error('Erro ao buscar tópicos:', error);
        setError('Não foi possível carregar os tópicos da comunidade.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [getTopics]);

  // Atualizar formulário quando campos mudarem
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTopicForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Criar novo tópico
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      setIsLoading(true);
      await createTopic(topicForm);
      setShowNewTopicModal(false);
      setTopicForm({
        title: '',
        content: '',
        category: 'geral'
      });
    } catch (error) {
      console.error('Erro ao criar tópico:', error);
      setError(
        error.response?.data?.error?.message || 
        'Erro ao criar tópico. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Curtir tópico
  const handleLikeTopic = async (id) => {
    try {
      await likeTopic(id);
    } catch (error) {
      console.error('Erro ao curtir tópico:', error);
    }
  };

  // Filtrar tópicos por categoria e termo de busca
  const filteredTopics = topics.filter(topic => {
    const matchesCategory = activeCategory === 'all' || topic.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Ordenar tópicos
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'popular') {
      return (b.likes?.length || 0) - (a.likes?.length || 0);
    } else if (sortBy === 'comments') {
      return (b.commentCount || 0) - (a.commentCount || 0);
    }
    return 0;
  });

  // Categorias disponíveis
  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'geral', name: 'Geral' },
    { id: 'duvidas', name: 'Dúvidas' },
    { id: 'dicas', name: 'Dicas' },
    { id: 'experiencias', name: 'Experiências' },
    { id: 'saude', name: 'Saúde' },
    { id: 'educacao', name: 'Educação' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Comunidade</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controles e filtros */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-medium text-gray-900">Fórum da comunidade</h2>
              <p className="text-sm text-gray-500">
                Compartilhe experiências e tire dúvidas com outros pais e mães
              </p>
            </div>
            <button
              onClick={() => setShowNewTopicModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Novo tópico
            </button>
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              {/* Categorias */}
              <div className="mb-4 md:mb-0 flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      activeCategory === category.id
                        ? 'bg-indigo-100 text-indigo-800 font-medium'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Ordenação */}
              <div className="mb-4 md:mb-0 md:ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full md:w-auto border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="recent">Mais recentes</option>
                  <option value="popular">Mais populares</option>
                  <option value="comments">Mais comentados</option>
                </select>
              </div>

              {/* Busca */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar tópicos..."
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 pl-10 pr-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de tópicos */}
        {isLoading && topics.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
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
        ) : sortedTopics.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">Nenhum tópico encontrado com os filtros selecionados.</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchTerm('');
              }}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTopics.map(topic => (
              <div 
                key={topic._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {/* Avatar do autor */}
                      <div className="flex-shrink-0">
                        {topic.author?.profile?.avatar ? (
                          <img 
                            src={topic.author.profile.avatar} 
                            alt={topic.author.name} 
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {topic.author?.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Informações do tópico */}
                      <div>
                        <h3 
                          className="text-lg font-medium text-gray-900 hover:text-indigo-600 cursor-pointer"
                          onClick={() => router.push(`/community/${topic._id}`)}
                        >
                          {topic.title}
                        </h3>
                        <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                          <span>{topic.author?.name || 'Usuário'}</span>
                          <span>•</span>
                          <span>{new Date(topic.createdAt).toLocaleDateString('pt-BR')}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            topic.category === 'geral' ? 'bg-gray-100 text-gray-800' :
                            topic.category === 'duvidas' ? 'bg-blue-100 text-blue-800' :
                            topic.category === 'dicas' ? 'bg-green-100 text-green-800' :
                            topic.category === 'experiencias' ? 'bg-purple-100 text-purple-800' :
                            topic.category === 'saude' ? 'bg-red-100 text-red-800' :
                            topic.category === 'educacao' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {topic.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Conteúdo do tópico */}
                  <div 
                    className="mt-3 text-sm text-gray-600 cursor-pointer"
                    onClick={() => router.push(`/community/${topic._id}`)}
                  >
                    <p className="line-clamp-2">
                      {topic.content}
                    </p>
                  </div>
                  
                  {/* Ações e estatísticas */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLikeTopic(topic._id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>{topic.likes?.length || 0}</span>
                      </button>
                      <button
                        onClick={() => router.push(`/community/${topic._id}`)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{topic.commentCount || 0}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => router.push(`/community/${topic._id}`)}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Ver discussão
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de novo tópico */}
        {showNewTopicModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Criar novo tópico
                </h3>
              </div>
              
              <form onSubmit={handleCreateTopic}>
                <div className="px-4 py-5 sm:p-6 space-y-4">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
                  )}
                  
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Título
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={topicForm.title}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Digite um título para o seu tópico"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Categoria
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      value={topicForm.category}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="geral">Geral</option>
                      <option value="duvidas">Dúvidas</option>
                      <option value="dicas">Dicas</option>
                      <option value="experiencias">Experiências</option>
                      <option value="saude">Saúde</option>
                      <option value="educacao">Educação</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Conteúdo
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      rows="6"
                      required
                      value={topicForm.content}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Descreva seu tópico em detalhes..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Publicando...' : 'Publicar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewTopicModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CommunityPage;
