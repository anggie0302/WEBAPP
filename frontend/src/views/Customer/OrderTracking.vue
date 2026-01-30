<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import orderService from '@/services/orderService';
import io from 'socket.io-client';
import { formatCurrency } from '@/utils/currency';

const route = useRoute();
const order = ref(null);
const socket = ref(null);
const loading = ref(true);
const pollInterval = ref(null);

// Timeline Statuses
const steps = [
  { key: 'pending', label: 'Pesanan Diterima', icon: '📝' },
  { key: 'cooking', label: 'Sedang Dibuat', icon: '🍳' },
  { key: 'ready', label: 'Menunggu Driver', icon: '🛍️' },
  { key: 'on_the_way', label: 'Diantar Driver', icon: '🛵' },
  { key: 'delivered', label: 'Pesanan Selesai', icon: '✅' }
];

const currentStepIndex = computed(() => {
  if (!order.value) return 0;
  // Map specific statuses to step indices
  const statusMap = {
    'pending': 0,
    'confirmed': 0, // Treat confirmed as received/pending processing
    'cooking': 1,
    'ready': 2,
    'on_the_way': 3,
    'delivered': 4,
    'completed': 4,
    'cancelled': -1
  };
  return statusMap[order.value.status] ?? 0;
});

const fetchOrder = async () => {
  try {
    const response = await orderService.getOrder(route.params.id);
    order.value = response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchOrder();

  // Socket Connection
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  if (socketUrl) {
    socket.value = io(socketUrl);
    if (order.value && socket.value) {
      socket.value.on(`order_${order.value.id}`, (updatedOrder) => {
        if (order.value) {
          order.value.status = updatedOrder.status;
        }
      });
    }
  } else {
    pollInterval.value = setInterval(fetchOrder, 5000);
  }
});

onUnmounted(() => {
  if (socket.value) socket.value.disconnect();
  if (pollInterval.value) clearInterval(pollInterval.value);
});
</script>

<template>
  <div class="tracking-page">
    <div v-if="loading" class="loading">Memuat status pesanan...</div>
    
    <div v-else-if="order" class="container">
      <div class="status-card">
        <h2>Status Pesanan {{ order.id }}</h2>
        <div class="restaurant-name">{{ order.Restaurant?.name }}</div>
        
        <!-- Timeline -->
        <div class="timeline">
          <div 
            v-for="(step, index) in steps" 
            :key="step.key" 
            class="timeline-item"
            :class="{ 
              'active': index <= currentStepIndex,
              'current': index === currentStepIndex
            }"
          >
            <div class="icon-circle">{{ step.icon }}</div>
            <div class="step-label">{{ step.label }}</div>
            <!-- Connector is colored if this step AND the next step are active/passed -->
            <div class="connector" v-if="index < steps.length - 1"
              :class="{ 'active': index < currentStepIndex }"
            ></div>
          </div>
        </div>

        <div class="current-status-message">
          <h3 v-if="order.status === 'pending'">Menunggu konfirmasi restoran...</h3>
          <h3 v-else-if="order.status === 'confirmed'">Pesanan dikonfirmasi! Segera diproses. 👍</h3>
          <h3 v-else-if="order.status === 'cooking'">Restoran sedang menyiapkan makananmu! 🔥</h3>
          <h3 v-else-if="order.status === 'ready'">Makanan siap! Mencari driver... 🛵</h3>
          <h3 v-else-if="order.status === 'on_the_way'">Driver sedang menuju ke tempatmu! 🏁</h3>
          <h3 v-else-if="order.status === 'delivered'">Makanan sudah sampai. Selamat menikmati! 😋</h3>
        </div>
      </div>

      <div class="details-grid">
        <div class="card detail-card">
          <h3>Rincian Pesanan</h3>
          <div class="item-list">
            <div v-for="item in order.OrderItems" :key="item.id" class="order-item">
              <span class="qty">{{ item.quantity }}x</span>
              <span class="name">{{ item.MenuItem?.name }}</span>
              <span class="price">{{ formatCurrency(item.price * item.quantity) }}</span>
            </div>
          </div>
          <hr>
          <div class="total-row">
            <span>Total Pembayaran</span>
            <span class="total-price">{{ formatCurrency(order.total_amount) }}</span>
          </div>
        </div>

        <div class="card driver-card" v-if="order.driver_id && order.Driver">
          <h3>Info Driver</h3>
          <div class="driver-info">
            <div class="driver-avatar">🛵</div>
            <div>
              <div class="driver-name">{{ order.Driver.User?.name || 'Driver' }}</div>
              <div class="plate-number">{{ order.Driver.vehicle_number || 'N/A' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found">Pesanan tidak ditemukan.</div>
  </div>
</template>

<style scoped>
.tracking-page {
  background-color: #f9f9f9;
  min-height: 100vh;
  padding: 100px 20px 40px; /* Increased top padding to push content down */
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.status-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  text-align: center;
}

.restaurant-name {
  color: #777;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

/* Timeline */
.timeline {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  position: relative;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  z-index: 2;
}

.icon-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 10px;
  transition: all 0.3s;
  border: 3px solid white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.timeline-item.active .icon-circle {
  background: #4caf50; /* Green for past/active steps */
  color: white; /* Grayscale icons inside might need adjustment or use emoji which are colored */
}

.timeline-item.current .icon-circle {
  background: #F53D2D; /* Primary color for current step */
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(245, 61, 45, 0.3);
}

.step-label {
  font-size: 0.8rem;
  color: #999;
  font-weight: 600;
}

.timeline-item.active .step-label {
  color: #333;
}

.connector {
  position: absolute;
  top: 25px;
  left: 50%;
  width: 100%;
  height: 3px;
  background: #eee;
  z-index: -1;
}

.timeline-item.active .connector {
  background: #4caf50;
}

/* Last item shouldn't have connector to right, but CSS logic above puts it. 
   Actually logic `v-if="index < steps.length - 1"` handles it correctly. 
   The issue is coloring the connector. The connector belongs to the *current* item and goes to the right.
   So if item is active, its connector should be active IF the next item is also active?
   Simpler: Use a background bar behind everything.
*/

/* Fix connector coloring logic roughly */
.timeline-item.active .connector {
  background: #4caf50; 
}
/* If current is index 2, item 0 and 1 are active. Item 0 connector connects to 1. Item 1 connector connects to 2.
   So if index < currentStepIndex, connector is green.
*/

.current-status-message h3 {
  color: #F53D2D;
  font-size: 1.3rem;
  margin: 0;
}

/* Details */
.details-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .timeline {
    overflow-x: auto;
    padding-bottom: 10px;
    justify-content: flex-start;
    gap: 20px;
  }
  
  .timeline-item {
    min-width: 80px;
  }
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.item-list {
  margin-bottom: 15px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.qty { font-weight: bold; color: #F53D2D; margin-right: 10px; }
.name { flex: 1; }
.price { font-weight: 600; }

.total-row {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 1.1rem;
  margin-top: 10px;
}

.total-price { color: #F53D2D; }

.driver-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.driver-avatar {
  width: 50px;
  height: 50px;
  background: #eee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.driver-name { font-weight: 700; }
.plate-number { color: #777; font-size: 0.9rem; }
</style>
