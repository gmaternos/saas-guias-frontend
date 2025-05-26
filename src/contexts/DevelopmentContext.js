import { createContext, useContext, useState, useEffect } from 'react';
import { developmentService } from '../services/api';
import { useChildren } from './ChildrenContext';

// Criar contexto de desenvolvimento
const DevelopmentContext = createContext();

// Hook personalizado para usar o contexto de desenvolvimento
export const useDevelopment = () => {
  return useContext(DevelopmentContext);
};

// Provedor de desenvolvimento
export const DevelopmentProvider = ({ children }) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectedChild } = useChildren();

  // Buscar marcos de desenvolvimento quando uma criança for selecionada
  useEffect(() => {
    const fetchMilestones = async () => {
      if (!selectedChild) {
        setMilestones([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data } = await developmentService.getMilestones(selectedChild._id);
        setMilestones(data.milestones);
      } catch (error) {
        console.error('Erro ao buscar marcos de desenvolvimento:', error);
        setError(error.response?.data?.error?.message || 'Erro ao buscar marcos de desenvolvimento');
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [selectedChild]);

  // Função para buscar um marco específico
  const getMilestone = async (id) => {
    if (!selectedChild) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await developmentService.getMilestone(selectedChild._id, id);
      return data.milestone;
    } catch (error) {
      console.error('Erro ao buscar marco de desenvolvimento:', error);
      setError(error.response?.data?.error?.message || 'Erro ao buscar marco de desenvolvimento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para criar novo marco
  const createMilestone = async (milestoneData) => {
    if (!selectedChild) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await developmentService.createMilestone(selectedChild._id, milestoneData);
      
      // Adicionar novo marco à lista
      setMilestones(prevList => [...prevList, data.milestone]);
      
      return data.milestone;
    } catch (error) {
      console.error('Erro ao criar marco de desenvolvimento:', error);
      setError(error.response?.data?.error?.message || 'Erro ao criar marco de desenvolvimento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar marco
  const updateMilestone = async (id, milestoneData) => {
    if (!selectedChild) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await developmentService.updateMilestone(selectedChild._id, id, milestoneData);
      
      // Atualizar marco na lista
      setMilestones(prevList => 
        prevList.map(milestone => 
          milestone._id === id ? data.milestone : milestone
        )
      );
      
      return data.milestone;
    } catch (error) {
      console.error('Erro ao atualizar marco de desenvolvimento:', error);
      setError(error.response?.data?.error?.message || 'Erro ao atualizar marco de desenvolvimento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para registrar marco como alcançado
  const achieveMilestone = async (id, achieveData) => {
    if (!selectedChild) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await developmentService.achieveMilestone(selectedChild._id, id, achieveData);
      
      // Atualizar marco na lista
      setMilestones(prevList => 
        prevList.map(milestone => 
          milestone._id === id ? data.milestone : milestone
        )
      );
      
      return data.milestone;
    } catch (error) {
      console.error('Erro ao registrar marco de desenvolvimento:', error);
      setError(error.response?.data?.error?.message || 'Erro ao registrar marco de desenvolvimento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir marco
  const deleteMilestone = async (id) => {
    if (!selectedChild) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await developmentService.deleteMilestone(selectedChild._id, id);
      
      // Remover marco da lista
      setMilestones(prevList => prevList.filter(milestone => milestone._id !== id));
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir marco de desenvolvimento:', error);
      setError(error.response?.data?.error?.message || 'Erro ao excluir marco de desenvolvimento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se um marco está atrasado
  const isDelayed = (milestone) => {
    if (!selectedChild || !milestone) return false;
    
    const ageInMonths = calculateAgeInMonths(selectedChild.birthDate);
    return !milestone.achievedDate && ageInMonths > milestone.expectedAge.max;
  };

  // Função para verificar se um marco está no prazo
  const isOnTime = (milestone) => {
    if (!selectedChild || !milestone) return false;
    
    const ageInMonths = calculateAgeInMonths(selectedChild.birthDate);
    return milestone.achievedDate && 
           ageInMonths >= milestone.expectedAge.min && 
           ageInMonths <= milestone.expectedAge.max;
  };

  // Função para verificar se um marco foi alcançado precocemente
  const isEarly = (milestone) => {
    if (!selectedChild || !milestone) return false;
    
    const ageInMonths = calculateAgeInMonths(selectedChild.birthDate);
    return milestone.achievedDate && ageInMonths < milestone.expectedAge.min;
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
    milestones,
    loading,
    error,
    getMilestone,
    createMilestone,
    updateMilestone,
    achieveMilestone,
    deleteMilestone,
    isDelayed,
    isOnTime,
    isEarly
  };

  return (
    <DevelopmentContext.Provider value={value}>
      {children}
    </DevelopmentContext.Provider>
  );
};

export default DevelopmentContext;
