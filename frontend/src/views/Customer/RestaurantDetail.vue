<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import customerService from '@/services/customerService';
import MenuItem from '@/components/Customer/MenuItem.vue';
import Cart from '@/components/Customer/Cart.vue';

const route = useRoute();
const restaurant = ref(null);
const menu = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await customerService.getRestaurantMenu(route.params.id);
    restaurant.value = response.data.restaurant;
    menu.value = response.data.menu;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="loading" class="loading-state">
    <div class="spinner">🍔</div>
    <p>Memuat menu lezat...</p>
  </div>
  
  <div v-else class="restaurant-detail-page">
    <div class="container">
      <!-- Banner Info Resto -->
      <div class="restaurant-header">
        <div class="header-content">
          <div class="resto-badge">Partner</div>
          <h1>{{ restaurant.name }}</h1>
          <div class="meta">
            <span class="category">Fast Food • Snacks</span>
            <span class="dot">•</span>
            <span class="rating">⭐ 4.8</span>
            <span class="dot">•</span>
            <span :class="restaurant.is_open ? 'status-open' : 'status-closed'">
              {{ restaurant.is_open ? 'BUKA' : 'TUTUP' }}
            </span>
          </div>
          <p class="address">📍 {{ restaurant.address }}</p>
        </div>
      </div>

      <div v-if="!restaurant.is_open" class="closed-banner">
        <h3>🚫 Maaf, toko ini sedang tutup.</h3>
        <p>Anda tidak dapat memesan menu saat ini. Silakan kembali lagi nanti.</p>
      </div>

      <div class="content-layout">
        <div class="main-column">
          <div class="menu-section">
            <h2 class="section-title">Menu Spesial</h2>
            <div class="menu-grid">
              <MenuItem 
                v-for="item in menu" 
                :key="item.id" 
                :item="item" 
                :restaurantId="restaurant.id"
                :restaurantName="restaurant.name"
                :isRestaurantOpen="restaurant.is_open"
              />
            </div>
          </div>
        </div>
        
        <div class="sidebar-column">
          <div class="sticky-cart">
            <Cart />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.restaurant-detail-page {
  background-color: #f9f9f9;
  min-height: 100vh;
  padding-top: 100px; /* Add padding to avoid overlap with fixed header */
  padding-bottom: 40px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading-state {
  height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #777;
}

.spinner {
  font-size: 3rem;
  margin-bottom: 10px;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Header */
.restaurant-header {
  background: white;
  border-radius: 0 0 16px 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
}

.restaurant-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #F53D2D, #ffc107);
}

.header-content {
  max-width: 800px;
}

h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #333;
  margin: 10px 0;
}

.resto-badge {
  display: inline-block;
  background: #F53D2D;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta {
  display: flex;
  align-items: center;
  color: #555;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.dot { margin: 0 8px; color: #ccc; }
.rating { color: #ffc107; font-weight: bold; }

.address {
  color: #777;
  margin: 0;
}

/* Layout */
.content-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.sticky-cart {
  position: sticky;
  top: 90px; /* Adjust based on header height */
}

/* Responsive */
@media (max-width: 900px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar-column {
    order: -1; /* Show cart summary on top on mobile or hide? Usually cart is floating button on mobile */
    display: none; /* Hide standard cart on mobile, assume we use floating action button or bottom sheet */
  }
}

@media (max-width: 480px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 columns for menu items on mobile */
    gap: 15px;
  }
  
  .restaurant-header {
    padding: 20px;
  }
  
  h1 { font-size: 1.5rem; }
}

.status-open {
  color: #28a745;
  font-weight: bold;
  background: #e8f5e9;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-closed {
  color: #dc3545;
  font-weight: bold;
  background: #ffebee;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.closed-banner {
  background: #fff3cd;
  color: #856404;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  border: 1px solid #ffeeba;
  text-align: center;
}

.closed-banner h3 {
  margin: 0 0 10px;
}

.closed-banner p {
  margin: 0;
}
</style>
