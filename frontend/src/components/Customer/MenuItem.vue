<script setup>
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/utils/currency';

const props = defineProps({
  item: Object,
  restaurantId: Number,
  restaurantName: String,
  isRestaurantOpen: {
    type: Boolean,
    default: true
  }
});

const cartStore = useCartStore();

const addToCart = () => {
  if (!props.isRestaurantOpen) return;
  cartStore.addToCart(props.item, props.restaurantId, props.restaurantName);
};
</script>

<template>
  <div class="menu-card" :class="{ 'out-of-stock': !item.is_available }">
    <div class="card-image">
      <!-- Placeholder image if no image provided (assuming backend might not have it yet) -->
      <img 
        :src="item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'" 
        alt="Menu Item" 
        class="food-img"
        @error="$event.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'"
      />
      <div v-if="!isRestaurantOpen" class="stock-overlay">TUTUP</div>
      <div v-else-if="!item.is_available || item.stock <= 0" class="stock-overlay">HABIS</div>
      <button v-else @click="addToCart" class="btn-add">
        <span class="icon">+</span>
      </button>
    </div>
    
    <div class="card-content">
      <div class="header">
        <h4 class="name">{{ item.name }}</h4>
        <span class="price">{{ formatCurrency(item.price) }}</span>
      </div>
      <p class="desc">{{ item.description || 'Makanan lezat yang siap memanjakan lidah Anda.' }}</p>
    </div>
  </div>
</template>

<style scoped>
.menu-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.menu-card.out-of-stock {
  opacity: 0.7;
  pointer-events: none;
}

.stock-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.5rem;
  z-index: 5;
  letter-spacing: 2px;
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0,0,0,0.1);
  border-color: transparent;
}

.card-image {
  position: relative;
  height: 160px;
  background-color: #f9f9f9;
  overflow: hidden;
}

.food-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.menu-card:hover .food-img {
  transform: scale(1.05);
}

.btn-add {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: white;
  color: #F53D2D;
  border: 1px solid #F53D2D;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.2s;
  z-index: 2;
  padding: 0; /* Reset default padding */
  line-height: 0;
}

.btn-add:hover {
  background: #F53D2D;
  color: white;
  transform: scale(1.1);
}

.btn-add:active {
  transform: scale(0.9);
}

.card-content {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 8px;
}

.name {
  margin: 0 0 5px;
  font-size: 1rem;
  font-weight: 700;
  color: #333;
  line-height: 1.3;
}

.price {
  font-weight: 700;
  color: #F53D2D;
  font-size: 0.95rem;
}

.desc {
  font-size: 0.8rem;
  color: #777;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
