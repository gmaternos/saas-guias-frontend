import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCommunity } from '../../contexts/CommunityContext';
import { useAuth } from '../../contexts/AuthContext';

const TopicDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getTopic, selectedTopic, comments, addComment, updateComment, deleteComment, likeTopic, likeComment } = useCommunity();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  // Buscar tópico e comentários
  useEffect(() => {
    const fetchTopicData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        await getTopic(id);
      } catch (error) {
        console.error('Erro ao buscar tópico:', error);
        setError('Não foi possível carregar o tópico.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopicData();
  }, [id, getTopic]);

  // Enviar comentário
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      setIsLoading(true);
      
      const commentData = {
        content: commentText,
        parentId: replyTo ? replyTo._id : null
      };
      
      await addComment(id, commentData);
      setCommentText('');
      setReplyTo(null);
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      setError('Não foi possível enviar o comentário.');
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar comentário
  const handleUpdateComment = async (e) => {
    e.preventDefault();
    
    if (!editText.trim() || !editingComment) return;
    
    try {
      setIsLoading(true);
      
      await updateComment(editingComment._id, { content: editText });
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      setError('Não foi possível atualizar o comentário.');
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir comentário
  const handleDeleteComment = async (commentId) => {
    try {
      setIsLoading(true);
      await deleteComment(commentId);
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      setError('Não foi possível excluir o comentário.');
    } finally {
      setIsLoading(false);
    }
  };

  // Curtir tópico
  const handleLikeTopic = async () => {
    try {
      await likeTopic(id);
    } catch (error) {
      console.error('Erro ao curtir tópico:', error);
    }
  };

  // Curtir comentário
  const handleLikeComment = async (commentId) => {
    try {
      await likeComment(commentId);
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
    }
  };

  // Iniciar edição de comentário
  const startEditingComment = (comment) => {
    setEditingComment(comment);
    setEditText(comment.content);
  };

  // Renderizar comentários
  const renderComments = () => {
    if (comments.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment._id} className="border border-gray-200 rounded-lg p-4">
            {/* Cabeçalho do comentário */}
            <div className="flex items-start space-x-3">
              {/* Avatar do autor */}
              <div className="flex-shrink-0">
                {comment.author?.profile?.avatar ? (
                  <img 
                    src={comment.author.profile.avatar} 
                    alt={comment.author.name} 
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {comment.author?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Informações do comentário */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{comment.author?.name || 'Usuário'}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  {/* Ações do comentário (se for o autor) */}
                  {user && comment.author?._id === user._id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditingComment(comment)}
                        className="text-gray-500 hover:text-indigo-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Conteúdo do comentário */}
                {editingComment && editingComment._id === comment._id ? (
                  <form onSubmit={handleUpdateComment} className="mt-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      rows="3"
                    ></textarea>
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingComment(null)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="mt-1 text-gray-700">{comment.content}</p>
                )}
                
                {/* Ações do comentário */}
                <div className="mt-2 flex items-center space-x-4">
                  <button
                    onClick={() => handleLikeComment(comment._id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span className="text-xs">{comment.likes?.length || 0}</span>
                  </button>
                  <button
                    onClick={() => setReplyTo(comment)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span className="text-xs">Responder</span>
                  </button>
                </div>
                
                {/* Respostas ao comentário */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                    {comment.replies.map(reply => (
                      <div key={reply._id} className="pt-2">
                        <div className="flex items-start space-x-3">
                          {/* Avatar do autor da resposta */}
                          <div className="flex-shrink-0">
                            {reply.author?.profile?.avatar ? (
                              <img 
                                src={reply.author.profile.avatar} 
                                alt={reply.author.name} 
                                className="h-6 w-6 rounded-full"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-indigo-200 flex items-center justify-center">
                                <span className="text-indigo-600 font-medium text-xs">
                                  {reply.author?.name?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Informações da resposta */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium text-gray-900">{reply.author?.name || 'Usuário'}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  {new Date(reply.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              
                              {/* Ações da resposta (se for o autor) */}
                              {user && reply.author?._id === user._id && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => startEditingComment(reply)}
                                    className="text-gray-500 hover:text-indigo-600"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(reply._id)}
                                    className="text-gray-500 hover:text-red-600"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {/* Conteúdo da resposta */}
                            {editingComment && editingComment._id === reply._id ? (
                              <form onSubmit={handleUpdateComment} className="mt-2">
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  rows="2"
                                ></textarea>
                                <div className="mt-2 flex justify-end space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingComment(null)}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                                  >
                                    Salvar
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <p className="mt-1 text-sm text-gray-700">{reply.content}</p>
                            )}
                            
                            {/* Ações da resposta */}
                            <div className="mt-1 flex items-center space-x-4">
                              <button
                                onClick={() => handleLikeComment(reply._id)}
                                className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                <span className="text-xs">{reply.likes?.length || 0}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading && !selectedTopic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error && !selectedTopic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/community')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Voltar para a Comunidade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/community')}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Discussão</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tópico */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-start space-x-4">
              {/* Avatar do autor */}
              <div className="flex-shrink-0">
                {selectedTopic?.author?.profile?.avatar ? (
                  <img 
                    src={selectedTopic.author.profile.avatar} 
                    alt={selectedTopic.author.name} 
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-indigo-200 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {selectedTopic?.author?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Informações do tópico */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{selectedTopic?.title}</h2>
                <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                  <span>{selectedTopic?.author?.name || 'Usuário'}</span>
                  <span>•</span>
                  <span>{selectedTopic?.createdAt && new Date(selectedTopic.createdAt).toLocaleDateString('pt-BR')}</span>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedTopic?.category === 'geral' ? 'bg-gray-100 text-gray-800' :
                    selectedTopic?.category === 'duvidas' ? 'bg-blue-100 text-blue-800' :
                    selectedTopic?.category === 'dicas' ? 'bg-green-100 text-green-800' :
                    selectedTopic?.category === 'experiencias' ? 'bg-purple-100 text-purple-800' :
                    selectedTopic?.category === 'saude' ? 'bg-red-100 text-red-800' :
                    selectedTopic?.category === 'educacao' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedTopic?.category}
                  </span>
                </div>
                
                {/* Conteúdo do tópico */}
                <div className="mt-4 prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{selectedTopic?.content}</p>
                </div>
                
                {/* Ações do tópico */}
                <div className="mt-6 flex items-center space-x-4">
                  <button
                    onClick={handleLikeTopic}
                    className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>{selectedTopic?.likes?.length || 0} curtidas</span>
                  </button>
                  <span className="text-gray-500">
                    {selectedTopic?.commentCount || 0} comentários
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de comentário */}
        {user ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {replyTo ? `Respondendo a ${replyTo.author?.name || 'Usuário'}` : 'Deixe seu comentário'}
            </h3>
            
            {replyTo && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md border-l-4 border-indigo-300">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-700 line-clamp-2">{replyTo.content}</p>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmitComment}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escreva seu comentário..."
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                rows="4"
                required
              ></textarea>
              
              <div className="mt-3 flex justify-end">
                {replyTo && (
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading || !commentText.trim()}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading || !commentText.trim() ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isLoading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-center">
            <p className="text-gray-700 mb-4">Faça login para participar da discussão.</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Fazer login
            </button>
          </div>
        )}

        {/* Comentários */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Comentários ({selectedTopic?.commentCount || 0})
          </h3>
          
          {isLoading && comments.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
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
          ) : (
            renderComments()
          )}
        </div>
      </main>
    </div>
  );
};

export default TopicDetailPage;
