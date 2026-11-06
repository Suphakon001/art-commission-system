<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'
import { getArtworkImg, handleImageError } from '@/utils/media'

const router = useRouter()
const auth   = useAuthStore()

const orders = ref([])
const commissions = ref([])
const loading = ref(true)

function fmt(n) {
  return Number(n || 0).toLocaleString('th-TH')
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

const totalSpent = () => {
  const ordSum = orders.value.reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0)
  const comSum = commissions.value.reduce((acc, c) => acc + parseFloat(c.total_amount || 0), 0)
  return ordSum + comSum
}

function logout() {
  auth.logout()
  router.push('/login')
}

onMounted(async () => {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  try {
    const [ordRes, comRes] = await Promise.all([
      api.get('/orders/my').catch(() => ({ data: [] })),
      api.get('/commissions/my').catch(() => ({ data: [] })),
    ])
    orders.value = ordRes.data || []
    commissions.value = comRes.data || []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Left Sidebar Menu (Matching Reference 1 User Dashboard) -->
      <aside class="hidden lg:block lg:col-span-3 bg-white rounded-3xl p-4 border border-purple-100 shadow-soft sticky top-24">
        <!-- User Profile Pill in Sidebar -->
        <div class="flex items-center gap-3 p-3 bg-purple-50/70 rounded-2xl border border-purple-100 mb-4">
          <div class="w-11 h-11 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-bold text-base shadow-sm">
            {{ auth.username.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <h3 class="font-bold text-xs sm:text-sm text-purple-950 truncate">{{ auth.username }}</h3>
            <span class="text-[11px] text-purple-600 font-medium">{{ auth.isAdmin ? '👑 แอดมิน' : 'สมาชิก ArtSpace' }}</span>
          </div>
        </div>

        <nav class="space-y-1 text-xs font-semibold">
          <RouterLink to="/" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>🏠</span>
            <span>หน้าหลัก</span>
          </RouterLink>

          <RouterLink to="/my-orders" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>📦</span>
            <span>คำสั่งซื้อของฉัน</span>
          </RouterLink>

          <RouterLink to="/my-commissions" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>✏️</span>
            <span>งานจ้างของฉัน</span>
          </RouterLink>

          <RouterLink to="/checkout" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>💳</span>
            <span>แจ้งชำระเงิน</span>
          </RouterLink>

          <RouterLink to="/profile" class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-100/90 text-purple-700 font-bold transition-colors">
            <span>👤</span>
            <span>โปรไฟล์</span>
          </RouterLink>

          <div class="divider my-1 border-purple-100"></div>

          <button @click="logout" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-colors text-left">
            <span>🚪</span>
            <span>ออกจากระบบ</span>
          </button>
        </nav>
      </aside>

      <!-- Main User Dashboard Content (Exact Reference 1 User Dashboard) -->
      <main class="lg:col-span-9 space-y-6">
        
        <!-- Welcome Header Card -->
        <div class="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft flex items-center gap-5">
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-purple-100 border-2 border-purple-200 shrink-0 shadow-sm">
            <img src="/images/art-anime-girl.jpg" alt="User Avatar" class="w-full h-full object-cover" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
              สวัสดี, คุณ{{ auth.username }} 🎉
            </h1>
            <p class="text-xs sm:text-sm text-purple-600 font-medium mt-1">
              ยินดีต้อนรับสู่ ArtSpace
            </p>
          </div>
        </div>

        <!-- 3 Stat Cards (Exact Reference Style) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <!-- Card 1: คำสั่งซื้อทั้งหมด -->
          <div class="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft">
            <div class="flex items-center gap-2 text-xs text-purple-700 font-bold mb-1">
              <span>🟣</span>
              <span>คำสั่งซื้อทั้งหมด</span>
            </div>
            <div class="text-2xl font-extrabold text-slate-900 mt-2">
              {{ orders.length }} <span class="text-xs font-normal text-slate-500">รายการ</span>
            </div>
          </div>

          <!-- Card 2: งานจ้างทั้งหมด -->
          <div class="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft">
            <div class="flex items-center gap-2 text-xs text-purple-700 font-bold mb-1">
              <span>🔵</span>
              <span>งานจ้างทั้งหมด</span>
            </div>
            <div class="text-2xl font-extrabold text-slate-900 mt-2">
              {{ commissions.length }} <span class="text-xs font-normal text-slate-500">งาน</span>
            </div>
          </div>

          <!-- Card 3: ยอดใช้จ่ายรวม -->
          <div class="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft">
            <div class="flex items-center gap-2 text-xs text-purple-700 font-bold mb-1">
              <span>🟡</span>
              <span>ยอดใช้จ่ายรวม</span>
            </div>
            <div class="text-2xl font-extrabold text-slate-900 mt-2">
              ฿ {{ fmt(totalSpent()) }}
            </div>
          </div>

        </div>

        <!-- Card: คำสั่งซื้อล่าสุด (Reference Style) -->
        <div class="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
          <div class="flex items-center justify-between border-b border-purple-100 pb-3">
            <h2 class="text-base font-bold text-slate-900">
              คำสั่งซื้อล่าสุด
            </h2>
            <RouterLink to="/my-orders" class="text-xs font-bold text-purple-700 hover:text-purple-900">
              ดูทั้งหมด →
            </RouterLink>
          </div>

          <div v-if="loading" class="text-center py-8 text-purple-600">
            <div class="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>

          <div v-else-if="orders.length === 0" class="text-center py-8 text-slate-400 text-xs">
            ยังไม่มีประวัติคำสั่งซื้อ
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="ord in orders.slice(0, 3)"
              :key="ord.order_id"
              class="flex items-center justify-between p-3 rounded-2xl bg-purple-50/50 border border-purple-100 hover:bg-purple-50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-purple-200 overflow-hidden shrink-0">
                  <img
                    :src="getArtworkImg(ord.items?.[0]?.preview_image || '')"
                    alt="Artwork"
                    @error="handleImageError"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 class="font-bold text-xs text-slate-900">{{ ord.items?.[0]?.title || `คำสั่งซื้อ #${ord.order_id}` }}</h3>
                  <span class="text-[11px] text-purple-700 font-bold font-mono">฿ {{ fmt(ord.total_amount) }}</span>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span
                  class="px-3 py-1 rounded-full text-[10px] font-bold"
                  :class="ord.payment_status === 'approved'
                    ? 'bg-emerald-100 text-emerald-700'
                    : ord.payment_status === 'rejected'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'"
                >
                  {{ ord.payment_status === 'approved' ? 'อนุมัติแล้ว' : ord.payment_status === 'rejected' ? 'ปฏิเสธ' : 'รอการชำระเงิน' }}
                </span>
                <span class="text-[10px] text-slate-400 font-mono hidden sm:inline">{{ fmtDate(ord.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

      </main>

    </div>

  </div>
</template>

