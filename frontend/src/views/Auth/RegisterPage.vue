<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('customer');
const phone = ref('');
// Additional fields
const restaurantName = ref('');
const address = ref('');
const vehiclePlate = ref('');

const error = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  try {
    const payload = {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
      phone: phone.value,
      ...(role.value === 'restaurant' && { restaurant_name: restaurantName.value, address: address.value }),
      ...(role.value === 'driver' && { vehicle_plate: vehiclePlate.value })
    };

    await authStore.register(payload);
    
    if (authStore.isRestaurant) router.push('/restaurant-dashboard');
    else if (authStore.isDriver) router.push('/driver-dashboard');
    else router.push('/');

  } catch (err) {
    error.value = err.response?.data?.error || 'Registration failed';
  }
};
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Gabung Sekarang</h1>
        <p>Mulai perjalanan kulinermu bersama kami!</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>Daftar Sebagai</label>
          <div class="role-selector">
            <label class="role-option" :class="{ active: role === 'customer' }">
              <input type="radio" v-model="role" value="customer">
              <span>👤 Customer</span>
            </label>
            <label class="role-option" :class="{ active: role === 'restaurant' }">
              <input type="radio" v-model="role" value="restaurant">
              <span>🏪 Restoran</span>
            </label>
            <label class="role-option" :class="{ active: role === 'driver' }">
              <input type="radio" v-model="role" value="driver">
              <span>🛵 Driver</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Nama Lengkap</label>
          <input v-model="name" type="text" placeholder="Nama Anda" required />
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="email@contoh.com" required />
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </div>
        
        <div class="form-group">
          <label>Nomor Telepon</label>
          <input v-model="phone" type="text" placeholder="0812-3456-7890" />
        </div>

        <!-- Restaurant Specific -->
        <transition name="fade">
          <div v-if="role === 'restaurant'" class="extra-fields">
            <div class="form-group">
              <label>Nama Restoran</label>
              <input v-model="restaurantName" type="text" placeholder="Contoh: Resto Padang Murah" required />
            </div>
            <div class="form-group">
              <label>Alamat Restoran</label>
              <textarea v-model="address" placeholder="Alamat lengkap..." required></textarea>
            </div>
          </div>
        </transition>

        <!-- Driver Specific -->
        <transition name="fade">
          <div v-if="role === 'driver'" class="extra-fields">
            <div class="form-group">
              <label>Plat Nomor Kendaraan</label>
              <input v-model="vehiclePlate" type="text" placeholder="B 1234 XYZ" required />
            </div>
          </div>
        </transition>

        <div v-if="error" class="error-msg">⚠️ {{ error }}</div>
        
        <button type="submit" class="btn-primary">Daftar Akun</button>
        
        <p class="auth-footer">
          Sudah punya akun? <router-link to="/login">Login di sini</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  padding: 40px 20px;
}

.auth-card {
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  backdrop-filter: blur(5px);
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  color: #F53D2D;
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
}

.auth-header p {
  color: #666;
  margin-top: 5px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
  background: #f9f9f9;
  font-family: inherit;
  box-sizing: border-box; /* Ensure padding doesn't affect width */
}

.form-group input:focus, .form-group textarea:focus {
  border-color: #F53D2D;
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(245, 61, 45, 0.1);
}

/* Role Selector */
.role-selector {
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.role-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
  text-align: center;
}

.role-option input {
  display: none;
}

.role-option.active {
  background: #FFF5F4;
  border-color: #F53D2D;
  color: #F53D2D;
  font-weight: bold;
}

.role-option:hover {
  border-color: #F53D2D;
}

.extra-fields {
  background: #fdfdfd;
  padding: 15px;
  border-radius: 8px;
  border: 1px dashed #ddd;
  margin-bottom: 20px;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: #F53D2D;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  margin-top: 10px;
}

.btn-primary:hover {
  background: #d7321f;
  transform: translateY(-2px);
}

.error-msg {
  background: #ffebee;
  color: #d32f2f;
  padding: 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 20px;
  text-align: center;
}

.auth-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 0.95rem;
  color: #555;
}

.auth-footer a {
  color: #F53D2D;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
