// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/',                   component: () => import('@/pages/Home.vue') },
  { path: '/shop',               component: () => import('@/pages/Shop.vue') },
  { path: '/shop/:id',           component: () => import('@/pages/ArtworkDetail.vue') },
  { path: '/commission',         component: () => import('@/pages/Commission.vue') },
  { path: '/commission/order',   component: () => import('@/pages/CommissionOrder.vue'), meta: { requiresAuth: true } },
  { path: '/cart',               component: () => import('@/pages/Cart.vue') },
  { path: '/checkout',           component: () => import('@/pages/Checkout.vue'),        meta: { requiresAuth: true } },
  { path: '/my-orders',          component: () => import('@/pages/MyOrders.vue'),        meta: { requiresAuth: true } },
  { path: '/my-commissions',     component: () => import('@/pages/MyCommissions.vue'),   meta: { requiresAuth: true } },
  { path: '/login',              component: () => import('@/pages/Login.vue') },
  { path: '/register',           component: () => import('@/pages/Register.vue') },

  // Admin
  { path: '/admin',              component: () => import('@/pages/admin/Dashboard.vue'),          meta: { requiresAdmin: true } },
  { path: '/admin/artworks',     component: () => import('@/pages/admin/ManageArtworks.vue'),     meta: { requiresAdmin: true } },
  { path: '/admin/commissions',  component: () => import('@/pages/admin/ManageCommissions.vue'),  meta: { requiresAdmin: true } },
  { path: '/admin/orders',       component: () => import('@/pages/admin/ManageOrders.vue'),       meta: { requiresAdmin: true } },
  { path: '/admin/settings',     component: () => import('@/pages/admin/ManageSettings.vue'),     meta: { requiresAdmin: true } },
  { path: '/admin/chat',         component: () => import('@/pages/admin/AdminChat.vue'),          meta: { requiresAdmin: true } },

  { path: '/:pathMatch(.*)*',    component: () => import('@/pages/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAdmin && !auth.isAdmin) return '/login'
  if (to.meta.requiresAuth  && !auth.isLoggedIn) return '/login'
})

export default router

