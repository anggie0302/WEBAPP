import api from './api';

export default {
  getProfile() {
    return api.get('/driver/profile');
  },
  toggleAvailability() {
    return api.post('/driver/toggle-availability');
  },
  getStats() {
    return api.get('/driver/stats');
  }
};
