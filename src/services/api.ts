import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',  // Backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });
    
    // Create more detailed error message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Network error occurred';
    
    // Attach detailed error to the error object
    error.detailedMessage = errorMessage;
    error.validationErrors = error.response?.data?.message || [];
    
    return Promise.reject(error);
  }
);

export const positionApi = {
  getAll: () => api.get('/positions'),
  getTree: () => api.get('/positions/tree'),
  getOne: (id: string) => api.get(`/positions/${id}`),
  getChildren: (id: string) => api.get(`/positions/${id}/children`),
  create: (data: any) => api.post('/positions', data),
  update: (id: string, data: any) => api.put(`/positions/${id}`, data),
  delete: (id: string) => api.delete(`/positions/${id}`),
};

export default api;