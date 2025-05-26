import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCalendar } from '../../contexts/CalendarContext';
import { useChildren } from '../../contexts/ChildrenContext';

const CalendarPage = () => {
  const router = useRouter();
  const { calendars, events, selectedCalendar, setSelectedCalendar, createEvent, updateEvent, deleteEvent } = useCalendar();
  const { children } = useChildren();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    allDay: false,
    childId: '',
    recurrence: 'none', // 'none', 'daily', 'weekly', 'monthly'
    color: '#4F46E5' // default color
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Inicializar formulário quando abrir modal para criar novo evento
  const handleNewEvent = (day) => {
    const selectedDay = new Date(currentDate);
    selectedDay.setDate(day);
    
    const startDate = new Date(selectedDay);
    startDate.setHours(9, 0, 0);
    
    const endDate = new Date(selectedDay);
    endDate.setHours(10, 0, 0);
    
    setEventForm({
      title: '',
      description: '',
      startDate: startDate.toISOString().slice(0, 16),
      endDate: endDate.toISOString().slice(0, 16),
      allDay: false,
      childId: children.length > 0 ? children[0]._id : '',
      recurrence: 'none',
      color: '#4F46E5'
    });
    
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  // Inicializar formulário quando abrir modal para editar evento existente
  const handleEditEvent = (event) => {
    setEventForm({
      title: event.title,
      description: event.description || '',
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      allDay: event.allDay || false,
      childId: event.childId || '',
      recurrence: event.recurrence || 'none',
      color: event.color || '#4F46E5'
    });
    
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Atualizar formulário quando campos mudarem
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Salvar evento (criar novo ou atualizar existente)
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      setIsLoading(true);
      
      const eventData = {
        ...eventForm,
        allDay: eventForm.allDay
      };
      
      if (selectedEvent) {
        // Atualizar evento existente
        await updateEvent(selectedEvent._id, eventData);
      } else {
        // Criar novo evento
        await createEvent(eventData);
      }
      
      setShowEventModal(false);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      setError(
        error.response?.data?.error?.message || 
        'Erro ao salvar evento. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir evento
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      setIsLoading(true);
      await deleteEvent(selectedEvent._id);
      setShowEventModal(false);
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      setError(
        error.response?.data?.error?.message || 
        'Erro ao excluir evento. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Navegar para o mês anterior
  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // Navegar para o próximo mês
  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Navegar para hoje
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Gerar dias do mês atual para visualização de calendário
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    
    // Dia da semana do primeiro dia (0 = Domingo, 1 = Segunda, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Total de dias no mês
    const daysInMonth = lastDay.getDate();
    
    // Array para armazenar todos os dias a serem exibidos
    const calendarDays = [];
    
    // Adicionar dias do mês anterior para completar a primeira semana
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      calendarDays.push({
        day: prevMonthLastDay - i,
        currentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // Adicionar dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        currentMonth: true,
        date: new Date(year, month, i),
        today: new Date(year, month, i).toDateString() === new Date().toDateString()
      });
    }
    
    // Adicionar dias do próximo mês para completar a última semana
    const remainingDays = 42 - calendarDays.length; // 6 semanas * 7 dias = 42
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        day: i,
        currentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return calendarDays;
  };

  // Verificar se um dia tem eventos
  const getDayEvents = (date) => {
    if (!events) return [];
    
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      // Converter para datas sem horas para comparação de dias
      const eventStartDay = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const eventEndDay = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
      const checkDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      return checkDay >= eventStartDay && checkDay <= eventEndDay;
    });
  };

  // Renderizar dias do calendário
  const renderCalendarDays = () => {
    const days = generateCalendarDays();
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Cabeçalho com dias da semana */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekdays.map((day, index) => (
            <div key={index} className="bg-white p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Grade de dias */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, index) => {
            const dayEvents = getDayEvents(day.date);
            
            return (
              <div 
                key={index} 
                className={`bg-white min-h-[100px] p-2 ${
                  day.currentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${day.today ? 'bg-blue-50' : ''}`}
                onClick={() => handleNewEvent(day.day)}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${day.today ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                    {day.day}
                  </span>
                </div>
                
                {/* Eventos do dia */}
                <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div 
                      key={eventIndex}
                      className="px-2 py-1 text-xs rounded truncate cursor-pointer"
                      style={{ backgroundColor: event.color || '#4F46E5', color: 'white' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 pl-2">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Calendário</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controles do calendário */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mx-4">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Hoje
            </button>
            
            {calendars.length > 0 && (
              <select
                value={selectedCalendar?._id || ''}
                onChange={(e) => {
                  const calendar = calendars.find(cal => cal._id === e.target.value);
                  setSelectedCalendar(calendar);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white"
              >
                {calendars.map(calendar => (
                  <option key={calendar._id} value={calendar._id}>
                    {calendar.name}
                  </option>
                ))}
              </select>
            )}
            
            <button
              onClick={() => router.push('/calendar/new')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Novo calendário
            </button>
          </div>
        </div>

        {/* Visualização do calendário */}
        {renderCalendarDays()}

        {/* Modal de evento */}
        {showEventModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedEvent ? 'Editar evento' : 'Novo evento'}
                </h3>
              </div>
              
              <form onSubmit={handleSaveEvent}>
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
                      value={eventForm.title}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Descrição (opcional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="2"
                      value={eventForm.description}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allDay"
                      name="allDay"
                      checked={eventForm.allDay}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allDay" className="ml-2 block text-sm text-gray-700">
                      Dia inteiro
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        Início
                      </label>
                      <input
                        type={eventForm.allDay ? "date" : "datetime-local"}
                        id="startDate"
                        name="startDate"
                        required
                        value={eventForm.startDate}
                        onChange={handleFormChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        Fim
                      </label>
                      <input
                        type={eventForm.allDay ? "date" : "datetime-local"}
                        id="endDate"
                        name="endDate"
                        required
                        value={eventForm.endDate}
                        onChange={handleFormChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  {children.length > 0 && (
                    <div>
                      <label htmlFor="childId" className="block text-sm font-medium text-gray-700">
                        Relacionado a (opcional)
                      </label>
                      <select
                        id="childId"
                        name="childId"
                        value={eventForm.childId}
                        onChange={handleFormChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="">Nenhum</option>
                        {children.map(child => (
                          <option key={child._id} value={child._id}>
                            {child.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700">
                      Recorrência
                    </label>
                    <select
                      id="recurrence"
                      name="recurrence"
                      value={eventForm.recurrence}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="none">Não se repete</option>
                      <option value="daily">Diariamente</option>
                      <option value="weekly">Semanalmente</option>
                      <option value="monthly">Mensalmente</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                      Cor
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="color"
                        id="color"
                        name="color"
                        value={eventForm.color}
                        onChange={handleFormChange}
                        className="h-8 w-8 border border-gray-300 rounded-md shadow-sm"
                      />
                      <span className="ml-2 text-sm text-gray-500">
                        Selecione uma cor para o evento
                      </span>
                    </div>
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
                    {isLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                  {selectedEvent && (
                    <button
                      type="button"
                      onClick={handleDeleteEvent}
                      disabled={isLoading}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CalendarPage;
