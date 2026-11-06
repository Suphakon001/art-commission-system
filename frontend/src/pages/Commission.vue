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
  } catch (err) {
    console.error('Commission page error:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    
    <!-- Header -->
    <div class="mb-8 sm:mb-12 border-b border-slate-800 pb-6">
      <span class="text-xs font-mono font-semibold uppercase tracking-widest text-amber-400">Bespoke Studio</span>
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-100 mt-1">
        บริการสั่งวาดภาพศิลปะ (Commission)
      </h1>
      <p class="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
        สั่งวาดตัวละคร ภาพประกอบ หรือภาพคอนเซปต์อาร์ตตามที่คุณต้องการ พร้อมการประสานงานทุกขั้นตอน
      </p>

      <!-- Status Indicator -->
      <div class="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
        :class="settings.is_commission_open
          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
          : 'bg-amber-950/40 text-amber-400 border-amber-500/30'"
      >
        <span class="w-2 h-2 rounded-full" :class="settings.is_commission_open ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'"></span>
        <span v-if="settings.is_commission_open">เปิดรับคิวสั่งวาด — ว่าง {{ settings.max_queue }} คิว</span>
        <span v-else>ระบบสั่งวาดปิดรับชั่วคราว</span>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20 text-slate-400">
      <div class="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Package Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      <div
        v-for="pkg in packages"
        :key="pkg.package_id"
        class="flex flex-col justify-between p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all shadow-xl"
        :class="{ 'opacity-50 grayscale': !pkg.is_open || !settings.is_commission_open }"
      >
        <div>
          <span class="text-[10px] font-mono uppercase tracking-wider text-amber-400">PACKAGE</span>
          <h2 class="text-lg font-bold text-slate-100 mt-1 mb-2">{{ pkg.package_name }}</h2>
          <p class="text-xs text-slate-400 leading-relaxed mb-6">{{ pkg.description }}</p>
        </div>

        <div>
          <div class="border-t border-slate-800 pt-4 mb-4">
            <span class="text-[10px] text-slate-500 font-mono block uppercase">Base Price</span>
            <div class="text-2xl font-bold font-mono text-amber-400">฿{{ fmt(pkg.base_price) }}</div>
            <div class="text-[11px] text-slate-500 mt-0.5">
              + ค่าบริการแพลตฟอร์ม 5% = ฿{{ fmt((pkg.base_price * 1.05).toFixed(2)) }}
            </div>
          </div>

          <RouterLink
            v-if="pkg.is_open && settings.is_commission_open"
            :to="`/commission/order?package_id=${pkg.package_id}`"
            class="block w-full text-center py-3 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10 transition-all"
          >
            เลือกแพ็กเกจนี้
          </RouterLink>
          <button v-else disabled class="w-full py-3 rounded-xl text-xs font-semibold bg-slate-800 text-slate-500 cursor-not-allowed">
            ปิดรับชั่วคราว
          </button>
        </div>
      </div>
    </div>

    <!-- Process Workflow Steps -->
    <div class="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
      <div class="text-center max-w-xl mx-auto mb-8">
        <span class="text-xs font-mono uppercase tracking-widest text-amber-400">Process</span>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-100 mt-1">4 ขั้นตอนการสั่งวาดภาพ</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div class="text-amber-400 font-mono font-bold text-sm mb-1">01</div>
          <h3 class="text-sm font-semibold text-slate-200 mb-1">เลือกแพ็กเกจ</h3>
          <p class="text-xs text-slate-400">เลือกสเกลงานวาดที่ต้องการ เช่น Headshot, ครึ่งตัว หรือเต็มตัว</p>
        </div>
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div class="text-amber-400 font-mono font-bold text-sm mb-1">02</div>
          <h3 class="text-sm font-semibold text-slate-200 mb-1">ระบุบรีฟรายละเอียด</h3>
          <p class="text-xs text-slate-400">บรรยายลักษณะ ท่าทาง โทนสี หรือแนบภาพอ้างอิงของตัวละคร</p>
        </div>
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div class="text-amber-400 font-mono font-bold text-sm mb-1">03</div>
          <h3 class="text-sm font-semibold text-slate-200 mb-1">ชำระเงินและแนบสลิป</h3>
          <p class="text-xs text-slate-400">สแกนชำระเงินผ่าน PromptPay QR Code และแนบหลักฐานการโอน</p>
        </div>
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div class="text-amber-400 font-mono font-bold text-sm mb-1">04</div>
          <h3 class="text-sm font-semibold text-slate-200 mb-1">ตรวจร่างและรับไฟล์</h3>
          <p class="text-xs text-slate-400">ติดตามขั้นตอนภาพร่าง และดาวน์โหลดไฟล์งานสมบูรณ์ความละเอียดสูง</p>
        </div>
      </div>

      <div class="text-center mt-8">
        <RouterLink
          to="/commission/order"
          class="inline-flex px-6 py-3 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md"
        >
          เริ่มต้นสั่งจ้างวาดภาพทันที
        </RouterLink>
      </div>
    </div>

  </div>
</template>
