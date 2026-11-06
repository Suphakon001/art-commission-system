<script setup>
import { ref } from 'vue'
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
  <header class="sticky top-0 z-50 backdrop-blur-md bg-slate-950/85 border-b border-slate-800/80 text-slate-100 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-6">
        <RouterLink to="/" class="flex items-center gap-3 group">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40 group-hover:scale-105 transition-transform">
            <svg class="w-4 h-4 text-slate-950 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="text-base font-bold tracking-widest text-slate-100 group-hover:text-amber-400 transition-colors">ARTSHOP</span>
            <span class="text-[10px] tracking-wider text-slate-400 font-mono uppercase -mt-1">Fine Art Studio</span>
          </div>
        </RouterLink>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-1 ml-4">
          <RouterLink
            to="/shop"
            class="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
            active-class="!text-amber-400 !bg-slate-800/80"
          >
            แกลเลอรีภาพวาด
          </RouterLink>
          <RouterLink
            to="/commission"
            class="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
            active-class="!text-amber-400 !bg-slate-800/80"
          >
            สั่งวาดภาพ
          </RouterLink>
        </nav>
      </div>

      <!-- Desktop Right Controls -->
      <div class="hidden md:flex items-center gap-3">
        <!-- Cart -->
        <RouterLink
          to="/cart"
          class="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
          title="ตะกร้าผลงาน"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span
            v-if="cart.count > 0"
            class="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-md"
          >
            {{ cart.count }}
          </span>
        </RouterLink>

        <!-- User Profile Dropdown -->
        <template v-if="auth.isLoggedIn">
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-800/70 cursor-pointer border border-transparent hover:border-slate-700 transition-all">
              <div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-semibold text-sm">
                {{ auth.username.charAt(0).toUpperCase() }}
              </div>
              <div class="flex flex-col text-left pr-1">
                <span class="text-xs font-semibold text-slate-200 leading-tight max-w-[110px] truncate">{{ auth.username }}</span>
                <span v-if="auth.isAdmin" class="text-[10px] text-amber-400 font-mono">ADMIN</span>
                <span v-else class="text-[10px] text-slate-400">MEMBER</span>
              </div>
              <svg class="w-3.5 h-3.5 text-slate-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </label>

            <ul tabindex="0" class="dropdown-content z-[60] menu p-2 shadow-2xl bg-slate-900 border border-slate-800 rounded-2xl w-56 mt-2 text-slate-200">
              <li class="px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
                เข้าสู่ระบบด้วยชื่อ <span class="text-slate-100 font-semibold">{{ auth.username }}</span>
              </li>
              <li class="mt-1">
                <RouterLink to="/my-orders" class="hover:text-amber-400 hover:bg-slate-800/80 rounded-lg text-xs py-2">
                  ประวัติคำสั่งซื้อ
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/my-commissions" class="hover:text-amber-400 hover:bg-slate-800/80 rounded-lg text-xs py-2">
                  สถานะงานสั่งวาด
                </RouterLink>
              </li>
              <template v-if="auth.isAdmin">
                <div class="divider my-1 border-slate-800"></div>
                <li>
                  <RouterLink to="/admin" class="hover:text-amber-400 hover:bg-slate-800/80 rounded-lg text-xs py-2">
                    จัดการระบบหลังร้าน
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/admin/chat" class="hover:text-amber-400 hover:bg-slate-800/80 rounded-lg text-xs py-2">
                    กล่องข้อความลูกค้า
                  </RouterLink>
                </li>
              </template>
              <div class="divider my-1 border-slate-800"></div>
              <li>
                <a @click="logout" class="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg text-xs py-2">
                  ออกจากระบบ
                </a>
              </li>
            </ul>
          </div>
        </template>

        <!-- Guest Links -->
        <template v-else>
          <RouterLink
            to="/login"
            class="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            เข้าสู่ระบบ
          </RouterLink>
          <RouterLink
            to="/register"
            class="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10 transition-all"
          >
            สมัครสมาชิก
          </RouterLink>
        </template>
      </div>

      <!-- Mobile Right Section -->
      <div class="flex md:hidden items-center gap-2">
        <!-- Mobile Cart Button -->
        <RouterLink
          to="/cart"
          class="relative p-2 rounded-lg text-slate-300 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span
            v-if="cart.count > 0"
            class="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[10px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5"
          >
            {{ cart.count }}
          </span>
        </RouterLink>

        <!-- Mobile Menu Toggle Button -->
        <button
          @click="menuOpen = !menuOpen"
          class="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg v-if="!menuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

    </div>

    <!-- Mobile Slide-Down Drawer -->
    <div
      v-if="menuOpen"
      class="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-2 shadow-2xl"
    >
      <RouterLink
        to="/shop"
        class="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/80 hover:text-amber-400"
        @click="menuOpen = false"
      >
        แกลเลอรีภาพวาด
      </RouterLink>
      <RouterLink
        to="/commission"
        class="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/80 hover:text-amber-400"
        @click="menuOpen = false"
      >
        สั่งวาดภาพ (Commission)
      </RouterLink>
      <RouterLink
        to="/cart"
        class="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/80 hover:text-amber-400"
        @click="menuOpen = false"
      >
        ตะกร้าผลงาน ({{ cart.count }})
      </RouterLink>

      <div class="border-t border-slate-800/80 my-2 pt-2">
        <template v-if="auth.isLoggedIn">
          <div class="px-3 py-2 bg-slate-900/80 rounded-xl mb-2 flex items-center justify-between border border-slate-800">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 text-xs font-bold">
                {{ auth.username.charAt(0).toUpperCase() }}
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-slate-200">{{ auth.username }}</span>
                <span v-if="auth.isAdmin" class="text-[9px] text-amber-400 font-mono">ADMIN</span>
              </div>
            </div>
            <button @click="logout" class="text-xs text-rose-400 hover:text-rose-300 font-medium">
              ออกจากระบบ
            </button>
          </div>
          <RouterLink
            to="/my-orders"
            class="block px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/60"
            @click="menuOpen = false"
          >
            ประวัติคำสั่งซื้อ
          </RouterLink>
          <RouterLink
            to="/my-commissions"
            class="block px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/60"
            @click="menuOpen = false"
          >
            สถานะงานสั่งวาด
          </RouterLink>
          <template v-if="auth.isAdmin">
            <RouterLink
              to="/admin"
              class="block px-3 py-2 rounded-xl text-xs font-medium text-amber-400 hover:bg-slate-800/60"
              @click="menuOpen = false"
            >
              จัดการระบบหลังร้าน (Admin)
            </RouterLink>
            <RouterLink
              to="/admin/chat"
              class="block px-3 py-2 rounded-xl text-xs font-medium text-amber-400 hover:bg-slate-800/60"
              @click="menuOpen = false"
            >
              กล่องข้อความลูกค้า
            </RouterLink>
          </template>
        </template>
        <template v-else>
          <div class="grid grid-cols-2 gap-2 pt-2">
            <RouterLink
              to="/login"
              class="text-center py-2.5 rounded-xl text-xs font-medium bg-slate-900 border border-slate-800 text-slate-200"
              @click="menuOpen = false"
            >
              เข้าสู่ระบบ
            </RouterLink>
            <RouterLink
              to="/register"
              class="text-center py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 shadow-md"
              @click="menuOpen = false"
            >
              สมัครสมาชิก
            </RouterLink>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>
