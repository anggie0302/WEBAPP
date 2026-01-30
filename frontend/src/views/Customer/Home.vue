<script setup>
import { onMounted, ref } from 'vue';
import customerService from '@/services/customerService';
import RestaurantCard from '@/components/Customer/RestaurantCard.vue';
import HeroBanner from '@/components/Common/HeroBanner.vue';

const restaurants = ref([]);
const filteredRestaurants = ref([]);
const promos = ref([]); // Add promo state
const loading = ref(true);
const categories = [
  { id: 1, name: 'Diskon', icon: '🏷️' },
  { id: 2, name: 'Fastfood', icon: '🍟' },
  { id: 3, name: 'Terlaris', icon: '⭐' },
  { id: 4, name: 'Sehat', icon: '🥗' },
  { id: 5, name: 'Minuman', icon: '🥤' },
  { id: 6, name: 'Jajanan', icon: '🍡' },
  { id: 7, name: 'Roti', icon: '🍞' },
  { id: 8, name: 'Semua', icon: '🍽️' },
];

onMounted(async () => {
  try {
    const [restoRes, promoRes] = await Promise.all([
      customerService.getRestaurants(),
      customerService.getAvailablePromos()
    ]);
    
    restaurants.value = restoRes.data;
    filteredRestaurants.value = restoRes.data;
    promos.value = promoRes.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});

const revealPromo = (id, code) => {
  const ticket = document.getElementById(`ticket-${id}`);
  if (ticket) {
    if (ticket.classList.contains('revealed')) {
        // If already revealed, close it back
        ticket.classList.remove('revealed');
    } else {
        // If closed, reveal it and copy
        ticket.classList.add('revealed');
        setTimeout(() => {
            navigator.clipboard.writeText(code).then(() => {
                // Optional: Toast message
            });
        }, 300);
    }
  }
};

const filterByCategory = (category) => {
  if (category === 'Semua') {
    filteredRestaurants.value = restaurants.value;
  } else if (category === 'Diskon') {
    // Show restaurants that have promo menu items (mock logic: check rating or name for now if backend doesn't support 'has_promo' fully yet, but we can assume seeded data)
    // Or better, filter by rating > 4.5 as "Best Deal" proxy if promo not clear
    // Let's filter by restaurants that have at least one menu item with category 'Diskon' if exists, or just high rating for now as placeholder
    // Actually, let's filter by rating > 4.5 for 'Terlaris' and maybe some ID logic for Diskon
    filteredRestaurants.value = restaurants.value.filter(r => r.rating >= 4.5); 
  } else if (category === 'Fastfood') {
    filteredRestaurants.value = restaurants.value.filter(r => 
      r.MenuItems?.some(m => m.category === 'Fast Food' || m.category === 'Bento')
    );
  } else if (category === 'Terlaris') {
    filteredRestaurants.value = restaurants.value.filter(r => r.rating >= 4.6);
  } else if (category === 'Sehat') {
    filteredRestaurants.value = restaurants.value.filter(r => 
      r.MenuItems?.some(m => m.category === 'Salad' || m.category === 'Vegetarian' || m.is_vegetarian)
    );
  } else if (category === 'Minuman') {
    filteredRestaurants.value = restaurants.value.filter(r => 
      r.MenuItems?.some(m => m.category === 'Beverage' || m.category === 'Coffee' || m.category === 'Non Coffee' || m.category === 'Signature')
    );
  } else if (category === 'Jajanan') {
    filteredRestaurants.value = restaurants.value.filter(r => 
      r.MenuItems?.some(m => m.category === 'Snack' || m.category === 'Dessert' || m.category === 'Donut' || m.category === 'Muffin' || m.category === 'Cookies' || m.category === 'Dessert Cup')
    );
  } else if (category === 'Roti') {
    filteredRestaurants.value = restaurants.value.filter(r => 
      r.MenuItems?.some(m => m.category === 'Bread' || m.category === 'Cake' || m.category === 'Pastry' || m.category === 'Cake Slice')
    );
  } else {
    filteredRestaurants.value = restaurants.value;
  }
};
</script>

<template>
  <div class="home-page">
    <HeroBanner />

    <div class="container main-content">
      <!-- Categories Section -->
      <section class="categories-wrapper">
        <div class="category-grid">
          <div 
            v-for="cat in categories" 
            :key="cat.id" 
            class="category-card"
            @click="filterByCategory(cat.name)"
          >
            <div class="cat-icon-circle">{{ cat.icon }}</div>
            <span class="cat-label">{{ cat.name }}</span>
          </div>
        </div>
      </section>

      <!-- Promo Banner Section -->
      <section v-if="promos.length > 0" class="promo-section">
        <div class="section-header">
          <h2>Promo Spesial Hari Ini</h2>
        </div>
        <div class="promo-scroller">
          <div 
            v-for="promo in promos" 
            :key="promo.id" 
            :id="`ticket-${promo.id}`"
            class="promo-ticket" 
            @click="revealPromo(promo.id, promo.code)"
          >
            <!-- Cover Layer -->
            <div class="ticket-cover">
              <div class="cover-content">
                <span class="cover-value">
                   {{ promo.discount_type === 'percent' ? `${promo.discount_value}%` : `Rp ${promo.discount_value/1000}rb` }}
                </span>
                <span class="cover-label">OFF</span>
              </div>
            </div>

            <!-- Actual Ticket Content (Revealed) -->
            <div class="ticket-left">
              <div class="promo-value">
                {{ promo.discount_type === 'percent' ? `${promo.discount_value}%` : `Rp ${promo.discount_value/1000}rb` }}
              </div>
              <div class="promo-label">OFF</div>
            </div>
            <div class="ticket-right">
              <div class="promo-code">{{ promo.code }}</div>
              <div class="promo-desc">{{ promo.description }}</div>
              <div class="promo-expiry">Min. Order Rp {{ promo.min_order/1000 }}rb</div>
            </div>
            <div class="ticket-dots"></div>
          </div>
        </div>
      </section>

      <!-- Section Title -->
      <div class="section-header">
        <div>
          <h2>Rekomendasi Restoran di Sekitarmu</h2>
          <p class="subtitle">Pilihan terbaik untukmu hari ini</p>
        </div>
        <button class="btn-link">Lihat Semua ›</button>
      </div>

      <!-- Restaurant Grid -->
      <div class="restaurant-grid-layout">
        <RestaurantCard 
          v-for="restaurant in filteredRestaurants" 
          :key="restaurant.id" 
          :restaurant="restaurant" 
        />
        <!-- Empty State -->
        <div v-if="filteredRestaurants.length === 0" class="empty-state">
          Tidak ada restoran yang sesuai dengan kategori ini.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  background-color: #f9f9f9;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-content {
  margin-top: -60px; /* Overlap with Hero Banner */
  position: relative;
  z-index: 10;
  padding-bottom: 40px;
}

