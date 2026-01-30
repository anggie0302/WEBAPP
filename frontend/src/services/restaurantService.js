import api from './api';

export default {
  getProfile() {
    return api.get('/restaurant/profile');
  },
  toggleOpen() {
    return api.post('/restaurant/toggle-open');
  },
  getStats() {
    return api.get('/restaurant/stats');
  },
  getMenu() {
    return api.get('/restaurant/menu');
  },
  addMenu(data) {
    return api.post('/restaurant/menu', data);
  },
  updateMenu(id, data) {
    return api.put(`/restaurant/menu/${id}`, data);
  },
  deleteMenu(id) {
    return api.delete(`/restaurant/menu/${id}`);
  }
};
