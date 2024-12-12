import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh if:
    // 1. It's a 401 error
    // 2. We have a refresh token
    // 3. The original request wasn't to the token endpoint
    // 4. We haven't tried to refresh before
    if (error.response.status === 401 
        && !originalRequest._retry 
        && localStorage.getItem('refreshToken')
        && !originalRequest.url.includes('/token/')) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        // Don't redirect, just reject the promise
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const apiService = {
  // Auth
  login: (credentials) => api.post('/token/', credentials),
  refreshToken: (token) => api.post('/token/refresh/', { refresh: token }),
  register: (userData) => api.post('/users/register/', userData),
  resetPassword: (email) => api.post('/users/password-reset/', { email }),
  
  // User
  getProfile: () => api.get('/users/me/'),
  updateProfile: (data) => api.put(`/users/${data.id}/`, data),
  deleteAccount: () => api.delete('/users/delete_account/'),
  
  // Modules
  getModules() {
    return api.get('/modules/');
  },
  getModule(id) {
    return api.get(`/modules/${id}/`);
  },
  getModulePages: (moduleId) => api.get(`/modules/${moduleId}/pages/`),
  createModule: (data) => api.post('/modules/', data),
  updateModule: (id, data) => api.put(`/modules/${id}/`, data),
  deleteModule: (id) => api.delete(`/modules/${id}/`),
  saveModule(id) {
    return api.post(`/modules/${id}/save/`);
  },
  unsaveModule(id) {
    return api.post(`/modules/${id}/unsave/`);
  },
  getSavedModules() {
    return api.get('/modules/saved/');
  },
  
  // Pages
  createPage: (moduleId, data) => {
    const formattedData = {
      ...data,
      module: moduleId,
      quiz_options: data.type === 'quiz' ? data.quiz_options.map(option => ({
        text: option.text,
        is_correct: option.is_correct || false
      })) : undefined
    };
    return api.post(`/modules/${moduleId}/pages/`, formattedData);
  },
  
  updatePage: (moduleId, pageId, data) => {
    const formattedData = {
      ...data,
      module: moduleId,
      quiz_options: data.type === 'quiz' ? data.quiz_options.map(option => ({
        text: option.text,
        is_correct: option.is_correct || false
      })) : undefined
    };
    return api.put(`/modules/${moduleId}/pages/${pageId}/`, formattedData);
  },
  
  deletePage: (moduleId, pageId) => api.delete(`/modules/${moduleId}/pages/${pageId}/`),
  
  // Progress
  getProgress() {
    return api.get('/progress/');
  },

  async updateProgress(moduleId, data) {
    try {
      // First try to get existing progress
      const response = await api.get('/progress/');
      const existingProgress = response.data.find(p => p.module === parseInt(moduleId));
      
      if (existingProgress) {
        // If progress exists, update it
        return api.patch(`/progress/${existingProgress.id}/`, {
          ...data,
          module: moduleId,
          progress: data.completed ? 100 : (data.progress || existingProgress.progress)
        });
      } else {
        // If no progress exists, create new
        return api.post('/progress/', {
          module: moduleId,
          progress: data.completed ? 100 : (data.progress || 0),
          ...data
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  completeModule(moduleId) {
    return this.updateProgress(moduleId, { completed: true, progress: 100 });
  },
};

export default apiService;
