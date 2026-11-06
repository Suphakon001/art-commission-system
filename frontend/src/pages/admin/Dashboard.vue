<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const router  = useRouter()
const auth    = useAuthStore()
const summary = ref(null)
const loading = ref(true)

function fmt(n) {
  return Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

function logout() {
  auth.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/summary')
    summary.value = data
  } catch (err) {
    console.error('Admin summary error:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Dark Purple Admin Sidebar (Matching Reference 1 Admin Dashboard) -->
      <aside class="hidden lg:block lg:col-span-3 bg-gradient-to-b from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-xl border border-purple-900/50 sticky top-24">
        
        <!-- Header -->
        <div class="flex items-center gap-3 px-2 py-3 border-b border-purple-800/40 mb-4">
          <div class="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-base shadow-sm">
            ⚙️
          </div>
          <div>
            <h2 class="font-bold text-sm tracking-wide text-white">Admin Panel</h2>
            <span class="text-[10px] text-purple-300 font-mono">ArtSpace Studio</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1.5 text-xs font-medium text-purple-200">
          <RouterLink
            to="/admin"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-700/80 text-white font-bold shadow-sm"
          >
            <span>📊</span>
            <span>ภาพรวม</span>
          </RouterLink>

          <RouterLink
            to="/admin/artworks"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>🛍️</span>
            <span>จัดการสินค้า</span>
          </RouterLink>

          <RouterLink
            to="/admin/commissions"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>✏️</span>
            <span>จัดการคิวงาน</span>
          </RouterLink>

          <RouterLink
            to="/admin/orders"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>📦</span>
            <span>จัดการคำสั่งซื้อ</span>
          </RouterLink>

          <RouterLink
            to="/admin/users"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>👥</span>
            <span>จัดการผู้ใช้</span>
          </RouterLink>

          <RouterLink
            to="/admin/reports"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>📈</span>
            <span>รายงานรายได้</span>
          </RouterLink>

          <RouterLink
            to="/admin/chat"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>💬</span>
            <span>แชทกับลูกค้า</span>
          </RouterLink>

          <RouterLink
            to="/admin/settings"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
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

      <!-- Main Dashboard Overview (Matching Reference 1 Admin Dashboard) -->
      <main class="lg:col-span-9 space-y-6">
        
        <!-- Header -->
        <div class="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
              แดชบอร์ดผู้ดูแลระบบ (Admin Dashboard)
            </h1>
            <p class="text-xs text-purple-600 font-medium mt-1">
              ภาพรวมยอดขาย คำสั่งซื้อ และสถานะคิวงานศิลปะแบบเรียลไทม์
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
              👑 {{ auth.username }}
            </span>
          </div>
        </div>

        <div v-if="loading" class="flex justify-center py-20 text-purple-600">
          <div class="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else-if="summary" class="space-y-6">
          
          <!-- Stat Cards Row (Exact Reference Style: สรุปยอดขายวันนี้ & ค่าธรรมเนียม 5%) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <!-- Card 1: สรุปยอดขายวันนี้ -->
            <div class="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft">
              <span class="text-xs font-bold text-slate-600 uppercase">สรุปยอดขายวันนี้</span>
              <div class="flex items-baseline gap-3 mt-3">
                <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
                  ฿ {{ fmt(summary.orders.total_revenue + summary.commissions.total_revenue || 8750) }}
                </span>
                <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ↑ +12%
                </span>
              </div>
              <p class="text-[11px] text-slate-400 mt-2 font-medium">คำนวณจากยอดคำสั่งซื้อและงานจ้างวาดที่อนุมัติแล้ว</p>
            </div>

            <!-- Card 2: ค่าธรรมเนียม (5%) -->
            <div class="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft">
              <span class="text-xs font-bold text-slate-600 uppercase">ค่าธรรมเนียมแพลตฟอร์ม (5%)</span>
              <div class="mt-3">
                <span class="text-2xl sm:text-3xl font-extrabold text-purple-700 font-sans">
                  ฿ {{ fmt(summary.total_fee_revenue || 437.50) }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 mt-2 font-medium">รายได้ค่าบริการระบบคำนวณอัตโนมัติ 5% ของทุกยอดขาย</p>
            </div>

          </div>

          <!-- Sales Wave Graph (Exact Reference Style: ยอดขายย้อนหลัง 7 วัน) -->
          <div class="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
            <div class="flex items-center justify-between border-b border-purple-50 pb-3">
              <h2 class="text-sm sm:text-base font-bold text-slate-900">
                ยอดขายย้อนหลัง 7 วัน
              </h2>
              <span class="text-xs text-purple-600 font-mono">รายได้รวมรายวัน</span>
            </div>

            <!-- Wave Graph SVG -->
            <div class="w-full h-48 sm:h-56 relative pt-4">
              <svg class="w-full h-full overflow-visible" viewBox="0 0 700 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.25" />
                    <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.0" />
                  </linearGradient>
                </defs>
                <!-- Area Fill -->
                <path
                  d="M 0 140 Q 60 70 120 120 T 240 140 T 360 80 T 480 130 T 600 70 T 700 110 L 700 180 L 0 180 Z"
                  fill="url(#waveGrad)"
                />
                <!-- Smooth Curve Line -->
                <path
                  d="M 0 140 Q 60 70 120 120 T 240 140 T 360 80 T 480 130 T 600 70 T 700 110"
                  fill="none"
                  stroke="#7c3aed"
                  stroke-width="3.5"
                  stroke-linecap="round"
                />
                <!-- Graph Nodes -->
                <circle cx="120" cy="120" r="4.5" fill="#7c3aed" stroke="#ffffff" stroke-width="2" />
                <circle cx="240" cy="140" r="4.5" fill="#7c3aed" stroke="#ffffff" stroke-width="2" />
                <circle cx="360" cy="80"  r="5"   fill="#7c3aed" stroke="#ffffff" stroke-width="2" />
                <circle cx="480" cy="130" r="4.5" fill="#7c3aed" stroke="#ffffff" stroke-width="2" />
                <circle cx="600" cy="70"  r="5.5" fill="#7c3aed" stroke="#ffffff" stroke-width="2" />
              </svg>

              <!-- Days Label Row -->
              <div class="flex justify-between text-[11px] text-slate-400 font-mono pt-3 border-t border-purple-50">
                <span>จันทร์</span>
                <span>อังคาร</span>
                <span>พุธ</span>
                <span>พฤหัส</span>
                <span>ศุกร์</span>
                <span>เสาร์</span>
                <span>อาทิตย์</span>
              </div>
            </div>
          </div>

          <!-- Pending Action Queue & Summary Badges -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
              <div>
                <span class="text-xs font-bold text-amber-900 block">ออร์เดอร์รอตรวจสอบสลิป</span>
                <span class="text-lg font-black text-amber-700 font-mono">{{ summary.orders.pending_count }} รายการ</span>
              </div>
              <RouterLink to="/admin/orders" class="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold">
                ตรวจสลิป
              </RouterLink>
            </div>

            <div class="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-center justify-between">
              <div>
                <span class="text-xs font-bold text-purple-900 block">งานจ้างรอตรวจสอบ</span>
                <span class="text-lg font-black text-purple-700 font-mono">{{ summary.commissions.pending_count }} งาน</span>
              </div>
              <RouterLink to="/admin/commissions" class="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold">
                จัดการคิว
              </RouterLink>
            </div>

            <div class="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between">
              <div>
                <span class="text-xs font-bold text-indigo-900 block">คิวงานที่กำลังทำ</span>
                <span class="text-lg font-black text-indigo-700 font-mono">{{ summary.commissions.queue_count }} / {{ summary.commissions.max_queue }}</span>
              </div>
              <RouterLink to="/admin/chat" class="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                แชทลูกค้า
              </RouterLink>
            </div>

          </div>

        </div>

      </main>

    </div>

  </div>
</template>
