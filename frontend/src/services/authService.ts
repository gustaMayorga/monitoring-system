import axios from 'axios';
import { API_URL } from '../config';

interface LoginCredentials {
  username: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  full_name: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await axios.post(`${API_URL}/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    return response.data;
  },

  async signup(data: SignupData): Promise<any> {
    const response = await axios.post(`${API_URL}/signup`, data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  getCurrentUser() {
    const token = localStorage.getItem('token');
    return token ? { token } : null;
  },
};

export default authService;