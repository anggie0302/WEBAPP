<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useOrderStore } from '@/stores/orderStore';
import orderService from '@/services/orderService';
import restaurantService from '@/services/restaurantService';
import io from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

const orderStore = useOrderStore();
const authStore = useAuthStore();
const socket = ref(null);
const activeTab = ref('orders'); // orders, menu, report
const isOpen = ref(true);
const stats = ref({ totalEarnings: 0, totalOrders: 0 });

const menuItems = ref([]);
const showAddModal = ref(false);
const isEditing = ref(false);
const menuForm = ref({
  id: null,
  name: '',
  description: '',
  price: 0,
  stock: 10,
  category: 'Main Course',
  image_url: '',
  discount_price: 0,
  has_discount: false
});

const fetchMenu = async () => {
  try {
    const res = await restaurantService.getMenu();
    menuItems.value = res.data;
  } catch (error) {
    console.error('Failed to fetch menu', error);
  }
};

onMounted(async () => {
  await fetchRestaurantData();
  await fetchMenu();
  await orderStore.fetchRestaurantOrders();

  socket.value = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');
});

// Watch for tab changes to refresh data
import { watch } from 'vue';
watch(activeTab, async (newTab) => {
  if (newTab === 'report') {
    await fetchRestaurantData();
  } else if (newTab === 'orders') {
    await orderStore.fetchRestaurantOrders();
  } else if (newTab === 'menu') {
    await fetchMenu();
  }
});

const toggleStock = async (item) => {
  // Deprecated: Stock is now managed via edit
  console.log('Stock management via edit', item);
};

const adjustStock = async (item, amount) => {
  try {
    const newStock = item.stock + amount;
    if (newStock < 0) return; // Prevent negative stock

    const updated = { ...item, stock: newStock, is_available: newStock > 0 };
    await restaurantService.updateMenu(item.id, updated);
    
    // Update local state immediately
    item.stock = newStock;
    item.is_available = newStock > 0;
  } catch (error) {
    console.error('Failed to update stock', error);
    alert('Gagal update stok');
  }
};

const saveMenu = async () => {
  try {
    if (isEditing.value) {
      await restaurantService.updateMenu(menuForm.value.id, menuForm.value);
    } else {
      await restaurantService.addMenu(menuForm.value);
    }
    await fetchMenu();
    closeModal();
  } catch (error) {
    alert('Gagal menyimpan menu');
  }
};

const editItem = (item) => {
  menuForm.value = { ...item };
  isEditing.value = true;
  showAddModal.value = true;
};

const deleteItem = async (id) => {
  if (!confirm('Hapus menu ini?')) return;
  try {
    await restaurantService.deleteMenu(id);
    await fetchMenu();
  } catch (error) {
    alert('Gagal menghapus menu');
  }
};

const closeModal = () => {
  showAddModal.value = false;
  isEditing.value = false;
  menuForm.value = {
    id: null,
    name: '',
    description: '',
    price: 0,
    stock: 10,
    category: 'Main Course',
    image_url: '',
    discount_price: 0,
    has_discount: false
  };
};

onUnmounted(() => {
  if (socket.value) socket.value.disconnect();
});

const fetchRestaurantData = async () => {
  try {
    const profile = await restaurantService.getProfile();
    isOpen.value = profile.data.is_open;
    const statRes = await restaurantService.getStats();
    stats.value = statRes.data;
  } catch (error) {
    console.error(error);
  }
};

// Removed duplicate definitions of fetchRestaurantData and toggleStoreStatus from bottom of script


const toggleStoreStatus = async () => {
  try {
    const res = await restaurantService.toggleOpen();
    isOpen.value = res.data.is_open;
  } catch (error) {
    console.error(error);
    alert('Gagal mengubah status toko');
  }
};

const updateStatus = async (orderId, status) => {
  try {
    await orderService.updateOrderStatus(orderId, status);
    await orderStore.fetchRestaurantOrders(); 
  } catch (error) {
    alert('Failed to update status');
  }
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
};

const pendingOrders = computed(() => orderStore.orders.filter(o => o.status === 'pending' || o.status === 'confirmed'));
const processOrders = computed(() => orderStore.orders.filter(o => o.status === 'cooking' || o.status === 'ready' || o.status === 'accepted'));
const completedOrders = computed(() => orderStore.orders.filter(o => o.status === 'delivered' || o.status === 'cancelled' || o.status === 'on_the_way'));

</script>

