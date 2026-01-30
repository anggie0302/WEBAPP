import { defineStore } from 'pinia';
import orderService from '@/services/orderService';

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    activeOrders: []
  }),
  actions: {
    async fetchMyOrders() {
      try {
        const response = await orderService.getMyOrders();
        this.orders = response.data;
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    },
    async fetchRestaurantOrders() {
        try {
            const response = await orderService.getRestaurantOrders();
            this.orders = response.data;
        } catch (error) {
            console.error(error);
        }
    },
    async fetchReadyOrders() {
        try {
            const response = await orderService.getReadyOrders();
            this.activeOrders = response.data;
        } catch (error) {
            console.error(error);
        }
    }
  }
});
