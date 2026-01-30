<script setup>
import { onMounted, ref } from 'vue';
import orderService from '@/services/orderService';
import { formatCurrency } from '@/utils/currency';

const activeOrders = ref([]);
const pastOrders = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await orderService.getMyOrders();
    const allOrders = response.data;
    
    // Split orders into active and past
    activeOrders.value = allOrders.filter(o => ['pending', 'confirmed', 'cooking', 'ready', 'on_the_way', 'accepted'].includes(o.status));
    pastOrders.value = allOrders.filter(o => ['delivered', 'cancelled'].includes(o.status));
  } catch (error) {
    console.error('Failed to fetch orders', error);
  } finally {
    loading.value = false;
  }
});

const getStatusLabel = (status) => {
  const map = {
    'pending': 'Menunggu Konfirmasi',
    'confirmed': 'Diterima Restoran',
    'accepted': 'Diterima Restoran',
    'cooking': 'Sedang Dimasak',
    'ready': 'Menunggu Driver',
    'on_the_way': 'Sedang Diantar',
    'delivered': 'Selesai',
    'cancelled': 'Dibatalkan'
  };
  return map[status] || status;
};

const getStatusClass = (status) => {
  if (['delivered'].includes(status)) return 'status-completed';
  if (['cancelled'].includes(status)) return 'status-cancelled';
  return 'status-active';
};
</script>

<template>
  <div class="orders-page">
    <div class="container">
      <h1>Pesanan Saya</h1>

      <div v-if="loading" class="loading">Memuat pesanan...</div>

      <div v-else>
        <!-- Active Orders -->
        <section class="order-section">
          <h2>Sedang Berjalan</h2>
          <div v-if="activeOrders.length === 0" class="empty-state">Tidak ada pesanan aktif.</div>
          
          <div v-for="order in activeOrders" :key="order.id" class="order-card active-card">
            <div class="card-header">
              <div class="meta">
                <span class="date">{{ new Date(order.createdAt).toLocaleDateString() }}</span>
                <span class="id">Order {{ order.id }}</span>
              </div>
              <span class="status-badge" :class="getStatusClass(order.status)">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            
            <div class="card-body">
              <div class="restaurant-info">
                <h3>{{ order.Restaurant?.name }}</h3>
                <p>{{ order.OrderItems.length }} item • {{ formatCurrency(order.total_amount) }}</p>
              </div>
              <router-link :to="`/order/${order.id}/tracking`" class="btn-track">Lacak Pesanan</router-link>
            </div>
          </div>
        </section>

        <!-- Past Orders -->
        <section class="order-section">
          <h2>Riwayat Pesanan</h2>
          <div v-if="pastOrders.length === 0" class="empty-state">Belum ada riwayat pesanan.</div>

          <div v-for="order in pastOrders" :key="order.id" class="order-card past-card">
            <div class="card-header">
              <div class="meta">
                <span class="date">{{ new Date(order.createdAt).toLocaleDateString() }}</span>
                <span class="id">Order {{ order.id }}</span>
              </div>
              <span class="status-badge" :class="getStatusClass(order.status)">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            
            <div class="card-body">
              <div class="restaurant-info">
                <h3>{{ order.Restaurant?.name }}</h3>
                <p>{{ order.OrderItems.length }} item • {{ formatCurrency(order.total_amount) }}</p>
              </div>
              <button class="btn-reorder">Pesan Lagi</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  background-color: #f9f9f9;
  min-height: 100vh;
  padding: 30px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 { margin-bottom: 30px; color: #333; }

.order-section { margin-bottom: 40px; }

h2 {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 15px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.empty-state {
  color: #999;
  font-style: italic;
  padding: 20px 0;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #f0f0f0;
}

.active-card {
  border-left: 5px solid #F53D2D;
}

.past-card {
  border-left: 5px solid #ccc;
  opacity: 0.9;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.meta { color: #777; }
.id { font-weight: bold; margin-left: 10px; }

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-active { background: #FFF5F4; color: #F53D2D; }
.status-completed { background: #e8f5e9; color: #28a745; }
.status-cancelled { background: #f8f9fa; color: #6c757d; }

.card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.restaurant-info h3 { margin: 0 0 5px; font-size: 1.1rem; }
.restaurant-info p { margin: 0; color: #777; font-size: 0.9rem; }

.btn-track {
  background: #F53D2D;
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

.btn-reorder {
  background: white;
  border: 1px solid #F53D2D;
  color: #F53D2D;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-reorder:hover {
  background: #FFF5F4;
}
</style>
