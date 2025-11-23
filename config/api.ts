import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

// Detección automática de IP local desde Expo
const getApiUrl = () => {
  if (__DEV__) {
    // Obtiene la IP local que Expo usa para el Metro bundler
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
      const ip = debuggerHost.split(':')[0];
      console.log('API conectando a:', `http://${ip}:4000/api`);
      return `http://${ip}:4000/api`;
    }
    // Fallback si no detecta IP
    return 'http://localhost:4000/api';
  }
  // Producción (cuando hagas build para publicar)
  return 'https://tu-backend-url.com/api';
};

export const API_BASE_URL = getApiUrl();

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a cada petición
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('❌ API Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
      
      if (error.response.status === 401) {
        // Token expirado o inválido - limpiar sesión
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }
    } else if (error.request) {
      console.log('No response received - Backend no alcanzable');
    }
    return Promise.reject(error);
  }
);

export default api;
