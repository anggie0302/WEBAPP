<script setup>
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import orderService from '@/services/orderService';
import customerService from '@/services/customerService';
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

const paymentMethod = ref('gopay');
const promoCode = ref('');
const discountAmount = ref(0);
const appliedPromo = ref(null);
const isProcessing = ref(false);
const promoError = ref('');
const isCheckingPromo = ref(false);

// Address Management
const isEditingAddress = ref(false);
const deliveryAddress = ref('Jl. Jendral Sudirman No. 1, Jakarta Pusat');
const deliveryNote = ref('Pagar hitam, bel 2x.');
const tempAddress = ref('');
const tempNote = ref('');

const openAddressModal = () => {
  tempAddress.value = deliveryAddress.value;
  tempNote.value = deliveryNote.value;
  isEditingAddress.value = true;
};

const saveAddress = () => {
  if (!tempAddress.value.trim()) {
    alert('Alamat tidak boleh kosong');
    return;
  }
  deliveryAddress.value = tempAddress.value;
  deliveryNote.value = tempNote.value;
  isEditingAddress.value = false;
};

// Payment Methods
const paymentMethods = [
  { id: 'gopay', name: 'GoPay', icon: '💳', balance: 500000000 },
  { id: 'ovo', name: 'OVO', icon: '🟣', balance: 150000000 },
  { id: 'dana', name: 'DANA', icon: '🔵', balance: 25000000 },
  { id: 'cash', name: 'Tunai (COD)', icon: '💵', balance: null },
];

const formatCurrency = (val) => {
  if (val === null) return '';
  return 'Rp ' + val.toLocaleString('id-ID');
};

const subtotal = computed(() => cartStore.totalPrice);
const deliveryFee = 10000;
const serviceFee = 2000;
const total = computed(() => {
  const t = subtotal.value + deliveryFee + serviceFee - discountAmount.value;
  return t > 0 ? t : 0;
});

// Check Promo
const checkPromo = async () => {
  if (!promoCode.value.trim()) return;
  
  isCheckingPromo.value = true;
  promoError.value = '';
  discountAmount.value = 0;
  appliedPromo.value = null;

  try {
    const res = await customerService.validatePromo({
      code: promoCode.value,
      restaurant_id: cartStore.restaurantId,
      total_amount: subtotal.value
    });

    if (res.data.valid) {
      discountAmount.value = res.data.discount_amount;
      appliedPromo.value = res.data.promo_code;
      // alert(res.data.message);
    }
  } catch (error) {
    promoError.value = error.response?.data?.message || 'Kode promo tidak valid';
  } finally {
    isCheckingPromo.value = false;
  }
};

// Check if selected payment method has enough balance
const hasEnoughBalance = computed(() => {
  const method = paymentMethods.find(m => m.id === paymentMethod.value);
  if (!method || method.balance === null) return true; // COD is always valid
  return method.balance >= total.value;
});

const placeOrder = async () => {
  if (cartStore.items.length === 0) return;
  
  if (!hasEnoughBalance.value) {
    alert('Saldo tidak mencukupi untuk metode pembayaran yang dipilih.');
    return;
  }
  
  isProcessing.value = true;
  try {
    const orderData = {
      restaurant_id: cartStore.restaurantId,
      items: cartStore.items,
      delivery_address: deliveryAddress.value + (deliveryNote.value ? ` (${deliveryNote.value})` : ''),
      total_amount: total.value,
      payment_method: paymentMethod.value,
      promo_code: promoCode.value || null
    };

    const response = await orderService.createOrder(orderData);
    cartStore.clearCart();
    
    // Simulate payment processing delay
    setTimeout(() => {
      alert('Pembayaran Berhasil! Pesanan sedang diproses.');
      router.push('/'); // Redirect to home/orders
    }, 1500);
    
  } catch (error) {
    alert('Gagal membuat pesanan: ' + (error.response?.data?.error || error.message));
    isProcessing.value = false;
  }
};
</script>

