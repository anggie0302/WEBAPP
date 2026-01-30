import api from './api';

export default {
  // Customer
  createOrder(orderData) {
    return api.post('/orders', orderData);
  },
  getMyOrders() {
    return api.get('/orders/my-orders');
  },
  getOrder(id) {
    return api.get(`/orders/${id}`);
  },

  // Restaurant
  getRestaurantOrders() {
    return api.get('/restaurant/orders');
  },
  updateOrderStatus(orderId, status) {
    return api.put(`/restaurant/orders/${orderId}/status`, { status });
  },
  updateOrderPayment(orderId) {
    return api.patch(`/restaurant/orders/${orderId}/pay`);
  },

  // Driver
  getReadyOrders() {
    return api.get('/orders/ready');
  },
  getDriverActiveOrders() {
    return api.get('/orders/active-deliveries');
  },
  getDriverOrderHistory() {
    return api.get('/orders/history');
  },
  driverAcceptOrder(orderId) {
    return api.post(`/orders/${orderId}/accept`);
  },
  driverCompleteOrder(orderId) {
    return api.post(`/orders/${orderId}/complete`);
  }
};
