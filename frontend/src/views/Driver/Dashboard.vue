<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useOrderStore } from '@/stores/orderStore';
import orderService from '@/services/orderService';
import driverService from '@/services/driverService';
import io from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

const orderStore = useOrderStore();
const authStore = useAuthStore();
const socket = ref(null);
const myActiveDeliveries = ref([]);
const driverProfile = ref(null);
const stats = ref({ totalEarnings: 0, totalDeliveries: 0 });
const isAvailable = ref(true);
const historyOrders = ref([]);
const showHistory = ref(false);
let pollingInterval = null;

onMounted(async () => {
  await fetchDriverData();
  await fetchOrders();
  await fetchHistory(); 
  
  socket.value = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');
  
  // Polling fallback
  pollingInterval = setInterval(() => {
    if (isAvailable.value) {
        fetchOrders();
    }
  }, 5000);
});

onUnmounted(() => {
  if (socket.value) socket.value.disconnect();
  if (pollingInterval) clearInterval(pollingInterval);
});

const fetchDriverData = async () => {
  try {
    const profileRes = await driverService.getProfile();
    driverProfile.value = profileRes.data;
    isAvailable.value = profileRes.data.is_available;
    
    const statsRes = await driverService.getStats();
    stats.value = statsRes.data;
  } catch (error) {
    console.error(error);
  }
};

const toggleStatus = async () => {
  try {
    const res = await driverService.toggleAvailability();
    isAvailable.value = res.data.is_available;
  } catch (error) {
    alert('Gagal mengubah status');
  }
};

const fetchOrders = async () => {
  await orderStore.fetchReadyOrders();
  
  // Fetch active deliveries from backend
  try {
    const res = await orderService.getDriverActiveOrders();
    myActiveDeliveries.value = res.data;
  } catch (error) {
    console.error('Failed to fetch active deliveries', error);
  }
};

const fetchHistory = async () => {
  try {
    const res = await orderService.getDriverOrderHistory();
    historyOrders.value = res.data;
  } catch (error) {
    console.error('Failed to fetch history', error);
  }
};

const acceptOrder = async (orderId) => {
  try {
    const response = await orderService.driverAcceptOrder(orderId);
    myActiveDeliveries.value.push(response.data); 
    await fetchOrders(); 
    alert('Order diterima! 🚀');
  } catch (error) {
    alert('Gagal menerima order: ' + (error.response?.data?.error || error.message));
  }
};

const completeOrder = async (orderId) => {
  try {
    await orderService.driverCompleteOrder(orderId);
    myActiveDeliveries.value = myActiveDeliveries.value.filter(o => o.id !== orderId);
    await fetchDriverData(); // Refresh stats
    await fetchHistory(); // Refresh history
    alert('Order selesai! 🎉');
  } catch (error) {
    alert('Gagal menyelesaikan order');
  }
};

const openMap = (address) => {
  const encoded = encodeURIComponent(address);
  window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
};
</script>

