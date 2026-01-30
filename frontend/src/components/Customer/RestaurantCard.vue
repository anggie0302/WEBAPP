<script setup>
import { computed } from 'vue';

const props = defineProps({
  restaurant: {
    type: Object,
    required: true
  }
});

const cuisineTags = computed(() => {
  if (!props.restaurant.MenuItems || props.restaurant.MenuItems.length === 0) {
    return 'Fast Food • Snacks'; // Default fallback
  }
  
  // Extract unique categories
  const categories = [...new Set(props.restaurant.MenuItems.map(item => item.category))];
  
  // Prioritize certain categories for display
  const priority = ['Main Course', 'Fast Food', 'Snack', 'Dessert', 'Beverage'];
  
  // Sort based on priority or frequency (simplified here to priority then alphabetical)
  categories.sort((a, b) => {
    const idxA = priority.indexOf(a);
    const idxB = priority.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  // Take top 2-3 categories
  return categories.slice(0, 3).join(' • ');
});
</script>

<template>
  <div class="card restaurant-card">
    <div class="card-image-wrapper">
      <img 
        :src="restaurant.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'" 
        alt="Restaurant" 
        class="card-img" 
        @error="$event.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'"
      />
      
      <div class="overlay">
        <button class="btn-quick-view">Lihat Menu</button>
      </div>

      <div class="badges">
        <span class="badge badge-promo" v-if="restaurant.has_promo || restaurant.rating >= 4.5">% Deals</span>
        <span class="badge badge-star" v-if="restaurant.rating >= 4.5">⭐ Star Resto</span>
      </div>
    </div>
    
    <div class="card-content">
      <h3 class="name">{{ restaurant.name }}</h3>
      <div class="cuisine-type">{{ cuisineTags }}</div>
      
      <div class="meta-info">
        <div class="rating-box">
          <span class="star">★</span>
          <span class="score">{{ restaurant.rating || 'New' }}</span>
        </div>
        <div class="delivery-info">
          <span class="distance">1.2 km</span>
          <span class="separator">•</span>
          <span class="time">20 min</span>
        </div>
      </div>
    </div>
    
    <router-link :to="`/restaurant/${restaurant.id}`" class="stretched-link"></router-link>
  </div>
</template>

<style scoped>
.restaurant-card {
  position: relative;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(0,0,0,0.03);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.restaurant-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}

.card-image-wrapper {
  position: relative;
  padding-top: 60%; /* 16:9 Aspect Ratio */
  overflow: hidden;
  background: #f5f5f5;
}

.card-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.restaurant-card:hover .card-img {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.restaurant-card:hover .overlay {
  opacity: 1;
}

.btn-quick-view {
  background: white;
  color: #333;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.restaurant-card:hover .btn-quick-view {
  transform: translateY(0);
}

.badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 5px;
}

.badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.badge-promo {
  background: #F53D2D;
  color: white;
}

.badge-star {
  background: white;
  color: #333;
}

.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px;
  line-height: 1.4;
}

.cuisine-type {
  font-size: 0.85rem;
  color: #777;
  margin-bottom: 12px;
}

.meta-info {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rating-box {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #FFF8E1;
  padding: 4px 8px;
  border-radius: 6px;
}

.star { color: #FFC107; font-size: 0.9rem; }
.score { font-weight: 700; font-size: 0.85rem; color: #333; }

.delivery-info {
  font-size: 0.85rem;
  color: #555;
  display: flex;
  align-items: center;
}

.separator { margin: 0 5px; color: #ccc; }

.stretched-link {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}
</style>
