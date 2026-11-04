<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const packages = ref([])
const settings = ref({ is_commission_open: true, max_queue: 5 })
const loading  = ref(true)

function fmt(n) {
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

onMounted(async () => {
  try {
    const [pkgRes, setRes] = await Promise.all([
      api.get('/commissions/packages'),
      api.get('/settings'),
    ])
    packages.value = pkgRes.data
    settings.value = setRes.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-10 max-w-4xl">
    <h1 class="text-3xl font-bold text-primary mb-2">✏️ รับจ้างวาดภาพตามสั่ง</h1>
    <p class="text-base-content/70 mb-6">เลือกแพ็กเกจที่ต้องการ แล้วกดสั่งจ้างเพื่อกรอกรายละเอียด</p>

    <!-- Status Banner -->
    <div v-if="!settings.is_commission_open" class="alert alert-warning mb-6">
      <span>⚠️ ระบบรับจ้างวาดภาพปิดรับชั่วคราว กรุณาติดตามการเปิดรับรอบถัดไป</span>
    </div>
    <div v-else class="alert alert-success mb-6">
      <span>✅ เปิดรับจ้างวาดภาพ — เหลือคิวอีก {{ settings.max_queue }} งาน</span>
    </div>

    <div v-if="loading" class="flex justify-center py-10">
      <span class="loading loading-dots loading-lg text-primary"></span>
    </div>

    <div v-else class="grid md:grid-cols-3 gap-6">
      <div
        v-for="pkg in packages"
        :key="pkg.package_id"
        class="card bg-base-100 shadow-lg border border-base-200 card-hover"
        :class="{ 'opacity-50': !pkg.is_open }"
      >
        <div class="card-body">
          <h2 class="card-title text-primary">{{ pkg.package_name }}</h2>
          <p class="text-sm text-base-content/70 flex-1">{{ pkg.description }}</p>
          <div class="mt-4">
            <div class="text-2xl font-bold text-primary">฿{{ fmt(pkg.base_price) }}</div>
            <div class="text-xs text-base-content/50 mt-1">
              + ค่าธรรมเนียมบริการ 5% = ฿{{ fmt((pkg.base_price * 1.05).toFixed(2)) }}
            </div>
          </div>
          <div class="card-actions mt-4">
            <RouterLink
              v-if="pkg.is_open && settings.is_commission_open"
              :to="`/commission/order?package_id=${pkg.package_id}`"
              class="btn btn-primary w-full"
            >
              สั่งจ้าง
            </RouterLink>
            <button v-else class="btn btn-disabled w-full">ปิดรับ</button>
          </div>
        </div>
      </div>
    </div>

    <!-- How it works (Interactive) -->
    <div class="mt-16 bg-base-200/50 p-6 sm:p-8 rounded-3xl border border-base-300">
      <h2 class="text-2xl font-bold mb-1 text-center text-primary">ขั้นตอนการสั่งจ้าง</h2>
      <p class="text-xs text-center text-base-content/60 mb-6">ระบบสั่งจ้างทีละสเต็ป พร้อมคำนวณราคาและสแกน QR Code</p>
      <ul class="steps steps-vertical lg:steps-horizontal w-full">
        <li class="step step-primary cursor-pointer hover:opacity-80 transition-opacity" @click="$router.push('/commission/order')">
          <span class="font-semibold">1. เลือกแพ็กเกจ</span>
        </li>
        <li class="step step-primary cursor-pointer hover:opacity-80 transition-opacity" @click="$router.push('/commission/order')">
          <span class="font-semibold">2. กรอกรายละเอียด</span>
        </li>
        <li class="step step-primary cursor-pointer hover:opacity-80 transition-opacity" @click="$router.push('/commission/order')">
          <span class="font-semibold">3. ชำระเงิน + แนบสลิป</span>
        </li>
        <li class="step">
          <span>4. รอรับผลงาน</span>
        </li>
      </ul>
      <div class="text-center mt-6">
        <RouterLink to="/commission/order" class="btn btn-primary px-8 rounded-xl shadow-md gap-2">
          ✏️ เริ่มต้นสั่งจ้างวาดภาพ (4 ขั้นตอน)
        </RouterLink>
      </div>
    </div>
  </div>
</template>

