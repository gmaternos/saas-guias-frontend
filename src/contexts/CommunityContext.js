import { createContext, useContext, useState, useEffect } from 'react';
import { communityService } from '../services/api';
import { useAuth } from './AuthContext';

// Criar contexto de comunidade
const CommunityContext = createContext();

// Hook personalizado para usar o contexto de comunidade
export const useCommunity = () => {
  return useContext(CommunityContext);
};

// Provedor de comunidade
export const CommunityProvider = ({ children }) => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Função para buscar todos os tópicos
  const getTopics = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await communityService.getTopics(params);
      setTopics(data.topics);
      
      return {
        topics: data.topics,
        pagination: data.pagination
      };
    } catch (error) {
      console.error('Erro ao buscar tópicos:', error);
      setError(error.response?.data?.error?.message || 'Erro ao buscar tópicos');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar um tópico específico
  const getTopic = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await communityService.getTopic(id);
      setSelectedTopic(data.topic);
      
      // Buscar comentários do tópico
      await getTopicComments(id);
      
      return data.topic;
    } catch (error) {
      console.error('Erro ao buscar tópico:', error);
      setError(error.response?.data?.error?.message || 'Erro ao buscar tópico');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para criar novo tópico
  const createTopic = async (topicData) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await communityService.createTopic(topicData);
      
      // Adicionar novo tópico à lista
      setTopics(prevList => [data.topic, ...prevList]);
      
      return data.topic;
    } catch (error) {
      console.error('Erro ao criar tópico:', error);
      setError(error.response?.data?.error?.message || 'Erro ao criar tópico');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar tópico
  const updateTopic = async (id, topicData) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await communityService.updateTopic(id, topicData);
      
      // Atualizar tópico na lista
      setTopics(prevList => 
        prevList.map(topic => 
          topic._id === id ? data.topic : topic
        )
      );
      
      // Se o tópico atualizado for o selecionado, atualizar também
      if (selectedTopic && selectedTopic._id === id) {
        setSelectedTopic(data.topic);
      }
      
      return data.topic;
    } catch (error) {
      console.error('Erro ao atualizar tópico:', error);
      setError(error.response?.data?.error?.message || 'Erro ao atualizar tópico');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir tópico
  const deleteTopic = async (id) => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await communityService.deleteTopic(id);
      
      // Remover tópico da lista
      setTopics(prevList => prevList.filter(topic => topic._id !== id));
      
      // Se o tópico excluído for o selecionado, limpar seleção
      if (selectedTopic && selectedTopic._id === id) {
        setSelectedTopic(null);
        setComments([]);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir tópico:', error);
      setError(error.response?.data?.error?.message || 'Erro ao excluir tópico');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para curtir tópico
  const likeTopic = async (id) => {
    if (!user) return null;
    
    try {
      const { data } = await communityService.likeTopic(id);
      
      // Atualizar contagem de likes no tópico
      setTopics(prevList => 
        prevList.map(topic => 
          topic._id === id ? { ...topic, likes: data.likes } : topic
        )
      );
      
      // Se o tópico curtido for o selecionado, atualizar também
      if (selectedTopic && selectedTopic._id === id) {
        setSelectedTopic(prev => ({ ...prev, likes: data.likes }));
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao curtir tópico:', error);
      throw error;
    }
  };

  // Função para buscar comentários de um tópico
  const getTopicComments = async (id) => {
    try {
      const { data } = await communityService.getTopicComments(id);
      setComments(data.comments);
      return data.comments;
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      throw error;
    }
  };

  // Função para adicionar comentário a um tópico
  const addComment = async (topicId, commentData) => {
    if (!user) return null;
    
    try {
      const { data } = await communityService.addComment(topicId, commentData);
      
      // Se for uma resposta a outro comentário
      if (commentData.parentId) {
        // Adicionar resposta ao comentário pai
        setComments(prevList => 
          prevList.map(comment => {
            if (comment._id === commentData.parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), data.comment]
              };
            }
            return comment;
          })
        );
      } else {
        // Adicionar novo comentário à lista
        setComments(prevList => [...prevList, data.comment]);
      }
      
      // Atualizar contagem de comentários no tópico selecionado
      if (selectedTopic && selectedTopic._id === topicId) {
        setSelectedTopic(prev => ({
          ...prev,
          commentCount: (prev.commentCount || 0) + 1
        }));
      }
      
      return data.comment;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw error;
    }
  };

  // Função para atualizar comentário
  const updateComment = async (id, commentData) => {
    if (!user) return null;
    
    try {
      const { data } = await communityService.updateComment(id, commentData);
      
      // Atualizar comentário na lista
      setComments(prevList => {
        // Verificar se é um comentário principal
        const isMainComment = prevList.some(comment => comment._id === id);
        
        if (isMainComment) {
          return prevList.map(comment => 
            comment._id === id ? data.comment : comment
          );
        } else {
          // É uma resposta, procurar em todas as respostas
          return prevList.map(comment => {
            if (comment.replies && comment.replies.some(reply => reply._id === id)) {
              return {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply._id === id ? data.comment : reply
                )
              };
            }
            return comment;
          });
        }
      });
      
      return data.comment;
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      throw error;
    }
  };

  // Função para excluir comentário
  const deleteComment = async (id) => {
    if (!user) return false;
    
    try {
      await communityService.deleteComment(id);
      
      // Remover comentário da lista
      setComments(prevList => {
        // Verificar se é um comentário principal
        const isMainComment = prevList.some(comment => comment._id === id);
        
        if (isMainComment) {
          return prevList.filter(comment => comment._id !== id);
        } else {
          // É uma resposta, procurar em todas as respostas
          return prevList.map(comment => {
            if (comment.replies && comment.replies.some(reply => reply._id === id)) {
              return {
                ...comment,
                replies: comment.replies.filter(reply => reply._id !== id)
              };
            }
            return comment;
          });
        }
      });
      
      // Atualizar contagem de comentários no tópico selecionado
      if (selectedTopic) {
        setSelectedTopic(prev => ({
          ...prev,
          commentCount: Math.max((prev.commentCount || 0) - 1, 0)
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      throw error;
    }
  };

  // Função para curtir comentário
  const likeComment = async (id) => {
    if (!user) return null;
    
    try {
      const { data } = await communityService.likeComment(id);
      
      // Atualizar contagem de likes no comentário
      setComments(prevList => {
        // Verificar se é um comentário principal
        const isMainComment = prevList.some(comment => comment._id === id);
        
        if (isMainComment) {
          return prevList.map(comment => 
            comment._id === id ? { ...comment, likes: data.likes } : comment
          );
        } else {
          // É uma resposta, procurar em todas as respostas
          return prevList.map(comment => {
            if (comment.replies && comment.replies.some(reply => reply._id === id)) {
              return {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply._id === id ? { ...reply, likes: data.likes } : reply
                )
              };
            }
            return comment;
          });
        }
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
      throw error;
    }
  };

  // Valores a serem disponibilizados pelo contexto
  const value = {
    topics,
    selectedTopic,
    comments,
    loading,
    error,
    getTopics,
    getTopic,
    createTopic,
    updateTopic,
    deleteTopic,
    likeTopic,
    getTopicComments,
    addComment,
    updateComment,
    deleteComment,
    likeComment
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};

export default CommunityContext;
