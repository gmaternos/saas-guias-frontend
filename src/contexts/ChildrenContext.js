import { createContext, useContext, useState, useEffect } from 'react';
import { childrenService } from '../services/api';
import { useAuth } from './AuthContext';

// Criar contexto de crianças
const ChildrenContext = createContext();

// Hook personalizado para usar o contexto de crianças
export const useChildren = () => {
  return useContext(ChildrenContext);
};

// Provedor de crianças
export const ChildrenProvider = ({ children }) => {
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Buscar lista de crianças quando o usuário estiver autenticado
  useEffect(() => {
    const fetchChildren = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data } = await childrenService.getChildren();
        setChildrenList(data.children);
        
        // Se houver crianças e nenhuma selecionada, selecionar a primeira
        if (data.children.length > 0 && !selectedChild) {
          setSelectedChild(data.children[0]);
        }
      } catch (error) {
        console.error('Erro ao buscar crianças:', error);
        setError(error.response?.data?.error?.message || 'Erro ao buscar crianças');
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [isAuthenticated]);

  // Função para buscar uma criança específica
  const getChild = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await childrenService.getChild(id);
      return data.child;
    } catch (error) {
      console.error('Erro ao buscar criança:', error);
      setError(error.response?.data?.error?.message || 'Erro ao buscar criança');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para criar nova criança
  const createChild = async (childData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await childrenService.createChild(childData);
      
      // Adicionar nova criança à lista
      setChildrenList(prevList => [...prevList, data.child]);
      
      // Selecionar a nova criança
      setSelectedChild(data.child);
      
      return data.child;
    } catch (error) {
      console.error('Erro ao criar criança:', error);
      setError(error.response?.data?.error?.message || 'Erro ao criar criança');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar criança
  const updateChild = async (id, childData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await childrenService.updateChild(id, childData);
      
      // Atualizar criança na lista
      setChildrenList(prevList => 
        prevList.map(child => 
          child._id === id ? data.child : child
        )
      );
      
      // Se a criança atualizada for a selecionada, atualizar também
      if (selectedChild && selectedChild._id === id) {
        setSelectedChild(data.child);
      }
      
      return data.child;
    } catch (error) {
      console.error('Erro ao atualizar criança:', error);
      setError(error.response?.data?.error?.message || 'Erro ao atualizar criança');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir criança
  const deleteChild = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await childrenService.deleteChild(id);
      
      // Remover criança da lista
      const updatedList = childrenList.filter(child => child._id !== id);
      setChildrenList(updatedList);
      
      // Se a criança excluída for a selecionada, selecionar outra
      if (selectedChild && selectedChild._id === id) {
        setSelectedChild(updatedList.length > 0 ? updatedList[0] : null);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir criança:', error);
      setError(error.response?.data?.error?.message || 'Erro ao excluir criança');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para obter idade formatada da criança
  const getChildAge = async (id) => {
    try {
      const { data } = await childrenService.getChildAge(id);
      return data.data;
    } catch (error) {
      console.error('Erro ao obter idade da criança:', error);
      throw error;
    }
  };

  // Valores a serem disponibilizados pelo contexto
  const value = {
    children: childrenList,
    selectedChild,
    setSelectedChild,
    loading,
    error,
    getChild,
    createChild,
    updateChild,
    deleteChild,
    getChildAge
  };

  return (
    <ChildrenContext.Provider value={value}>
      {children}
    </ChildrenContext.Provider>
  );
};

export default ChildrenContext;
