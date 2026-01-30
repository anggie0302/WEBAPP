<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    await authStore.login({ email: email.value, password: password.value });
    
    if (authStore.isRestaurant) router.push('/restaurant-dashboard');
    else if (authStore.isDriver) router.push('/driver-dashboard');
    else router.push('/');
    
  } catch (err) {
    error.value = err.response?.data?.error || 'Login failed';
  }
};
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <h1>🍔 Makan Yuk!</h1>
        <p>Selamat Datang Kembali!</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="contoh@email.com" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </div>
        
        <div v-if="error" class="error-msg">⚠️ {{ error }}</div>
        
        <button type="submit" class="btn-primary">Masuk</button>
        
        <p class="auth-footer">
          Belum punya akun? <router-link to="/register">Daftar Sekarang</router-link>
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
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
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

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
  background: #f9f9f9;
}

.form-group input:focus {
  border-color: #F53D2D;
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(245, 61, 45, 0.1);
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
</style>