<template>
  <div class="resto-dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="brand">
        <h2>🍽️ Partner</h2>
      </div>
      <nav>
        <a @click="activeTab = 'orders'" :class="{ active: activeTab === 'orders' }">📦 Pesanan</a>
        <a @click="activeTab = 'menu'" :class="{ active: activeTab === 'menu' }">📋 Menu</a>
        <a @click="activeTab = 'report'" :class="{ active: activeTab === 'report' }">📊 Laporan</a>
      </nav>
      <div class="store-status">
        <span>Status Toko:</span>
        <button @click="toggleStoreStatus" :class="isOpen ? 'btn-open' : 'btn-closed'">
          {{ isOpen ? 'BUKA' : 'TUTUP' }}
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="content">
      <!-- Header -->
      <header>
        <h1>{{ authStore.user?.name }}</h1>
        <div class="earnings-badge">
          Pendapatan: {{ formatCurrency(stats.totalEarnings) }}
        </div>
      </header>

      <!-- Orders Tab -->
      <div v-if="activeTab === 'orders'" class="orders-view">
        <div class="kanban-board">
          <!-- Column 1: Baru -->
          <div class="column">
            <h3>🔔 Baru Masuk ({{ pendingOrders.length }})</h3>
            <div v-for="order in pendingOrders" :key="order.id" class="kanban-card new">
              <div class="card-header">
                <span class="id">Order ID: {{ order.id }}</span>
                <span class="time">Just now</span>
              </div>
              <div class="items">
                <div v-for="item in order.OrderItems" :key="item.id">
                   {{ item.quantity }}x {{ item.MenuItem?.name }}
                </div>
              </div>
              <div class="total">{{ formatCurrency(order.total_amount) }}</div>
              <button @click="updateStatus(order.id, 'cooking')" class="btn-action">Terima & Masak</button>
            </div>
          </div>

          <!-- Column 2: Diproses -->
          <div class="column">
            <h3>🍳 Sedang Diproses ({{ processOrders.length }})</h3>
            <div v-for="order in processOrders" :key="order.id" class="kanban-card process">
              <div class="card-header">
                <span class="id">Order ID: {{ order.id }}</span>
                <span class="status-badge">{{ order.status }}</span>
              </div>
              <div class="items">
                <div v-for="item in order.OrderItems" :key="item.id">
                   {{ item.quantity }}x {{ item.MenuItem?.name }}
                </div>
              </div>
              <button v-if="order.status === 'cooking'" @click="updateStatus(order.id, 'ready')" class="btn-action ready">Selesai Masak</button>
              <div v-else class="waiting-driver">Menunggu Driver...</div>
            </div>
          </div>

          <!-- Column 3: Selesai -->
          <div class="column">
            <h3>✅ Riwayat ({{ completedOrders.length }})</h3>
             <div v-for="order in completedOrders" :key="order.id" class="kanban-card done">
              <div class="card-header">
                <span class="id">Order ID: {{ order.id }}</span>
                <span class="status-badge" :class="order.status">{{ order.status }}</span>
              </div>
              <div class="total-compact">{{ formatCurrency(order.total_amount) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu Tab -->
      <div v-if="activeTab === 'menu'" class="menu-view">
        <div class="menu-header">
          <h3>Daftar Menu</h3>
          <button @click="showAddModal = true" class="btn-primary">
            + Tambah Menu
          </button>
        </div>

        <div class="menu-grid">
          <div v-for="item in menuItems" :key="item.id" class="menu-card">
            <img :src="item.image_url || 'https://via.placeholder.com/150'" class="menu-img" alt="Menu Image">
            <div class="menu-details">
              <h4>{{ item.name }}</h4>
              <div v-if="item.has_discount">
                <p class="price original-price">{{ formatCurrency(item.price) }}</p>
                <p class="price discount-price">{{ formatCurrency(item.discount_price) }}</p>
              </div>
              <p v-else class="price">{{ formatCurrency(item.price) }}</p>
              
              <div class="stock-control">
                <div class="stock-adjust">
                  <button @click="adjustStock(item, -1)" class="btn-stock-adj">-</button>
                  <span class="stock-val">{{ item.stock }}</span>
                  <button @click="adjustStock(item, 1)" class="btn-stock-adj">+</button>
                </div>
                <span :class="item.stock > 0 ? 'badge-available' : 'badge-empty'">
                  {{ item.stock > 0 ? 'Tersedia' : 'Habis' }}
                </span>
              </div>

              <div class="menu-actions">
                <button @click="editItem(item)" class="btn-edit">Edit</button>
                <button @click="deleteItem(item.id)" class="btn-delete">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Menu Modal -->
      <div v-if="showAddModal" class="modal-overlay">
        <div class="modal">
          <h3>{{ isEditing ? 'Edit Menu' : 'Tambah Menu' }}</h3>
          <form @submit.prevent="saveMenu">
            <div class="form-group">
              <label>Nama Menu</label>
              <input v-model="menuForm.name" required placeholder="Nasi Goreng...">
            </div>
            <div class="form-group">
              <label>Deskripsi</label>
              <textarea v-model="menuForm.description" placeholder="Deskripsi singkat..."></textarea>
            </div>
            <div class="form-group">
              <label>Harga</label>
              <input type="number" v-model="menuForm.price" required min="0">
            </div>
            
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="menuForm.has_discount">
                Aktifkan Diskon?
              </label>
            </div>

            <div v-if="menuForm.has_discount" class="form-group">
              <label>Harga Diskon</label>
              <input type="number" v-model="menuForm.discount_price" min="0">
              <small style="color: #666;">Harga setelah diskon (harus lebih kecil dari harga asli)</small>
            </div>

            <div class="form-group">
              <label>Stok</label>
              <input type="number" v-model="menuForm.stock" required min="0">
            </div>
            <div class="form-group">
              <label>Kategori</label>
              <select v-model="menuForm.category">
                <option value="Main Course">Makanan Utama</option>
                <option value="Appetizer">Pembuka</option>
                <option value="Dessert">Penutup</option>
                <option value="Beverage">Minuman</option>
              </select>
            </div>
            <div class="form-group">
              <label>URL Gambar</label>
              <input v-model="menuForm.image_url" placeholder="https://...">
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn-cancel">Batal</button>
              <button type="submit" class="btn-save">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Report Tab -->
      <div v-if="activeTab === 'report'" class="report-view">
        <div class="summary-cards">
          <div class="card income-card">
            <div class="card-icon">💰</div>
            <div>
              <h4>Total Penjualan</h4>
              <p class="subtitle">Dari pesanan selesai</p>
              <div class="val">{{ formatCurrency(stats.totalEarnings) }}</div>
            </div>
          </div>
          <div class="card order-card">
             <div class="card-icon">📦</div>
             <div>
              <h4>Total Order Selesai</h4>
              <p class="subtitle">Jumlah pesanan diantar</p>
              <div class="val">{{ stats.totalOrders }}</div>
             </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<style scoped>
.resto-dashboard {
  display: flex;
  min-height: 100vh;
  background-color: #f4f6f8;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding-top: 80px; /* Fix for fixed header overlapping */
}

.sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.brand h2 {
  color: #F53D2D;
  margin-top: 0;
}

.sidebar nav {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar nav a {
  padding: 12px 15px;
  border-radius: 8px;
  cursor: pointer;
  color: #555;
  font-weight: 500;
  transition: all 0.2s;
}

.sidebar nav a:hover {
  background: #fff5f5;
  color: #F53D2D;
}

.sidebar nav a.active {
  background: #F53D2D;
  color: white;
}

.store-status {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-open {
  width: 100%;
  padding: 10px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  margin-top: 5px;
  cursor: pointer;
}

.btn-closed {
  width: 100%;
  padding: 10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  margin-top: 5px;
  cursor: pointer;
}

.content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.earnings-badge {
  background: white;
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  font-weight: bold;
  color: #28a745;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.column h3 {
  font-size: 1rem;
  color: #777;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.kanban-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  border-left: 4px solid transparent;
}

.kanban-card.new { border-left-color: #007bff; }
.kanban-card.process { border-left-color: #ffc107; }
.kanban-card.done { border-left-color: #28a745; opacity: 0.8; }

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #555;
}

.items {
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.total {
  font-weight: bold;
  margin-bottom: 15px;
}

.btn-action {
  width: 100%;
  padding: 8px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-action.ready {
  background: #ffc107;
  color: #333;
}

.waiting-driver {
  text-align: center;
  color: #28a745;
  font-weight: bold;
  font-size: 0.9rem;
  background: #e8f5e9;
  padding: 5px;
  border-radius: 4px;
}

.status-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  background: #eee;
}

.status-badge.delivered { background: #28a745; color: white; }
.status-badge.on_the_way { background: #17a2b8; color: white; }

.summary-cards {
  display: flex;
  gap: 20px;
}

.summary-cards .card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 250px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 15px;
}

.subtitle {
  font-size: 0.8rem;
  color: #777;
  margin: 0;
}

.summary-cards .val {
  font-size: 1.5rem;
  font-weight: bold;
  color: #F53D2D;
  margin-top: 10px;
}

/* Menu Styles */
.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.report-card {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 250px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.report-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.card-icon {
  font-size: 2.5rem;
  background: #fff5f5;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.income-card .val { color: #28a745; }
.order-card .val { color: #007bff; }

.menu-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: all 0.3s;
  border: 1px solid #eee;
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0,0,0,0.1);
}

.menu-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.menu-details {
  padding: 15px;
}

.menu-details h4 {
  margin: 0 0 5px;
  font-size: 1rem;
}

.price {
  color: #F53D2D;
  font-weight: bold;
  margin-bottom: 10px;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 0;
}

.discount-price {
  color: #F53D2D;
  font-size: 1.1rem;
}

.stock-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 0.9rem;
  background: #f9f9f9;
  padding: 8px;
  border-radius: 8px;
}

.stock-adjust {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 2px;
}

.btn-stock-adj {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  color: #333;
  transition: background 0.2s;
}

.btn-stock-adj:hover {
  background: #e0e0e0;
}

.stock-val {
  min-width: 20px;
  text-align: center;
  font-weight: bold;
}

.badge-available {
  background: #e8f5e9;
  color: #28a745;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8rem;
}

.badge-empty {
  background: #ffebee;
  color: #dc3545;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8rem;
}

.menu-actions {
  display: flex;
  gap: 5px;
}

.btn-edit, .btn-delete {
  flex: 1;
  padding: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit { background: #eee; color: #333; }
.btn-delete { background: #ffebee; color: #dc3545; }

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 25px;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input, .form-group textarea, .form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  background: #eee;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