<template>
  <div class="checkout-page">
    <div class="container">
      <h1 class="page-title">Konfirmasi Pembayaran</h1>

      <div v-if="cartStore.items.length === 0" class="empty-state">
        <h2>Pesanan Dibuat!</h2>
        <p>Terima kasih sudah memesan. Makananmu akan segera diproses.</p>
        <div class="action-buttons">
          <router-link to="/orders" class="btn-home">Lihat Pesanan Saya</router-link>
          <router-link to="/" class="btn-secondary">Pesan Lagi</router-link>
        </div>
      </div>

      <div v-else class="checkout-layout">
        <div class="main-section">
          <!-- Delivery Address -->
          <div class="section-card address-card">
            <div class="card-header">
              <h3>📍 Alamat Pengiriman</h3>
              <button @click="openAddressModal" class="btn-edit">Ubah</button>
            </div>
            <div class="card-body">
              <p class="address-name"><strong>Rumah</strong> ({{ authStore.user?.name }})</p>
              <p class="address-text">{{ deliveryAddress }}</p>
              <p class="address-note" v-if="deliveryNote">Catatan: {{ deliveryNote }}</p>
            </div>
          </div>

          <!-- Edit Address Modal -->
          <div v-if="isEditingAddress" class="modal-overlay">
            <div class="modal-content">
              <h3>Ubah Alamat Pengiriman</h3>
              <div class="form-group">
                <label>Alamat Lengkap</label>
                <textarea v-model="tempAddress" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label>Catatan untuk Driver (Opsional)</label>
                <input v-model="tempNote" type="text" placeholder="Contoh: Pagar hitam, bel 2x" />
              </div>
              <div class="modal-actions">
                <button @click="isEditingAddress = false" class="btn-cancel">Batal</button>
                <button @click="saveAddress" class="btn-save">Simpan</button>
              </div>
            </div>
          </div>

          <!-- Order Summary (Items) -->
          <div class="section-card items-card">
            <h3>📝 Ringkasan Pesanan</h3>
            <div class="restaurant-info">
              <span class="resto-icon">🏪</span>
              <strong>{{ cartStore.restaurantName }}</strong>
            </div>
            <div class="item-list">
              <div v-for="item in cartStore.items" :key="item.id" class="checkout-item">
                <div class="item-qty">{{ item.quantity }}x</div>
                <div class="item-details">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-price">{{ formatCurrency(item.price * item.quantity) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="section-card payment-card">
            <h3>💳 Metode Pembayaran</h3>
            <div class="payment-options">
              <div 
                v-for="method in paymentMethods" 
                :key="method.id"
                class="payment-option"
                :class="{ 
                  active: paymentMethod === method.id,
                  disabled: method.balance !== null && method.balance < total
                }"
                @click="paymentMethod = method.id"
              >
                <div class="method-info">
                  <span class="method-icon">{{ method.icon }}</span>
                  <div class="method-details">
                    <span class="method-name">{{ method.name }}</span>
                    <div v-if="method.balance !== null" class="balance-info">
                      <span class="method-balance">{{ formatCurrency(method.balance) }}</span>
                      <span v-if="method.balance < total" class="insufficient-balance">(Saldo Kurang)</span>
                    </div>
                  </div>
                </div>
                <div class="radio-circle"></div>
              </div>
            </div>
          </div>

          <!-- Promo Code Section -->
          <div class="section-card promo-card">
            <h3>🎟️ Kode Promo</h3>
            <div class="promo-input-group">
              <input 
                v-model="promoCode" 
                type="text" 
                placeholder="Masukkan kode promo" 
                :disabled="appliedPromo"
                @keyup.enter="checkPromo"
              >
              <button 
                v-if="!appliedPromo" 
                @click="checkPromo" 
                class="btn-apply"
                :disabled="!promoCode || isCheckingPromo"
              >
                {{ isCheckingPromo ? '...' : 'Pakai' }}
              </button>
              <button v-else @click="appliedPromo = null; discountAmount = 0; promoCode = ''" class="btn-remove">
                Hapus
              </button>
            </div>
            <p v-if="promoError" class="promo-msg error">{{ promoError }}</p>
            <p v-if="appliedPromo" class="promo-msg success">Promo berhasil digunakan! Hemat {{ formatCurrency(discountAmount) }}</p>
          </div>
        </div>

        <!-- Summary & Pay Button (Sidebar) -->
        <div class="sidebar-section">
          <div class="summary-card">
            <h3>Rincian Pembayaran</h3>
            <div class="summary-row">
              <span>Harga ({{ cartStore.items.length }} item)</span>
              <span>{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="summary-row">
              <span>Ongkos Kirim</span>
              <span>{{ formatCurrency(deliveryFee) }}</span>
            </div>
            <div class="summary-row">
              <span>Biaya Layanan</span>
              <span>{{ formatCurrency(serviceFee) }}</span>
            </div>
            <hr>
            <div class="summary-row total-row">
              <span>Total Pembayaran</span>
              <span class="total-price">{{ formatCurrency(total) }}</span>
            </div>

            <button @click="placeOrder" :disabled="isProcessing || !hasEnoughBalance" class="btn-pay">
              {{ isProcessing ? 'Memproses...' : (hasEnoughBalance ? 'Bayar Sekarang' : 'Saldo Tidak Cukup') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 50px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  max-width: 600px;
  margin: 50px auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #ddd;
}

.empty-state h2 {
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  color: #777;
  margin-bottom: 30px;
}

.btn-home {
  display: inline-block;
  background: #F53D2D;
  color: white;
  padding: 12px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
  transition: background 0.2s;
}

.btn-home:hover {
  background: #d7321f;
}

.checkout-page {
  background-color: #f9f9f9;
  min-height: 100vh;
  padding: 100px 0 60px; /* Adjusted for fixed header */
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 30px;
  color: #333;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section-card h3 {
  margin: 0 0 15px;
  font-size: 1.1rem;
  color: #333;
}

/* Address */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.btn-edit {
  color: #F53D2D;
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.address-name { font-size: 1rem; margin-bottom: 5px; }
.address-text { color: #555; margin-bottom: 5px; }
.address-note { font-size: 0.9rem; color: #888; }

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 25px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-group textarea, .form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  box-sizing: border-box;
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
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-save {
  background: #F53D2D;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

/* Items */
.restaurant-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.checkout-item {
  display: flex;
  gap: 15px;
  margin-bottom: 12px;
}

.item-qty {
  font-weight: 600;
  color: #F53D2D;
  width: 30px;
}

.item-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.item-name { color: #333; }
.item-price { font-weight: 600; }

/* Payment Options */
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option:hover {
  background-color: #fdfdfd;
  border-color: #ddd;
}

.payment-option.active {
  border-color: #F53D2D;
  background-color: #FFF5F4;
}

.payment-option.disabled {
  opacity: 0.6;
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.method-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.method-icon { font-size: 1.5rem; }

.method-details {
  display: flex;
  flex-direction: column;
}

.method-name { font-weight: 600; color: #333; }
.balance-info { display: flex; gap: 8px; align-items: center; }
.method-balance { font-size: 0.85rem; color: #777; }
.insufficient-balance { font-size: 0.75rem; color: #F53D2D; font-weight: 600; }

.radio-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ccc;
  position: relative;
}

.payment-option.active .radio-circle {
  border-color: #F53D2D;
}

.payment-option.active .radio-circle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: #F53D2D;
  border-radius: 50%;
}

/* Sidebar Summary */
.summary-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  position: sticky;
  top: 100px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.95rem;
  color: #555;
}

.total-row {
  margin-top: 15px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

.total-price {
  color: #F53D2D;
  font-size: 1.3rem;
}

.btn-pay {
  width: 100%;
  background: #F53D2D;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.1rem;
  margin-top: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-pay:hover {
  background: #d7321f;
}

.btn-pay:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  max-width: 600px;
  margin: 50px auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #ddd;
}

.empty-state h2 {
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  color: #777;
  margin-bottom: 30px;
}

.btn-home {
  display: inline-block;
  background: #F53D2D;
  color: white;
  padding: 12px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
  transition: background 0.2s;
}

.btn-home:hover {
  background: #d7321f;
}

/* Promo Code */
.promo-input-group {
  display: flex;
  gap: 10px;
}

.promo-input-group input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.btn-apply {
  background: #007bff;
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-remove {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.promo-msg {
  font-size: 0.9rem;
  margin-top: 10px;
}

.promo-msg.error { color: #dc3545; }
.promo-msg.success { color: #28a745; }
</style>
