import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    restaurantId: null, // Can only order from one restaurant at a time
    restaurantName: null
  }),
  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
  },
  actions: {
    addToCart(item, restaurantId, restaurantName) {
      // Check if adding from different restaurant
      if (this.restaurantId && this.restaurantId !== restaurantId) {
        if (!confirm('Start new cart? Adding items from a new restaurant will clear your current cart.')) {
          return;
        }
        this.clearCart();
      }

      this.restaurantId = restaurantId;
      this.restaurantName = restaurantName;

      const existingItem = this.items.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.items.push({ ...item, quantity: 1 });
      }
    },
    removeFromCart(itemId) {
      this.items = this.items.filter(item => item.id !== itemId);
      if (this.items.length === 0) {
        this.restaurantId = null;
        this.restaurantName = null;
      }
    },
    updateQuantity(itemId, quantity) {
      const item = this.items.find(i => i.id === itemId);
      if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
          this.removeFromCart(itemId);
        }
      }
    },
    clearCart() {
      this.items = [];
      this.restaurantId = null;
      this.restaurantName = null;
    }
  }
});
