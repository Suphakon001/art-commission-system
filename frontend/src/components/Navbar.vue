<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router   = useRouter()
const auth     = useAuthStore()
const cart     = useCartStore()
const menuOpen = ref(false)

function logout() {
  auth.logout()
  cart.clearCart()
  router.push('/login')
}
</script>

<template>
  <div class="navbar bg-primary text-primary-content shadow-lg sticky top-0 z-50 px-4">
    <!-- Logo -->
    <div class="flex-1">
      <RouterLink to="/" class="btn btn-ghost text-xl font-bold tracking-wide flex items-center gap-2.5 px-2 hover:bg-white/10">
        <div class="w-8 h-8 rounded-full overflow-hidden shadow ring-2 ring-white/50 shrink-0">
          <img src="/images/profile.jpg" alt="ArtShop Logo" class="w-full h-full object-cover" />
        </div>
        <span>ArtShop</span>
      </RouterLink>
    </div>

    <!-- Desktop Nav -->
    <div class="hidden md:flex items-center gap-1">
      <RouterLink to="/shop"       class="btn btn-ghost btn-sm">ซื้อภาพ</RouterLink>
      <RouterLink to="/commission" class="btn btn-ghost btn-sm">รับจ้างวาด</RouterLink>

      <!-- Cart -->
      <RouterLink to="/cart" class="btn btn-ghost btn-sm">
        <div class="indicator">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m5-9l2 9" />
          </svg>
          <span v-if="cart.count > 0" class="badge badge-secondary badge-xs indicator-item">
            {{ cart.count }}
          </span>
        </div>
      </RouterLink>

      <!-- Auth -->
      <template v-if="auth.isLoggedIn">
        <div class="dropdown dropdown-end">
          <label tabindex="0" :class="['btn btn-ghost btn-circle', auth.isAdmin ? 'avatar' : 'avatar placeholder']">
            <!-- If Admin: Show official anime artist profile icon -->
            <div v-if="auth.isAdmin" class="w-9 h-9 rounded-full ring-2 ring-primary-content/40 overflow-hidden shadow">
              <img src="/images/profile.jpg" alt="Admin Profile" class="w-full h-full object-cover" />
            </div>
            <!-- If Customer: Show standard letter avatar centered -->
            <div v-else class="bg-secondary text-secondary-content rounded-full w-9 h-9 !flex !items-center !justify-center font-bold text-base shadow leading-none select-none">
              <span class="inline-flex items-center justify-center leading-none text-center">{{ auth.username.charAt(0).toUpperCase() }}</span>
            </div>
          </label>
          <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 text-base-content rounded-box w-56 mt-2 border border-base-200">
            <li class="menu-title flex flex-row items-center gap-2.5 pb-2 border-b border-base-200">
              <div :class="auth.isAdmin ? 'avatar' : 'avatar placeholder'">
                <div v-if="auth.isAdmin" class="w-8 h-8 rounded-full overflow-hidden ring-1 ring-primary/30">
                  <img src="/images/profile.jpg" alt="Admin" class="w-full h-full object-cover" />
                </div>
                <div v-else class="bg-secondary text-secondary-content rounded-full w-8 h-8 !flex !items-center !justify-center font-bold text-xs leading-none">
                  <span class="inline-flex items-center justify-center leading-none text-center">{{ auth.username.charAt(0).toUpperCase() }}</span>
                </div>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-sm text-base-content leading-tight">{{ auth.username }}</span>
                <span v-if="auth.isAdmin" class="text-[10px] text-primary font-semibold">👑 ผู้ดูแลระบบ (Admin)</span>
                <span v-else class="text-[10px] text-base-content/50">สมาชิกทั่วไป</span>
              </div>
            </li>
            <li class="mt-1"><RouterLink to="/my-orders">📦 คำสั่งซื้อของฉัน</RouterLink></li>
            <li><RouterLink to="/my-commissions">✏️ งานจ้างวาดของฉัน</RouterLink></li>
            <li v-if="auth.isAdmin"><RouterLink to="/admin">⚙️ จัดการระบบ (Admin)</RouterLink></li>
            <li v-if="auth.isAdmin"><RouterLink to="/admin/chat">💬 แชทกับลูกค้า</RouterLink></li>
            <div class="divider my-1"></div>
            <li><a @click="logout" class="text-error font-medium">🚪 ออกจากระบบ</a></li>
          </ul>
        </div>
      </template>
      <template v-else>
        <RouterLink to="/login"    class="btn btn-ghost btn-sm">เข้าสู่ระบบ</RouterLink>
        <RouterLink to="/register" class="btn btn-secondary btn-sm">สมัครสมาชิก</RouterLink>
      </template>
    </div>

    <!-- Mobile hamburger -->
    <div class="md:hidden">
      <label class="btn btn-ghost btn-sm swap swap-rotate">
        <input type="checkbox" v-model="menuOpen" />
        <svg class="swap-off h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg class="swap-on h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </label>
    </div>
  </div>

  <!-- Mobile Menu -->
  <div v-if="menuOpen" class="md:hidden bg-primary text-primary-content px-4 pb-4 flex flex-col gap-2 shadow-md">
    <RouterLink to="/shop"         class="btn btn-ghost btn-sm justify-start" @click="menuOpen=false">ซื้อภาพ</RouterLink>
    <RouterLink to="/commission"   class="btn btn-ghost btn-sm justify-start" @click="menuOpen=false">รับจ้างวาด</RouterLink>
    <RouterLink to="/cart"         class="btn btn-ghost btn-sm justify-start" @click="menuOpen=false">ตะกร้า ({{ cart.count }})</RouterLink>
    <template v-if="auth.isLoggedIn">
      <div class="flex items-center gap-2.5 px-3 py-2 bg-white/10 rounded-xl mb-1">
        <div :class="auth.isAdmin ? 'avatar' : 'avatar placeholder'">
          <div v-if="auth.isAdmin" class="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/50">
            <img src="/images/profile.jpg" alt="Admin" class="w-full h-full object-cover" />
          </div>
          <div v-else class="bg-secondary text-secondary-content rounded-full w-8 h-8 !flex !items-center !justify-center font-bold text-xs leading-none">
            <span class="inline-flex items-center justify-center leading-none text-center">{{ auth.username.charAt(0).toUpperCase() }}</span>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-sm leading-tight">{{ auth.username }}</span>
          <span v-if="auth.isAdmin" class="text-[10px] text-amber-300 font-semibold">👑 Admin</span>
        </div>
      </div>
      <RouterLink to="/my-orders"      class="btn btn-ghost btn-sm justify-start" @click="menuOpen=false">คำสั่งซื้อ</RouterLink>
      <RouterLink to="/my-commissions" class="btn btn-ghost btn-sm justify-start" @click="menuOpen=false">งานจ้าง</RouterLink>
      <RouterLink v-if="auth.isAdmin" to="/admin" class="btn btn-ghost btn-sm justify-start" @click="menuOpen=false">Admin</RouterLink>
      <button class="btn btn-error btn-sm justify-start" @click="logout">ออกจากระบบ</button>
    </template>
    <template v-else>
      <RouterLink to="/login"    class="btn btn-ghost btn-sm justify-start" @click="menuOpen=false">เข้าสู่ระบบ</RouterLink>
      <RouterLink to="/register" class="btn btn-secondary btn-sm justify-start" @click="menuOpen=false">สมัครสมาชิก</RouterLink>
    </template>
  </div>
</template>

