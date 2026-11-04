<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const router = useRouter()
const auth   = useAuthStore()
const summary = ref(null)
const loading = ref(true)

function fmt(n) {
  return Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/summary')
    summary.value = data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-primary">📊 Admin Dashboard</h1>
      <span class="badge badge-primary">สวัสดี, {{ auth.username }}</span>
    </div>

    <!-- Quick Nav -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
      <RouterLink to="/admin/artworks"    class="btn btn-outline btn-primary">🖼️ จัดการผลงาน</RouterLink>
      <RouterLink to="/admin/orders"      class="btn btn-outline btn-primary">📦 จัดการออร์เดอร์</RouterLink>
      <RouterLink to="/admin/commissions" class="btn btn-outline btn-primary">✏️ จัดการ Commission</RouterLink>
      <RouterLink to="/admin/chat"        class="btn btn-outline btn-secondary font-bold">💬 แชทกับลูกค้า</RouterLink>
      <RouterLink to="/admin/settings"    class="btn btn-outline btn-primary">⚙️ ตั้งค่าร้าน</RouterLink>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="summary" class="space-y-6">
      <!-- Summary cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="stat bg-base-100 shadow rounded-box border border-base-200">
          <div class="stat-title">รายได้รวม (Order)</div>
          <div class="stat-value text-primary text-2xl">฿{{ fmt(summary.orders.total_revenue) }}</div>
          <div class="stat-desc">{{ summary.orders.approved_count }} ออร์เดอร์ | รอตรวจ {{ summary.orders.pending_count }}</div>
        </div>
        <div class="stat bg-base-100 shadow rounded-box border border-base-200">
          <div class="stat-title">รายได้รวม (Commission)</div>
          <div class="stat-value text-secondary text-2xl">฿{{ fmt(summary.commissions.total_revenue) }}</div>
          <div class="stat-desc">{{ summary.commissions.approved_count }} งาน | รอตรวจ {{ summary.commissions.pending_count }}</div>
        </div>
        <div class="stat bg-accent/10 shadow rounded-box border border-accent/30">
          <div class="stat-title font-bold text-accent">รายได้ค่าธรรมเนียม 5% รวม</div>
          <div class="stat-value text-accent text-2xl">฿{{ fmt(summary.total_fee_revenue) }}</div>
          <div class="stat-desc">
            Order: ฿{{ fmt(summary.orders.fee_revenue) }} |
            Commission: ฿{{ fmt(summary.commissions.fee_revenue) }}
          </div>
        </div>
      </div>

      <!-- Commission queue -->
      <div class="card bg-base-100 shadow border border-base-200 p-5">
        <h2 class="font-bold text-lg mb-3">สถานะคิว Commission</h2>
        <div class="flex items-center gap-4">
          <div class="radial-progress text-primary" :style="`--value:${Math.round((summary.commissions.queue_count/summary.commissions.max_queue)*100)};--size:5rem`">
            {{ summary.commissions.queue_count }}/{{ summary.commissions.max_queue }}
          </div>
          <div>
            <p class="font-semibold">คิวปัจจุบัน {{ summary.commissions.queue_count }} / {{ summary.commissions.max_queue }}</p>
            <p class="text-sm text-base-content/60">งานที่ยังไม่เสร็จสมบูรณ์</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

