import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Customer Views
import Home from '@/views/Customer/Home.vue';
import RestaurantDetail from '@/views/Customer/RestaurantDetail.vue';
import Checkout from '@/views/Customer/Checkout.vue';
import OrderTracking from '@/views/Customer/OrderTracking.vue';
import OrdersHistory from '@/views/Customer/OrdersHistory.vue';

// Restaurant Views
import RestaurantDashboard from '@/views/Restaurant/Dashboard.vue';

// Driver Views
import DriverDashboard from '@/views/Driver/Dashboard.vue';

// Auth Views
import LoginPage from '@/views/Auth/LoginPage.vue';
import RegisterPage from '@/views/Auth/RegisterPage.vue';

const routes = [
  { path: '/', component: Home, meta: { requiresAuth: true, role: 'customer' } },
  { path: '/restaurant/:id', component: RestaurantDetail, meta: { requiresAuth: true, role: 'customer' } },
  { path: '/checkout', component: Checkout, meta: { requiresAuth: true, role: 'customer' } },
  { path: '/order/:id/tracking', component: OrderTracking, meta: { requiresAuth: true, role: 'customer' } },
  { path: '/orders', component: OrdersHistory, meta: { requiresAuth: true, role: 'customer' } },
  { path: '/restaurant-dashboard', component: RestaurantDashboard, meta: { requiresAuth: true, role: 'restaurant' } },
  { path: '/driver-dashboard', component: DriverDashboard, meta: { requiresAuth: true, role: 'driver' } },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRole = to.meta.role;

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (requiresAuth && requiredRole && authStore.user?.role !== requiredRole) {
    // Prevent infinite redirect loop if user is already on their role's dashboard but router tries to redirect elsewhere
    // Actually the logic below redirects to correct dashboard if role doesn't match
    if (authStore.user?.role === 'restaurant') {
        if (to.path !== '/restaurant-dashboard') next('/restaurant-dashboard');
        else next();
    } else if (authStore.user?.role === 'driver') {
        if (to.path !== '/driver-dashboard') next('/driver-dashboard');
        else next();
    } else {
        // Customer
        if (to.path !== '/') next('/');
        else next();
    }
  } else {
    // Role matches or no role required
    // But we should also protect Customer routes from being accessed by Restaurant/Driver
    if (authStore.isAuthenticated) {
        if (authStore.user?.role === 'restaurant' && to.path === '/') {
            next('/restaurant-dashboard');
            return;
        }
        if (authStore.user?.role === 'driver' && to.path === '/') {
            next('/driver-dashboard');
            return;
        }
    }
    next();
  }
});

export default router;