<template>
  <div class="driver-app">
    <!-- Navbar / Header -->
    <header class="app-header">
      <div class="user-profile">
        <div class="avatar-circle">
          <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" alt="Avatar" />
          <span v-else>🛵</span>
        </div>
        <div class="user-text">
          <span class="greeting">Halo, {{ authStore.user?.name || 'Driver' }}</span>
          <span class="vehicle-info">{{ driverProfile?.vehicle_plate || 'No Plate' }} • Yamaha NMAX</span>
        </div>
      </div>
      <div class="status-switch" @click="toggleStatus" :class="{ 'is-active': isAvailable }">
        <div class="switch-knob"></div>
        <span class="switch-label">{{ isAvailable ? 'ON' : 'OFF' }}</span>
      </div>
    </header>

    <!-- Earnings Summary Card -->
    <div class="earnings-card">
      <div class="earnings-row">
        <div class="earning-item">
          <span class="label">Dompet Tunai</span>
          <span class="value">{{ formatCurrency(stats.totalEarnings) }}</span>
        </div>
        <div class="earning-item right-border">
          <span class="label">Insentif</span>
          <span class="value">Rp 0</span>
        </div>
      </div>
      <div class="performance-row">
        <div class="perf-item" @click="showHistory = !showHistory" style="cursor: pointer;">
          <span class="perf-val">{{ stats.totalDeliveries }}</span>
          <span class="perf-label">Order Selesai (Klik)</span>
        </div>
        <div class="perf-item">
          <span class="perf-val">100%</span>
          <span class="perf-label">Penerimaan</span>
        </div>
        <div class="perf-item">
          <span class="perf-val">5.0</span>
          <span class="perf-label">Bintang</span>
        </div>
      </div>
    </div>

    <!-- History View -->
    <div v-if="showHistory" class="history-section">
      <div class="section-header">
        <h3 class="section-title">Riwayat Pengiriman</h3>
        <button class="close-btn" @click="showHistory = false">Tutup</button>
      </div>
      
      <div v-if="historyOrders.length === 0" class="empty-history">
        <p>Belum ada riwayat pengiriman.</p>
      </div>

      <div v-else class="history-list">
        <div v-for="order in historyOrders" :key="order.id" class="history-card">
          <div class="history-header">
            <span class="date">{{ new Date(order.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</span>
            <span class="amount">+ {{ formatCurrency(12000) }}</span>
          </div>
          <div class="history-route">
            <div class="point">
              <span class="dot pickup"></span> {{ order.Restaurant?.name }}
            </div>
            <div class="point">
              <span class="dot dropoff"></span> {{ order.Customer?.name }}
            </div>
          </div>
          <div class="status-badge">Selesai</div>
        </div>
      </div>
    </div>

    <!-- Active Delivery View (Prioritized) -->
    <div v-else-if="myActiveDeliveries.length > 0" class="active-job-container">
      <div v-for="order in myActiveDeliveries" :key="order.id" class="job-card active-job">
        <div class="job-header">
          <span class="badge-otw">SEDANG DIANTAR</span>
          <span class="order-ref">Order {{ order.id }}</span>
        </div>
        
        <div class="job-route">
          <div class="route-step">
            <div class="step-icon pickup-icon">🏪</div>
            <div class="step-content">
              <h4>{{ order.Restaurant?.name }}</h4>
              <p>{{ order.Restaurant?.address }}</p>
            </div>
          </div>
          <div class="route-line"></div>
          <div class="route-step">
            <div class="step-icon drop-icon">📍</div>
            <div class="step-content">
              <h4>{{ order.Customer?.name }}</h4>
              <p>{{ order.delivery_address }}</p>
            </div>
          </div>
        </div>

        <div class="job-actions">
          <div class="action-row">
            <button class="btn-secondary" @click="openMap(order.Restaurant?.address)">
              🗺️ Navigasi Resto
            </button>
            <button class="btn-secondary" @click="openMap(order.delivery_address)">
              🗺️ Navigasi Tujuan
            </button>
          </div>
          <button @click="completeOrder(order.id)" class="btn-primary-large">
            Selesaikan Pengantaran
          </button>
        </div>
      </div>
    </div>

    <!-- Incoming Orders List -->
    <div v-else class="orders-feed">
      <h3 class="section-title">Order Masuk</h3>
      
      <div v-if="!isAvailable" class="offline-state">
        <div class="offline-icon">😴</div>
        <h3>Anda sedang Offline</h3>
        <p>Aktifkan tombol di atas untuk mulai menerima order.</p>
      </div>

      <div v-else-if="orderStore.activeOrders.length === 0" class="empty-state">
        <div class="radar-animation">
          <div class="radar-circle"></div>
          <div class="radar-circle delay-1"></div>
        </div>
        <p>Mencari order di sekitarmu...</p>
      </div>

      <div v-else class="order-list">
        <div v-for="order in orderStore.activeOrders" :key="order.id" class="job-card incoming-job">
          <div class="job-header-incoming">
            <div class="service-type">
              <span class="icon">🍔</span>
              <span>Food Delivery</span>
            </div>
            <div class="fare-estimate">
              {{ formatCurrency(12000) }} <!-- Mock delivery fee earnings -->
            </div>
          </div>

          <div class="job-route-preview">
            <div class="preview-rest">
              <h4>{{ order.Restaurant?.name }}</h4>
              <span class="dist-badge">2.4 km dari Anda</span>
            </div>
            <div class="preview-dest">
              <span class="arrow">⬇️</span>
              <p>Diantar ke: <strong>{{ order.delivery_address }}</strong></p>
            </div>
          </div>

          <div class="incoming-actions">
            <button class="btn-decline">Abaikan</button>
            <button @click="acceptOrder(order.id)" class="btn-accept-large">
              Terima Order
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Nav -->
    <nav class="bottom-nav">
      <a href="#" class="nav-item active">
        <span class="icon">🏠</span>
        <span>Beranda</span>
      </a>
      <a href="#" class="nav-item">
        <span class="icon">💰</span>
        <span>Pendapatan</span>
      </a>
      <a href="#" class="nav-item">
        <span class="icon">👤</span>
        <span>Profil</span>
      </a>
    </nav>
  </div>
</template>

<style scoped>
.driver-app {
  background-color: #f0f2f5;
  min-height: 100vh;
  padding-bottom: 80px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 1200px; 
  margin: 0 auto;
  box-shadow: none;
}

/* Header */
.app-header {
  background: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  background: #eee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  overflow: hidden;
}

.user-text {
  display: flex;
  flex-direction: column;
}

.greeting {
  font-weight: 700;
  font-size: 1rem;
  color: #333;
}

.vehicle-info {
  font-size: 0.75rem;
  color: #777;
}

/* Toggle Switch */
.status-switch {
  width: 60px;
  height: 32px;
  background: #e0e0e0;
  border-radius: 16px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}

.status-switch.is-active {
  background: #28a745;
}

.switch-knob {
  width: 26px;
  height: 26px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.status-switch.is-active .switch-knob {
  transform: translateX(28px);
}

.switch-label {
  position: absolute;
  font-size: 10px;
  font-weight: bold;
  color: white;
  top: 9px;
  left: 35px;
}

.status-switch.is-active .switch-label {
  left: 8px;
}

/* Earnings Card */
.earnings-card {
  background: linear-gradient(135deg, #00B14F 0%, #009E46 100%); /* Grab green-ish */
  color: white;
  margin: 15px 20px;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0,158,70,0.3);
}

.earnings-row {
  display: flex;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.earning-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.earning-item.right-border {
  border-left: 1px solid rgba(255,255,255,0.2);
  padding-left: 20px;
}

.earning-item .label {
  font-size: 0.8rem;
  opacity: 0.9;
  margin-bottom: 5px;
}

.earning-item .value {
  font-size: 1.2rem;
  font-weight: 700;
}

.performance-row {
  display: flex;
  justify-content: space-between;
}

.perf-item {
  text-align: center;
}

.perf-val {
  display: block;
  font-weight: 700;
  font-size: 1rem;
}

.perf-label {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* Job Cards */
.active-job-container, .orders-feed {
  padding: 0 20px;
}

.section-title {
  font-size: 1rem;
  color: #555;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
}

.job-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* Active Job Styles */
.active-job {
  border-left: 5px solid #00B14F;
}

.job-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.badge-otw {
  background: #e8f5e9;
  color: #00B14F;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.order-ref {
  color: #777;
  font-size: 0.9rem;
}

.route-step {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  position: relative;
}

.step-icon {
  width: 30px;
  height: 30px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  z-index: 1;
}

.route-line {
  position: absolute;
  left: 14px;
  top: 30px;
  height: 40px; /* Approximate */
  width: 2px;
  background: #eee;
  z-index: 0;
}

.step-content h4 {
  margin: 0 0 5px;
  font-size: 1rem;
}

.step-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.job-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.action-row {
  display: flex;
  gap: 10px;
}

.btn-secondary {
  flex: 1;
  background: #f0f2f5;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
}

.btn-primary-large {
  width: 100%;
  background: #00B14F;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 5px;
}

/* Incoming Job Styles */
.incoming-job {
  border: 1px solid #eee;
  transition: transform 0.2s;
}

.incoming-job:active {
  transform: scale(0.98);
}

.job-header-incoming {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.service-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #333;
}

.fare-estimate {
  font-weight: 800;
  font-size: 1.2rem;
  color: #333;
}

.preview-rest {
  margin-bottom: 15px;
}

.preview-rest h4 {
  margin: 0 0 5px;
  font-size: 1.1rem;
}

.dist-badge {
  background: #e3f2fd;
  color: #1976d2;
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.preview-dest {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.preview-dest p {
  margin: 0;
  color: #555;
  font-size: 0.95rem;
}

.incoming-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-decline {
  background: white;
  border: 1px solid #ddd;
  color: #777;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
}

.btn-accept-large {
  flex: 1;
  background: #00B14F;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 25px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,177,79,0.3);
}

/* Empty/Offline States */
.offline-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #888;
}

.offline-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.radar-animation {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 20px;
}

.radar-circle {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  border-radius: 50%;
  background: rgba(0, 177, 79, 0.2);
  animation: radar-ping 2s infinite;
}

.delay-1 {
  animation-delay: 1s;
}

@keyframes radar-ping {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

/* History Styles */
.history-section {
  padding: 0 20px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.close-btn {
  background: none;
  border: none;
  color: #00B14F;
  font-weight: 600;
  cursor: pointer;
}

.history-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 1px solid #eee;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.date { color: #777; }
.amount { color: #00B14F; font-weight: 700; }

.history-route {
  margin-bottom: 10px;
}

.point {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot.pickup { background: #00B14F; }
.dot.dropoff { background: #f44336; }

.status-badge {
  display: inline-block;
  background: #e8f5e9;
  color: #00B14F;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.empty-history {
  text-align: center;
  color: #999;
  padding: 20px;
}

/* Bottom Nav */
.bottom-nav {
  display: none; /* Hide mobile nav for web app look */
}

/* Job Cards Grid for Web App */
.orders-feed .order-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.job-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.incoming-actions {
  margin-top: auto;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #999;
  font-size: 0.75rem;
}

.nav-item.active {
  color: #00B14F;
}

.nav-item .icon {
  font-size: 1.4rem;
  margin-bottom: 4px;
}
</style>
