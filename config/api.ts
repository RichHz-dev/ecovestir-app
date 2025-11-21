import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// URL base de tu backend - cambia esto según donde esté desplegado
// Para Android Emulator usa: 10.0.2.2
// Para dispositivo físico/Expo Go usa tu IP local: 192.168.0.x
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.0.181:4000/api' // Desarrollo local - cambia a tu IP
  : 'https://tu-backend-url.com/api'; // Producción

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
    console.log('API Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
      
      if (error.response.status === 401) {
        // Token expirado o inválido - limpiar sesión
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }
    } else if (error.request) {
      console.log('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

export default api;
