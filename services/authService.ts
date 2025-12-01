import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  // Registrar nuevo usuario
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Registering user:', { ...data, password: '***' });
      const response = await api.post<AuthResponse>('/auth/register', data);
      console.log('Register response:', response.data);
      
      // Guardar token y usuario en AsyncStorage
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error: any) {
      // Avoid logging full error object to prevent raw JSON appearing in UI overlays.
      // The caller (AuthContext) will extract and surface a user-friendly message.
      throw error;
    }
  }

  // Iniciar sesión
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('Logging in user:', { ...data, password: '***' });
      const response = await api.post<AuthResponse>('/auth/login', data);
      console.log('Login response:', response.data);
      
      // Guardar token y usuario en AsyncStorage
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error: any) {
      // Avoid logging full error object here for the same reason as above.
      throw error;
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  }

  // Obtener usuario actual guardado
  async getCurrentUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  // Verificar si hay sesión activa
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  }
}

export default new AuthService();
