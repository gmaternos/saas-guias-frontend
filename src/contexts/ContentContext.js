import { createContext, useContext, useState, useEffect } from 'react';
import { contentService } from '../services/api';
import { useChildren } from './ChildrenContext';
import { useAuth } from './AuthContext';

// Criar contexto de conteúdo
const ContentContext = createContext();

// Hook personalizado para usar o contexto de conteúdo
export const useContent = () => {
  return useContext(ContentContext);
};

// Provedor de conteúdo
export const ContentProvider = ({ children }) => {
  const [contentList, setContentList] = useState([]);
  const [recommendedContent, setRecommendedContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectedChild } = useChildren();
  const { user } = useAuth();

  // Buscar conteúdo recomendado quando uma criança for selecionada
  useEffect(() => {
    const fetchRecommendedContent = async () => {
      if (!selectedChild) return;

      setLoading(true);
      setError(null);

      try {
        const { data } = await contentService.getRecommendedContent({
          childId: selectedChild._id,
          limit: 5
        });
        
        setRecommendedContent(data.content);
      } catch (error) {
        console.error('Erro ao buscar conteúdo recomendado:', error);
        setError(error.response?.data?.error?.message || 'Erro ao buscar conteúdo recomendado');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedContent();
  }, [selectedChild]);

  // Função para buscar todos os conteúdos
  const getAllContent = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Se uma criança estiver selecionada, adicionar idade aos parâmetros
      if (selectedChild) {
        const ageInMonths = calculateAgeInMonths(selectedChild.birthDate);
        params.ageInMonths = ageInMonths;
      }
      
      const { data } = await contentService.getAllContent(params);
      setContentList(data.content);
      
      return {
        content: data.content,
        pagination: data.pagination
      };
    } catch (error) {
      console.error('Erro ao buscar conteúdos:', error);
      setError(error.response?.data?.error?.message || 'Erro ao buscar conteúdos');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar um conteúdo específico
  const getContent = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await contentService.getContent(id);
      return data.content;
    } catch (error) {
      console.error('Erro ao buscar conteúdo:', error);
      setError(error.response?.data?.error?.message || 'Erro ao buscar conteúdo');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para curtir um conteúdo
  const likeContent = async (id) => {
    if (!user) return null;
    
    try {
      const { data } = await contentService.likeContent(id);
      
      // Atualizar contagem de likes no conteúdo
      setContentList(prevList => 
        prevList.map(content => 
          content._id === id ? { ...content, likes: data.likes } : content
        )
      );
      
      setRecommendedContent(prevList => 
        prevList.map(content => 
          content._id === id ? { ...content, likes: data.likes } : content
        )
      );
      
      return data;
    } catch (error) {
      console.error('Erro ao curtir conteúdo:', error);
      throw error;
    }
  };

  // Função para verificar se um conteúdo é relevante para a criança selecionada
  const isRelevantForChild = (content) => {
    if (!selectedChild || !content || !content.ageRelevance || content.ageRelevance.length === 0) {
      return true;
    }
    
    const ageInMonths = calculateAgeInMonths(selectedChild.birthDate);
    
    return content.ageRelevance.some(range => 
      ageInMonths >= range.min && ageInMonths <= range.max
    );
  };

  // Função para verificar se o usuário tem acesso a conteúdo premium
  const hasPremiumAccess = () => {
    if (!user) return false;
    
    return user.subscription.plan !== 'free' && user.subscription.status === 'active';
  };

  // Função auxiliar para calcular idade em meses
  const calculateAgeInMonths = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months -= birth.getMonth();
    months += today.getMonth();
    
    // Ajuste para dias do mês
    if (today.getDate() < birth.getDate()) {
      months--;
    }
    
    return months;
  };

  // Valores a serem disponibilizados pelo contexto
  const value = {
    contentList,
    recommendedContent,
    loading,
    error,
    getAllContent,
    getContent,
    likeContent,
    isRelevantForChild,
    hasPremiumAccess
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export default ContentContext;
