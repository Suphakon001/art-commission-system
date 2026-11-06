<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="hidden lg:block lg:col-span-3 bg-gradient-to-b from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-xl border border-purple-900/50 sticky top-24 print:hidden">
    <div class="flex items-center gap-3 px-2 py-3 border-b border-purple-800/40 mb-4">
      <div class="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-base shadow-sm">
        ⚙️
      </div>
      <div>
        <h2 class="font-bold text-sm tracking-wide text-white">Admin Panel</h2>
        <span class="text-[10px] text-purple-300 font-mono">ArtSpace Studio</span>
      </div>
    </div>

    <nav class="space-y-1.5 text-xs font-medium text-purple-200">
      <RouterLink
        to="/admin"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
        active-class="!bg-purple-700/80 !text-white font-bold shadow-sm"
      >
        <span>📊</span>
        <span>ภาพรวม</span>
      </RouterLink>

      <RouterLink
        to="/admin/artworks"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
        active-class="!bg-purple-700/80 !text-white font-bold shadow-sm"
      >
        <span>🛍️</span>
        <span>จัดการสินค้า</span>
      </RouterLink>

      <RouterLink
        to="/admin/commissions"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
        active-class="!bg-purple-700/80 !text-white font-bold shadow-sm"
      >
        <span>✏️</span>
        <span>จัดการคิวงาน</span>
      </RouterLink>

      <RouterLink
        to="/admin/orders"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
        active-class="!bg-purple-700/80 !text-white font-bold shadow-sm"
      >
        <span>📦</span>
        <span>จัดการคำสั่งซื้อ</span>
      </RouterLink>

      <RouterLink
        to="/admin/users"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
        active-class="!bg-purple-700/80 !text-white font-bold shadow-sm"
      >
        <span>👥</span>
        <span>จัดการผู้ใช้</span>
      </RouterLink>

      <RouterLink
        to="/admin/reports"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
        active-class="!bg-purple-700/80 !text-white font-bold shadow-sm"
      >
        <span>📈</span>
        <span>รายงานรายได้</span>
      </RouterLink>

      <RouterLink
        to="/admin/chat"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
        active-class="!bg-purple-700/80 !text-white font-bold shadow-sm"
      >
        <span>💬</span>
        <span>แชทกับลูกค้า</span>
      </RouterLink>

      <RouterLink
        to="/admin/settings"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
        active-class="!bg-purple-700/80 !text-white font-bold shadow-sm"
      >
        <span>⚙️</span>
        <span>ตั้งค่าระบบ</span>
      </RouterLink>

      <div class="divider my-2 border-purple-800/40"></div>

      <button
        @click="logout"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors text-left"
      >
        <span>🚪</span>
        <span>ออกจากระบบ</span>
      </button>
    </nav>
  </aside>
</template>
