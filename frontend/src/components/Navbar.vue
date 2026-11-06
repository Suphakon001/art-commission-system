<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router   = useRouter()
const auth     = useAuthStore()
const cart     = useCartStore()
const menuOpen = ref(false)
const searchQuery = ref('')

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/shop', query: { search: searchQuery.value.trim() } })
  } else {
    router.push('/shop')
  }
}

function logout() {
  auth.logout()
  cart.clearCart()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
      
      <!-- Brand Logo (Reference style) -->
      <RouterLink to="/" class="flex items-center gap-3 shrink-0 group">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200/80 flex items-center justify-center shadow-sm text-purple-700 group-hover:scale-105 transition-transform">
          <!-- Palette Icon with brush -->
          <svg class="w-6 h-6 fill-current text-purple-600" viewBox="0 0 24 24">
            <path d="M12 2C6.49 2 2 6.49 2 12c0 4.41 3.59 8 8 8 .55 0 1-.45 1-1 0-.25-.09-.47-.26-.64-.17-.18-.27-.41-.27-.67 0-.55.45-1 1-1h1.53c4.41 0 8-3.59 8-8 0-5.51-4.49-10-10-10zm-5.5 8c-.83 0-1.5-.67-1.5-1.5S5.67 7 6.5 7s1.5.67 1.5 1.5S7.33 10 6.5 10zm3-3c-.83 0-1.5-.67-1.5-1.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 3c-.83 0-1.5-.67-1.5-1.5S16.67 7 17.5 7s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-2xl font-extrabold tracking-tight text-purple-950 leading-none">ArtSpace</span>
          <span class="text-[11px] font-medium text-purple-600 tracking-wide mt-1">Art Store & Commission</span>
        </div>
      </RouterLink>

      <!-- Center Rounded Search Bar (Reference style) -->
      <form @submit.prevent="handleSearch" class="hidden md:flex flex-1 max-w-md mx-4">
        <div class="relative w-full">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาผลงานที่คุณชอบ..."
            class="w-full pl-11 pr-4 py-2.5 rounded-full bg-purple-50/50 border border-purple-100 hover:border-purple-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs sm:text-sm text-slate-700 placeholder-purple-400/80 outline-none transition-all shadow-inner"
          />
        </div>
      </form>

      <!-- Desktop Nav Actions (Reference style) -->
      <nav class="hidden md:flex items-center gap-6 shrink-0">
        <!-- หน้าหลัก -->
        <RouterLink
          to="/"
          class="flex flex-col items-center gap-1 text-slate-600 hover:text-purple-700 transition-colors group"
          active-class="!text-purple-700 font-semibold"
        >
          <div class="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-purple-50 transition-colors">
            <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <span class="text-xs">หน้าหลัก</span>
        </RouterLink>

        <!-- ตะกร้าสินค้า -->
        <RouterLink
          to="/cart"
          class="relative flex flex-col items-center gap-1 text-slate-600 hover:text-purple-700 transition-colors group"
          active-class="!text-purple-700 font-semibold"
        >
          <div class="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-purple-50 transition-colors">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m5-9l2 9" />
            </svg>
          </div>
          <span
            v-if="cart.count > 0"
            class="absolute -top-1 -right-0.5 bg-rose-500 text-white font-bold text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-sm"
          >
            {{ cart.count }}
          </span>
          <span class="text-xs">ตะกร้าสินค้า</span>
        </RouterLink>

        <!-- ติดตามคำสั่งซื้อ -->
        <RouterLink
          to="/tracking"
          class="flex flex-col items-center gap-1 text-slate-600 hover:text-purple-700 transition-colors group"
          active-class="!text-purple-700 font-semibold"
        >
          <div class="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-purple-50 transition-colors">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span class="text-xs">ติดตามคำสั่งซื้อ</span>
        </RouterLink>

        <!-- เข้าสู่ระบบ / สมัครสมาชิก หรือ โปรไฟล์ -->
        <template v-if="auth.isLoggedIn">
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-purple-50 cursor-pointer border border-purple-100 transition-all">
              <div class="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {{ auth.username.charAt(0).toUpperCase() }}
              </div>
              <div class="flex flex-col text-left">
                <span class="text-xs font-bold text-purple-950 max-w-[100px] truncate">{{ auth.username }}</span>
                <span class="text-[10px] text-purple-600">{{ auth.isAdmin ? 'Admin Panel' : 'โปรไฟล์สมาชิก' }}</span>
              </div>
              <svg class="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </label>

            <ul tabindex="0" class="dropdown-content z-[60] menu p-2 shadow-xl bg-white border border-purple-100 rounded-2xl w-56 mt-2 text-slate-700">
              <li class="px-3 py-2 border-b border-purple-50 text-xs text-slate-500">
                เข้าใช้งานโดย <span class="font-bold text-purple-900">{{ auth.username }}</span>
              </li>
              <li class="mt-1">
                <RouterLink to="/profile" class="hover:text-purple-700 hover:bg-purple-50 text-xs py-2 rounded-lg">
                  👤 แดชบอร์ดผู้ใช้ (Profile)
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/my-orders" class="hover:text-purple-700 hover:bg-purple-50 text-xs py-2 rounded-lg">
                  📦 คำสั่งซื้อของฉัน
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/my-commissions" class="hover:text-purple-700 hover:bg-purple-50 text-xs py-2 rounded-lg">
                  ✏️ งานจ้างวาดของฉัน
                </RouterLink>
              </li>
              <template v-if="auth.isAdmin">
                <div class="divider my-1 border-purple-100"></div>
                <li>
                  <RouterLink to="/admin" class="hover:text-purple-700 hover:bg-purple-50 font-bold text-purple-900 text-xs py-2 rounded-lg">
                    ⚙️ จัดการระบบ (Admin Dashboard)
                  </RouterLink>
                </li>
              </template>
              <div class="divider my-1 border-purple-100"></div>
              <li>
                <a @click="logout" class="text-rose-600 hover:bg-rose-50 text-xs py-2 rounded-lg font-medium">
                  🚪 ออกจากระบบ
                </a>
              </li>
            </ul>
          </div>
        </template>

        <template v-else>
          <RouterLink
            to="/login"
            class="flex flex-col items-center gap-1 text-slate-600 hover:text-purple-700 transition-colors group"
          >
            <div class="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-purple-50 transition-colors">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span class="text-xs">เข้าสู่ระบบ / สมัครสมาชิก</span>
          </RouterLink>
        </template>
      </nav>

      <!-- Mobile Menu Button -->
      <div class="flex md:hidden items-center gap-2">
        <RouterLink to="/cart" class="relative p-2 text-purple-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m5-9l2 9" />
          </svg>
          <span
            v-if="cart.count > 0"
            class="absolute top-1 right-1 bg-rose-500 text-white font-bold text-[10px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5"
          >
            {{ cart.count }}
          </span>
        </RouterLink>

        <button
          @click="menuOpen = !menuOpen"
          class="p-2 text-purple-700 hover:bg-purple-50 rounded-xl"
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

    <!-- Mobile Drawer -->
    <div v-if="menuOpen" class="md:hidden border-t border-purple-100 bg-white px-4 py-4 space-y-2 shadow-xl">
      <!-- Search -->
      <form @submit.prevent="handleSearch" class="mb-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาผลงาน..."
          class="w-full px-4 py-2.5 rounded-full bg-purple-50 border border-purple-100 text-xs text-slate-800 outline-none"
        />
      </form>

      <RouterLink
        to="/"
        class="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700"
        @click="menuOpen = false"
      >
        หน้าหลัก
      </RouterLink>
      <RouterLink
        to="/shop"
        class="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700"
        @click="menuOpen = false"
      >
        ร้านค้าผลงานศิลปะ
      </RouterLink>
      <RouterLink
        to="/commission"
        class="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700"
        @click="menuOpen = false"
      >
        รับจ้างวาดภาพ (Commission)
      </RouterLink>
      <RouterLink
        to="/tracking"
        class="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700"
        @click="menuOpen = false"
      >
        ติดตามสถานะงาน
      </RouterLink>

      <div class="border-t border-purple-100 pt-2 mt-2">
        <template v-if="auth.isLoggedIn">
          <RouterLink
            to="/profile"
            class="block px-3 py-2 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-50"
            @click="menuOpen = false"
          >
            แดชบอร์ดผู้ใช้ ({{ auth.username }})
          </RouterLink>
          <RouterLink
            v-if="auth.isAdmin"
            to="/admin"
            class="block px-3 py-2 rounded-xl text-sm font-bold text-purple-900 hover:bg-purple-50"
            @click="menuOpen = false"
          >
            จัดการระบบหลังร้าน (Admin)
          </RouterLink>
          <button @click="logout" class="block w-full text-left px-3 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50 font-medium">
            ออกจากระบบ
          </button>
        </template>
        <template v-else>
          <div class="grid grid-cols-2 gap-2 pt-2">
            <RouterLink
              to="/login"
              class="text-center py-2.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100"
              @click="menuOpen = false"
            >
              เข้าสู่ระบบ
            </RouterLink>
            <RouterLink
              to="/register"
              class="text-center py-2.5 rounded-xl text-xs font-semibold bg-purple-700 text-white shadow-sm"
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
