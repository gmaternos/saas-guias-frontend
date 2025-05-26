import { createContext, useContext, useState, useEffect } from 'react';
import { calendarService, eventService } from '../services/api';
import { useAuth } from './AuthContext';

// Criar contexto de calendário
const CalendarContext = createContext();

// Hook personalizado para usar o contexto de calendário
export const useCalendar = () => {
  return useContext(CalendarContext);
};

// Provedor de calendário
export const CalendarProvider = ({ children }) => {
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Buscar calendários quando o usuário estiver autenticado
  useEffect(() => {
    const fetchCalendars = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const { data } = await calendarService.getCalendars();
        setCalendars(data.calendars);
        
        // Se houver calendários e nenhum selecionado, selecionar o primeiro
        if (data.calendars.length > 0 && !selectedCalendar) {
          setSelectedCalendar(data.calendars[0]);
        }
      } catch (error) {
        console.error('Erro ao buscar calendários:', error);
        setError(error.response?.data?.error?.message || 'Erro ao buscar calendários');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendars();
  }, [user]);

  // Buscar eventos quando um calendário for selecionado
  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedCalendar) {
        setEvents([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Definir intervalo de datas (1 mês antes e depois da data atual)
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        
        const { data } = await eventService.getEvents(selectedCalendar._id, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
        
        setEvents(data.events);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        setError(error.response?.data?.error?.message || 'Erro ao buscar eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCalendar]);

  // Função para criar novo calendário
  const createCalendar = async (calendarData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await calendarService.createCalendar(calendarData);
      
      // Adicionar novo calendário à lista
      setCalendars(prevList => [...prevList, data.calendar]);
      
      // Selecionar o novo calendário
      setSelectedCalendar(data.calendar);
      
      return data.calendar;
    } catch (error) {
      console.error('Erro ao criar calendário:', error);
      setError(error.response?.data?.error?.message || 'Erro ao criar calendário');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar calendário
  const updateCalendar = async (id, calendarData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await calendarService.updateCalendar(id, calendarData);
      
      // Atualizar calendário na lista
      setCalendars(prevList => 
        prevList.map(calendar => 
          calendar._id === id ? data.calendar : calendar
        )
      );
      
      // Se o calendário atualizado for o selecionado, atualizar também
      if (selectedCalendar && selectedCalendar._id === id) {
        setSelectedCalendar(data.calendar);
      }
      
      return data.calendar;
    } catch (error) {
      console.error('Erro ao atualizar calendário:', error);
      setError(error.response?.data?.error?.message || 'Erro ao atualizar calendário');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir calendário
  const deleteCalendar = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await calendarService.deleteCalendar(id);
      
      // Remover calendário da lista
      const updatedList = calendars.filter(calendar => calendar._id !== id);
      setCalendars(updatedList);
      
      // Se o calendário excluído for o selecionado, selecionar outro
      if (selectedCalendar && selectedCalendar._id === id) {
        setSelectedCalendar(updatedList.length > 0 ? updatedList[0] : null);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir calendário:', error);
      setError(error.response?.data?.error?.message || 'Erro ao excluir calendário');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para compartilhar calendário
  const shareCalendar = async (id, shareData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await calendarService.shareCalendar(id, shareData);
      
      // Atualizar calendário na lista
      setCalendars(prevList => 
        prevList.map(calendar => 
          calendar._id === id ? data.calendar : calendar
        )
      );
      
      // Se o calendário atualizado for o selecionado, atualizar também
      if (selectedCalendar && selectedCalendar._id === id) {
        setSelectedCalendar(data.calendar);
      }
      
      return data.calendar;
    } catch (error) {
      console.error('Erro ao compartilhar calendário:', error);
      setError(error.response?.data?.error?.message || 'Erro ao compartilhar calendário');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para criar novo evento
  const createEvent = async (eventData) => {
    if (!selectedCalendar) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await eventService.createEvent(selectedCalendar._id, eventData);
      
      // Adicionar novo evento à lista
      setEvents(prevList => [...prevList, data.event]);
      
      return data.event;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      setError(error.response?.data?.error?.message || 'Erro ao criar evento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar evento
  const updateEvent = async (id, eventData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await eventService.updateEvent(id, eventData);
      
      // Atualizar evento na lista
      setEvents(prevList => 
        prevList.map(event => 
          event._id === id ? data.event : event
        )
      );
      
      return data.event;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      setError(error.response?.data?.error?.message || 'Erro ao atualizar evento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir evento
  const deleteEvent = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await eventService.deleteEvent(id);
      
      // Remover evento da lista
      setEvents(prevList => prevList.filter(event => event._id !== id));
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      setError(error.response?.data?.error?.message || 'Erro ao excluir evento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para obter próximas ocorrências de um evento recorrente
  const getEventOccurrences = async (id, count = 5) => {
    try {
      const { data } = await eventService.getEventOccurrences(id, { count });
      return data.occurrences;
    } catch (error) {
      console.error('Erro ao buscar ocorrências do evento:', error);
      throw error;
    }
  };

  // Função para verificar se um evento está ativo
  const isEventActive = (event) => {
    if (!event) return false;
    
    const now = new Date();
    return new Date(event.startDate) <= now && new Date(event.endDate) >= now;
  };

  // Função para verificar se um evento está próximo
  const isEventUpcoming = (event, hoursThreshold = 24) => {
    if (!event) return false;
    
    const now = new Date();
    const threshold = new Date(now.getTime() + hoursThreshold * 60 * 60 * 1000);
    return new Date(event.startDate) > now && new Date(event.startDate) <= threshold;
  };

  // Valores a serem disponibilizados pelo contexto
  const value = {
    calendars,
    selectedCalendar,
    setSelectedCalendar,
    events,
    loading,
    error,
    createCalendar,
    updateCalendar,
    deleteCalendar,
    shareCalendar,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventOccurrences,
    isEventActive,
    isEventUpcoming
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export default CalendarContext;
