import axios from 'axios';

// Criar instância do axios com configurações padrão
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    // Verificar se estamos no browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratar erros de autenticação
    if (error.response && error.response.status === 401) {
      // Se estamos no browser, redirecionar para login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Serviço de autenticação
export const authService = {
  // Registrar novo usuário
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Login de usuário
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Logout de usuário
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  },

  // Obter perfil do usuário atual
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Atualizar perfil do usuário
  updateProfile: async (profileData) => {
    const response = await api.patch('/auth/update-profile', profileData);
    return response.data;
  },

  // Atualizar senha
  updatePassword: async (passwordData) => {
    const response = await api.patch('/auth/update-password', passwordData);
    return response.data;
  },

  // Verificar se o usuário está autenticado
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }
};

// Serviço de crianças
export const childrenService = {
  // Obter todas as crianças do usuário
  getChildren: async () => {
    const response = await api.get('/children');
    return response.data;
  },

  // Obter uma criança específica
  getChild: async (id) => {
    const response = await api.get(`/children/${id}`);
    return response.data;
  },

  // Criar nova criança
  createChild: async (childData) => {
    const response = await api.post('/children', childData);
    return response.data;
  },

  // Atualizar criança
  updateChild: async (id, childData) => {
    const response = await api.patch(`/children/${id}`, childData);
    return response.data;
  },

  // Excluir criança
  deleteChild: async (id) => {
    const response = await api.delete(`/children/${id}`);
    return response.data;
  },

  // Obter idade formatada da criança
  getChildAge: async (id) => {
    const response = await api.get(`/children/${id}/age`);
    return response.data;
  }
};

// Serviço de desenvolvimento
export const developmentService = {
  // Obter todos os marcos de desenvolvimento de uma criança
  getMilestones: async (childId) => {
    const response = await api.get(`/children/${childId}/milestones`);
    return response.data;
  },

  // Obter um marco de desenvolvimento específico
  getMilestone: async (childId, id) => {
    const response = await api.get(`/children/${childId}/milestones/${id}`);
    return response.data;
  },

  // Criar novo marco de desenvolvimento
  createMilestone: async (childId, milestoneData) => {
    const response = await api.post(`/children/${childId}/milestones`, milestoneData);
    return response.data;
  },

  // Atualizar marco de desenvolvimento
  updateMilestone: async (childId, id, milestoneData) => {
    const response = await api.patch(`/children/${childId}/milestones/${id}`, milestoneData);
    return response.data;
  },

  // Registrar marco de desenvolvimento como alcançado
  achieveMilestone: async (childId, id, achieveData) => {
    const response = await api.post(`/children/${childId}/milestones/${id}/achieve`, achieveData);
    return response.data;
  },

  // Excluir marco de desenvolvimento
  deleteMilestone: async (childId, id) => {
    const response = await api.delete(`/children/${childId}/milestones/${id}`);
    return response.data;
  }
};

// Serviço de conteúdo
export const contentService = {
  // Obter todos os conteúdos
  getAllContent: async (params) => {
    const response = await api.get('/content', { params });
    return response.data;
  },

  // Obter um conteúdo específico
  getContent: async (id) => {
    const response = await api.get(`/content/${id}`);
    return response.data;
  },

  // Obter conteúdos recomendados
  getRecommendedContent: async (params) => {
    const response = await api.get('/content/recommended', { params });
    return response.data;
  },

  // Curtir um conteúdo
  likeContent: async (id) => {
    const response = await api.post(`/content/${id}/like`);
    return response.data;
  }
};

// Serviço de calendário
export const calendarService = {
  // Obter todos os calendários do usuário
  getCalendars: async () => {
    const response = await api.get('/calendars');
    return response.data;
  },

  // Obter um calendário específico
  getCalendar: async (id) => {
    const response = await api.get(`/calendars/${id}`);
    return response.data;
  },

  // Criar novo calendário
  createCalendar: async (calendarData) => {
    const response = await api.post('/calendars', calendarData);
    return response.data;
  },

  // Atualizar calendário
  updateCalendar: async (id, calendarData) => {
    const response = await api.patch(`/calendars/${id}`, calendarData);
    return response.data;
  },

  // Excluir calendário
  deleteCalendar: async (id) => {
    const response = await api.delete(`/calendars/${id}`);
    return response.data;
  },

  // Compartilhar calendário
  shareCalendar: async (id, shareData) => {
    const response = await api.post(`/calendars/${id}/share`, shareData);
    return response.data;
  },

  // Remover compartilhamento
  removeShare: async (id, userId) => {
    const response = await api.delete(`/calendars/${id}/share/${userId}`);
    return response.data;
  }
};

// Serviço de eventos
export const eventService = {
  // Obter todos os eventos de um calendário
  getEvents: async (calendarId, params) => {
    const response = await api.get(`/calendars/${calendarId}/events`, { params });
    return response.data;
  },

  // Obter um evento específico
  getEvent: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Criar novo evento
  createEvent: async (calendarId, eventData) => {
    const response = await api.post(`/calendars/${calendarId}/events`, eventData);
    return response.data;
  },

  // Atualizar evento
  updateEvent: async (id, eventData) => {
    const response = await api.patch(`/events/${id}`, eventData);
    return response.data;
  },

  // Excluir evento
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Obter próximas ocorrências de um evento recorrente
  getEventOccurrences: async (id, params) => {
    const response = await api.get(`/events/${id}/occurrences`, { params });
    return response.data;
  }
};

// Serviço de comunidade
export const communityService = {
  // Obter todos os tópicos
  getTopics: async (params) => {
    const response = await api.get('/topics', { params });
    return response.data;
  },

  // Obter um tópico específico
  getTopic: async (id) => {
    const response = await api.get(`/topics/${id}`);
    return response.data;
  },

  // Criar novo tópico
  createTopic: async (topicData) => {
    const response = await api.post('/topics', topicData);
    return response.data;
  },

  // Atualizar tópico
  updateTopic: async (id, topicData) => {
    const response = await api.patch(`/topics/${id}`, topicData);
    return response.data;
  },

  // Excluir tópico
  deleteTopic: async (id) => {
    const response = await api.delete(`/topics/${id}`);
    return response.data;
  },

  // Curtir tópico
  likeTopic: async (id) => {
    const response = await api.post(`/topics/${id}/like`);
    return response.data;
  },

  // Obter comentários de um tópico
  getTopicComments: async (id) => {
    const response = await api.get(`/topics/${id}/comments`);
    return response.data;
  },

  // Adicionar comentário a um tópico
  addComment: async (id, commentData) => {
    const response = await api.post(`/topics/${id}/comments`, commentData);
    return response.data;
  },

  // Obter um comentário específico
  getComment: async (id) => {
    const response = await api.get(`/comments/${id}`);
    return response.data;
  },

  // Atualizar comentário
  updateComment: async (id, commentData) => {
    const response = await api.patch(`/comments/${id}`, commentData);
    return response.data;
  },

  // Excluir comentário
  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },

  // Curtir comentário
  likeComment: async (id) => {
    const response = await api.post(`/comments/${id}/like`);
    return response.data;
  },

  // Sinalizar comentário
  flagComment: async (id) => {
    const response = await api.post(`/comments/${id}/flag`);
    return response.data;
  }
};

export default api;
