<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const summary = ref(null)
const orders  = ref([])
const loading = ref(true)

function fmt(n) {
  return Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

function printReport() {
  window.print()
}

onMounted(async () => {
  try {
    const [sumRes, ordRes] = await Promise.all([
      api.get('/admin/summary'),
      api.get('/orders'),
    ])
    summary.value = sumRes.data
    orders.value  = ordRes.data?.data || []
  } catch (err) {
    console.error('Report load error:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Admin Sidebar -->
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
          <RouterLink to="/admin" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            <span>📊</span>
            <span>ภาพรวม</span>
          </RouterLink>
          <RouterLink to="/admin/artworks" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            <span>🛍️</span>
            <span>จัดการสินค้า</span>
          </RouterLink>
          <RouterLink to="/admin/commissions" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            <span>✏️</span>
            <span>จัดการคิวงาน</span>
          </RouterLink>
          <RouterLink to="/admin/orders" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            <span>📦</span>
            <span>จัดการคำสั่งซื้อ</span>
          </RouterLink>
          <RouterLink to="/admin/users" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            <span>👥</span>
            <span>จัดการผู้ใช้</span>
          </RouterLink>
          <RouterLink to="/admin/reports" class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-700/80 text-white font-bold shadow-sm">
            <span>📈</span>
            <span>รายงานรายได้</span>
          </RouterLink>
          <RouterLink to="/admin/chat" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            <span>💬</span>
            <span>แชทกับลูกค้า</span>
          </RouterLink>
          <RouterLink to="/admin/settings" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            <span>⚙️</span>
            <span>ตั้งค่าระบบ</span>
          </RouterLink>
        </nav>
      </aside>

      <!-- Main Reports Content -->
      <main class="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
              รายงานรายได้และการขาย (Revenue Reports)
            </h1>
            <p class="text-xs text-purple-600 font-medium mt-1">
              สรุปรายได้รวม ค่าธรรมเนียมระบบ 5% และยอดคำสั่งซื้อทั้งหมด
            </p>
          </div>
          <button
            @click="printReport"
            class="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>🖨️</span>
            <span>พิมพ์รายงาน</span>
          </button>
        </div>

        <div v-if="loading" class="flex justify-center py-16 text-purple-600">
          <div class="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else-if="summary" class="space-y-6">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-5 rounded-2xl bg-purple-50/70 border border-purple-100">
              <span class="text-xs font-bold text-purple-900 block">ยอดขายภาพวาด (Orders)</span>
              <div class="text-2xl font-extrabold text-slate-900 mt-2 font-mono">฿{{ fmt(summary.orders.total_revenue) }}</div>
              <span class="text-[11px] text-purple-600 font-medium mt-1 block">อนุมัติแล้ว {{ summary.orders.approved_count }} รายการ</span>
            </div>

            <div class="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <span class="text-xs font-bold text-indigo-900 block">ยอดงานจ้างวาด (Commissions)</span>
              <div class="text-2xl font-extrabold text-slate-900 mt-2 font-mono">฿{{ fmt(summary.commissions.total_revenue) }}</div>
              <span class="text-[11px] text-indigo-600 font-medium mt-1 block">อนุมัติแล้ว {{ summary.commissions.approved_count }} งาน</span>
            </div>

            <div class="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span class="text-xs font-bold text-emerald-900 block">รายได้ค่าธรรมเนียม 5% สุทธิ</span>
              <div class="text-2xl font-extrabold text-emerald-700 mt-2 font-mono">฿{{ fmt(summary.total_fee_revenue) }}</div>
              <span class="text-[11px] text-emerald-600 font-medium mt-1 block">อัตราค่าบริการแพลตฟอร์ม</span>
            </div>
          </div>

          <!-- Total Turnover Box -->
          <div class="p-6 rounded-3xl bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div>
              <span class="text-xs uppercase tracking-wider text-purple-200 font-mono">Total Business Volume</span>
              <h2 class="text-2xl sm:text-3xl font-extrabold font-mono mt-1">
                ฿{{ fmt(summary.orders.total_revenue + summary.commissions.total_revenue) }}
              </h2>
            </div>
            <div class="text-xs text-purple-200 text-right">
              คำนวณ ณ วันที่ {{ new Date().toLocaleDateString('th-TH') }}
            </div>
          </div>
        </div>
      </main>

    </div>
  </div>
</template>

