<script setup>
import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { formatCurrency } from '@/utils/currency';

const cartStore = useCartStore();
const router = useRouter();
const promoCode = ref('');

const goToCheckout = () => {
  if (cartStore.items.length === 0) return;
  router.push('/checkout');
};
</script>

<template>
  <div class="cart-container card">
    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <div class="empty-icon">🛒</div>
      <h3>Keranjang Kosong</h3>
      <p>Perut lapar? Yuk, cari makanan enak!</p>
      <router-link to="/" class="btn-primary w-100 mt-2">Cari Makanan</router-link>
    </div>

    <div v-else>
      <h3>Keranjang Anda</h3>
      <div class="restaurant-name">Dari: {{ cartStore.restaurantName }}</div>
      
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <div class="item-info">
            <span>{{ item.quantity }}x {{ item.name }}</span>
            <span>{{ formatCurrency(item.price * item.quantity) }}</span>
          </div>
          <div class="item-controls">
            <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)">-</button>
            <button @click="cartStore.updateQuantity(item.id, item.quantity + 1)">+</button>
          </div>
        </div>
      </div>

      <div class="promo-section">
        <input v-model="promoCode" placeholder="Kode Promo (Opsional)" class="promo-input" />
      </div>

      <div class="cart-total">
        <strong>Total: {{ formatCurrency(cartStore.totalPrice) }}</strong>
      </div>

      <button @click="goToCheckout" class="btn-primary w-100 mt-2">Checkout</button>
    </div>
  </div>
</template>

<style scoped>
.empty-cart {
  text-align: center;
  padding: 20px 0;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 10px;
  color: #ddd;
}

.empty-cart h3 {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 5px;
}

.empty-cart p {
  color: #777;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.cart-container {
  position: sticky;
  top: 90px;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

h3 {
  margin-top: 0;
  font-size: 1.2rem;
  color: #333;
}

.restaurant-name {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}
.cart-item {
  margin-bottom: 10px;
  border-bottom: 1px dashed #eee;
  padding-bottom: 5px;
}
.item-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.9rem;
}
.item-controls button {
  padding: 2px 8px;
  margin-right: 5px;
  background: #eee;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.item-controls button:hover {
  background: #ddd;
}

.cart-total {
  margin-top: 15px;
  text-align: right;
  font-size: 1.1rem;
  color: #F53D2D;
}
.w-100 { width: 100%; }

.promo-section {
  margin-top: 10px;
  margin-bottom: 5px;
}

.promo-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.btn-primary {
  background-color: #F53D2D;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-block;
  text-decoration: none;
  text-align: center;
}

.btn-primary:hover {
  background-color: #d7321f;
}
</style>
