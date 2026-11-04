<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const commissions = ref([])
const loading     = ref(true)

const paymentMap = {
  pending:  { label: 'รอตรวจสอบ', cls: 'badge-warning' },
  approved: { label: 'อนุมัติแล้ว', cls: 'badge-success' },
  rejected: { label: 'ปฏิเสธ',     cls: 'badge-error'   },
}

const workMap = {
  'รอคิว':          'badge-ghost',
  'ร่างภาพ':         'badge-info',
  'ตัดเส้น/ลงสี':   'badge-warning',
  'เสร็จสมบูรณ์':   'badge-success',
}

function fmt(n) {
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(async () => {
  try {
    const { data } = await api.get('/commissions/my')
    commissions.value = data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-3xl font-bold text-primary mb-6">🎨 งานจ้างวาดของฉัน</h1>

    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="commissions.length === 0" class="text-center py-16 text-base-content/50">
      <div class="text-5xl mb-3">✏️</div>
      <p>ยังไม่มีงานจ้างวาด</p>
      <RouterLink to="/commission" class="btn btn-primary mt-4">สั่งจ้างวาดภาพ</RouterLink>
    </div>

    <div v-else class="space-y-5">
      <div
        v-for="c in commissions"
        :key="c.commission_id"
        class="card bg-base-100 shadow border border-base-200 p-5"
      >
        <div class="flex flex-col sm:flex-row justify-between gap-3">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="font-bold text-lg">#{{ c.commission_id }}</span>
              <span :class="['badge', paymentMap[c.payment_status]?.cls]">
                💳 {{ paymentMap[c.payment_status]?.label }}
              </span>
              <span :class="['badge', workMap[c.work_status] || 'badge-ghost']">
                🎨 {{ c.work_status }}
              </span>
            </div>
            <p class="font-semibold">{{ c.package_name }}</p>
            <p class="text-sm text-base-content/60 mt-1 line-clamp-2">{{ c.brief_detail }}</p>
            <p class="text-xs text-base-content/40 mt-1">{{ fmtDate(c.created_at) }}</p>
          </div>
          <div class="text-right shrink-0">
            <div class="text-sm text-base-content/60">ค่าจ้าง: ฿{{ fmt(c.base_amount) }}</div>
            <div class="text-sm text-base-content/60">ค่าธรรมเนียม: ฿{{ fmt(c.service_fee) }}</div>
            <div class="font-bold text-primary text-lg">฿{{ fmt(c.total_amount) }}</div>
          </div>
        </div>

        <!-- Progress -->
        <div class="mt-4">
          <ul class="steps w-full text-xs">
            <li class="step" :class="['รอคิว','ร่างภาพ','ตัดเส้น/ลงสี','เสร็จสมบูรณ์'].indexOf(c.work_status) >= 0 ? 'step-primary' : ''">รอคิว</li>
            <li class="step" :class="['ร่างภาพ','ตัดเส้น/ลงสี','เสร็จสมบูรณ์'].indexOf(c.work_status) >= 0 ? 'step-primary' : ''">ร่างภาพ</li>
            <li class="step" :class="['ตัดเส้น/ลงสี','เสร็จสมบูรณ์'].indexOf(c.work_status) >= 0 ? 'step-primary' : ''">ตัดเส้น/ลงสี</li>
            <li class="step" :class="c.work_status === 'เสร็จสมบูรณ์' ? 'step-primary' : ''">เสร็จสมบูรณ์</li>
          </ul>
        </div>

        <!-- Draft image preview -->
        <div v-if="c.draft_image" class="mt-3">
          <p class="text-sm font-semibold mb-1">ภาพร่าง:</p>
          <img :src="`/uploads/drafts/${c.draft_image}`" class="rounded-box max-h-48 object-contain border border-base-200" />
        </div>

        <!-- Final file download -->
        <div v-if="c.final_file && c.work_status === 'เสร็จสมบูรณ์'" class="mt-3">
          <a :href="`/uploads/drafts/${c.final_file}`" download class="btn btn-success btn-sm">
            ⬇️ ดาวน์โหลดไฟล์งานสุดท้าย
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

