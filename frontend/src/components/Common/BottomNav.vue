<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isActive = (path) => route.path === path;
</script>

<template>
  <nav class="bottom-nav">
    <router-link to="/" class="nav-item" :class="{ active: isActive('/') }">
      <span class="icon">🏠</span>
      <span class="label">Beranda</span>
    </router-link>
    
    <router-link to="/promo" class="nav-item" :class="{ active: isActive('/promo') }">
      <span class="icon">percent</span>
      <span class="label">Promo</span>
    </router-link>
    
    <router-link to="/orders" class="nav-item" :class="{ active: isActive('/orders') }">
      <span class="icon">📄</span>
      <span class="label">Pesanan</span>
    </router-link>
    
    <router-link to="/profile" class="nav-item" :class="{ active: isActive('/profile') }">
      <span class="icon">👤</span>
      <span class="label">Saya</span>
    </router-link>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  z-index: 1000;
  height: 60px;
  box-sizing: border-box;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #999;
  font-size: 0.75rem;
  flex: 1;
}

.nav-item .icon {
  font-size: 1.2rem;
  margin-bottom: 4px;
  /* Use Material Icons font if available, otherwise emoji works for now */
  font-family: 'Material Icons', sans-serif; 
}

/* Fallback for "percent" icon if using material icons ligatures, 
   but here we are using text. Let's stick to emojis for simplicity/robustness without external deps */
.nav-item .icon {
  font-style: normal;
}

.nav-item.active {
  color: #F53D2D;
  font-weight: 600;
}
</style>