/* Promo Section */
.promo-section {
  margin-bottom: 30px;
}

.promo-scroller {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
  scrollbar-width: none; /* Hide scrollbar Firefox */
}

.promo-scroller::-webkit-scrollbar {
  display: none; /* Hide scrollbar Chrome */
}

.promo-ticket {
  display: flex;
  background: white;
  border-radius: 12px;
  min-width: 280px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
  border: 1px solid #eee;
  transition: transform 0.2s;
  cursor: pointer;
}

/* Cover Layer Animation */
.ticket-cover {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #F53D2D, #FF6B55);
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  transform-origin: left;
}

.promo-ticket.revealed .ticket-cover {
  transform: translateX(100%); /* Slide out to right */
}

.cover-content {
  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cover-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}

.cover-label {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.click-hint {
  font-size: 0.75rem;
  opacity: 0.8;
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 10px;
}

.promo-ticket:hover {
  transform: translateY(-3px);
}

.ticket-left {
  background: linear-gradient(135deg, #F53D2D, #FF6B55);
  color: white;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  border-right: 2px dashed rgba(255,255,255,0.5);
}

.promo-value {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
}

.promo-label {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.9;
}

.ticket-right {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.promo-code {
  font-weight: 800;
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-icon {
  font-size: 0.9rem;
  opacity: 0.6;
}

.promo-desc {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 6px;
  line-height: 1.3;
}

.promo-expiry {
  font-size: 0.75rem;
  color: #999;
}

/* Categories */
.categories-wrapper {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  margin-bottom: 40px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 20px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.category-card:hover {
  transform: translateY(-5px);
}

.cat-icon-circle {
  width: 60px;
  height: 60px;
  background: #FFF5F4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin-bottom: 10px;
  border: 1px solid #FFEBE9;
  transition: background 0.2s;
}

.category-card:hover .cat-icon-circle {
  background: #FFEBE9;
}

.cat-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  text-align: center;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 25px;
}

h2 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #333;
  margin: 0 0 5px;
}

.subtitle {
  color: #777;
  margin: 0;
  font-size: 1rem;
}

.btn-link {
  font-weight: 700;
  color: #F53D2D;
  font-size: 1rem;
}

/* Responsive Grid */
.restaurant-grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

/* Mobile Responsive */
@media (max-width: 992px) {
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-top: 0;
    padding-top: 20px;
  }

  .categories-wrapper {
    padding: 20px;
    border-radius: 0;
    margin: -20px -20px 30px; /* Full width on mobile */
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

  .category-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
  }
  
  .cat-icon-circle {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  h2 {
    font-size: 1.4rem;
  }
  
  .restaurant-grid-layout {
    grid-template-columns: repeat(2, 1fr); /* 2 columns on mobile */
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .restaurant-grid-layout {
    grid-template-columns: 1fr; /* 1 column on small mobile */
  }
}

.loading-state, .empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
</style>
