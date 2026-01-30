import { defineStore } from 'pinia';
import authService from '@/services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isCustomer: (state) => state.user?.role === 'customer',
    isRestaurant: (state) => state.user?.role === 'restaurant',
    isDriver: (state) => state.user?.role === 'driver',
  },
  actions: {
    async login(credentials) {
      try {
        const response = await authService.login(credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return true;
      } catch (error) {
        throw error;
      }
    },
    async register(userData) {
      try {
        const response = await authService.register(userData);
        this.token = response.data.token;
        this.user = response.data.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return true;
      } catch (error) {
        throw error;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});
