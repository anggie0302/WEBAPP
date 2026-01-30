import api from './api';

export default {
  getRestaurants() {
    return api.get('/customer/restaurants');
  },
  getRestaurantMenu(restaurantId) {
    return api.get(`/customer/restaurants/${restaurantId}/menu`);
  },
  validatePromo(data) {
    return api.post('/customer/promo/validate', data);
  },
  getAvailablePromos() {
    return api.get('/customer/promos');
  }
};
