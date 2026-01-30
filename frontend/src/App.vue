<script setup>
import Header from '@/components/Common/Header.vue'
import BottomNav from '@/components/Common/BottomNav.vue'
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const authStore = useAuthStore()
const route = useRoute();

const showHeader = computed(() => !['/login', '/register'].includes(route.path));
const showBottomNav = computed(() => {
  // Only show bottom nav on mobile view logic handled by CSS media queries usually, 
  // but here we can keep it simple: always render if customer, hide via CSS on desktop
  return authStore.isAuthenticated && authStore.isCustomer && !['/login', '/register'].includes(route.path);
});
</script>

<template>
  <div class="app-root">
    <Header v-if="showHeader" />
    
    <main>
      <router-view />
    </main>

    <div class="mobile-nav-wrapper">
      <BottomNav v-if="showBottomNav" />
    </div>
  </div>
</template>

<style>
/* Global Styles update */
body {
  background-color: #f9f9f9;
  margin: 0;
  font-family: 'Open Sans', sans-serif; /* Cleaner font */
}

.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

/* Bottom Nav only visible on Mobile */
.mobile-nav-wrapper {
  display: none;
}

@media (max-width: 768px) {
  .mobile-nav-wrapper {
    display: block;
  }
  
  /* Add padding to bottom of main content on mobile so nav doesn't cover content */
  main {
    padding-bottom: 70px; 
  }
}
</style>
