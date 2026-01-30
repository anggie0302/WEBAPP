<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useRouter, useRoute } from 'vue-router';
import { computed, onMounted, onUnmounted, ref } from 'vue';

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();
const route = useRoute();

const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));

const logout = () => {
  authStore.logout();
  router.push('/login');
};

const headerClass = computed(() => {
  if (route.path === '/') {
    return isScrolled.value ? 'header-solid' : 'header-transparent';
  }
  return 'header-solid';
});
</script>

<template>
  <header class="app-header" :class="headerClass">
    <div class="container header-container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <span class="logo-icon">🍔</span>
        <span class="logo-text">MakanYuk</span>
      </router-link>

      <!-- Desktop Search (Center) - Only for Customer -->
      <div v-if="authStore.user?.role === 'customer'" class="search-wrapper">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Mau makan apa hari ini?" />
        </div>
      </div>

      <!-- Actions (Right) -->
      <div class="actions">
        <!-- Cart Button (Customer Only) -->
        <router-link v-if="authStore.user?.role === 'customer'" to="/checkout" class="action-btn cart-btn">
          🛒
          <span v-if="cartStore.totalItems > 0" class="badge">{{ cartStore.totalItems }}</span>
        </router-link>
        
        <div v-if="authStore.isAuthenticated" class="user-menu">
          <span class="user-greeting">Hi, {{ authStore.user?.name || 'User' }}</span>
          
          <router-link v-if="authStore.user?.role === 'customer'" to="/orders" class="btn-orders">Pesanan Saya</router-link>
          <router-link v-else-if="authStore.user?.role === 'restaurant'" to="/restaurant-dashboard" class="btn-orders">Dashboard</router-link>
          <router-link v-else-if="authStore.user?.role === 'driver'" to="/driver-dashboard" class="btn-orders">Dashboard</router-link>
          
          <button @click="logout" class="btn-logout">Logout</button>
        </div>
        <div v-else class="auth-buttons">
          <router-link to="/login" class="btn-login">Masuk</router-link>
          <router-link to="/register" class="btn-register">Daftar</router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 15px 0;
  transition: all 0.3s ease;
}

.header-transparent {
  background: transparent;
  padding: 20px 0;
}

/* Adjust text color for transparent header on dark background (hero) */
.header-transparent .logo-text, 
.header-transparent .user-greeting {
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-solid {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 10px 0;
}

.header-solid .logo-text { color: #F53D2D; }
.header-solid .user-greeting { color: #333; }

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 8px;
}

.logo-icon { font-size: 2rem; }

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

/* Search */
.search-wrapper {
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
}

.search-bar {
  background: white;
  border-radius: 50px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid #eee;
  transition: all 0.3s;
}

.search-bar:focus-within {
  box-shadow: 0 4px 12px rgba(245, 61, 45, 0.15);
  border-color: #F53D2D;
}

.search-icon { color: #999; margin-right: 10px; }

.search-bar input {
  border: none;
  width: 100%;
  outline: none;
  font-size: 0.95rem;
}

/* Actions */
.actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-btn {
  position: relative;
  font-size: 1.4rem;
  text-decoration: none;
  color: inherit;
}

.badge {
  position: absolute;
  top: -5px;
  right: -8px;
  background: #F53D2D;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  border: 2px solid white;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-greeting {
  font-weight: 600;
}

.btn-logout {
  background: #eee;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.btn-login {
  color: #333;
  font-weight: 700;
  text-decoration: none;
  padding: 8px 16px;
}

.btn-register {
  background: #F53D2D;
  color: white;
  text-decoration: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: 700;
  transition: background 0.3s;
}

.btn-register:hover {
  background: #d7321f;
}

/* Responsive */
@media (max-width: 768px) {
  .logo-text, .user-greeting, .search-wrapper {
    display: none;
  }
  
  .header-container {
    justify-content: space-between;
  }
  
  .search-wrapper {
    display: none; /* Hide top search on mobile, use hero search */
  }
}
</style>
