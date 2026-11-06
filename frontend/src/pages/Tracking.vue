<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const route = useRoute()
const auth  = useAuthStore()

const commissions = ref([])
const selectedCommission = ref(null)
const loading = ref(true)

const steps = [
  { id: 1, name: 'รับคำสั่งซื้อ' },
  { id: 2, name: 'กำลังวาด' },
  { id: 3, name: 'ตรวจสอบงาน' },
  { id: 4, name: 'จัดส่งมอบงาน' },
]

function getStepProgress(comm) {
  if (!comm) return 2
  if (comm.work_status === 'เสร็จสมบูรณ์') return 4
  if (comm.draft_image) return 3
  if (comm.payment_status === 'approved') return 2
  return 1
}

async function fetchCommissions() {
  if (!auth.isLoggedIn) {
    loading.value = false
    return
  }
  try {
    const { data } = await api.get('/commissions/my')
    commissions.value = data
    if (commissions.value.length > 0) {
      const qId = route.query.commission_id
      if (qId) {
        selectedCommission.value = commissions.value.find(c => c.commission_id == qId) || commissions.value[0]
      } else {
        selectedCommission.value = commissions.value[0]
      }
    }
  } catch (err) {
    console.error('Fetch commissions error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCommissions()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Left Sidebar Menu (Matching Reference 1) -->
      <aside class="hidden lg:block lg:col-span-3 bg-white rounded-3xl p-4 border border-purple-100 shadow-soft sticky top-24">
        <div class="flex items-center gap-2 px-3 py-2 text-purple-950 font-bold text-base mb-2">
          <svg class="w-5 h-5 text-purple-600 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.49 2 2 6.49 2 12c0 4.41 3.59 8 8 8 .55 0 1-.45 1-1 0-.25-.09-.47-.26-.64-.17-.18-.27-.41-.27-.67 0-.55.45-1 1-1h1.53c4.41 0 8-3.59 8-8 0-5.51-4.49-10-10-10zm-5.5 8c-.83 0-1.5-.67-1.5-1.5S5.67 7 6.5 7s1.5.67 1.5 1.5S7.33 10 6.5 10zm3-3c-.83 0-1.5-.67-1.5-1.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 3c-.83 0-1.5-.67-1.5-1.5S16.67 7 17.5 7s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          <span>ArtSpace</span>
        </div>

        <nav class="space-y-1 text-xs font-semibold">
          <RouterLink to="/" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>🏠</span>
            <span>หน้าหลัก</span>
          </RouterLink>
          <RouterLink to="/shop" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>🛍️</span>
            <span>ร้านค้า</span>
          </RouterLink>
          <RouterLink to="/commission" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>✏️</span>
            <span>Commission</span>
          </RouterLink>
          <RouterLink to="/tracking" class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-100/90 text-purple-700 font-bold transition-colors">
            <span>📋</span>
            <span>ติดตามงาน</span>
          </RouterLink>
          <RouterLink to="/checkout" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>💳</span>
            <span>แจ้งชำระเงิน</span>
          </RouterLink>
          <RouterLink to="/profile" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>👤</span>
            <span>โปรไฟล์</span>
          </RouterLink>
        </nav>
      </aside>

      <!-- Main Tracking Content (Matching Reference 1 Tracking) -->
      <main class="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
        
        <div class="border-b border-purple-100 pb-4 flex items-center justify-between">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
              ติดตามสถานะงาน (Tracking)
            </h1>
            <p class="text-xs text-purple-600 font-medium mt-1">
              ตรวจสอบความคืบหน้าของคำสั่งจ้างวาดภาพแบบเรียลไทม์
            </p>
          </div>

          <!-- Selector if user has multiple commissions -->
          <div v-if="commissions.length > 1" class="text-xs">
            <select
              v-model="selectedCommission"
              class="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 font-bold outline-none cursor-pointer"
            >
              <option v-for="c in commissions" :key="c.commission_id" :value="c">
                งาน #{{ c.commission_id }} - {{ c.package_name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Stepper Timeline (Exact Reference Style) -->
        <div class="pt-4 pb-2">
          <div class="grid grid-cols-4 gap-2 relative">
            
            <!-- Step 1: รับคำสั่งซื้อ -->
            <div class="flex flex-col items-center text-center">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm mb-2 transition-all"
                :class="getStepProgress(selectedCommission) >= 1 ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'"
              >
                ✓
              </div>
              <span class="text-xs font-bold text-slate-800">รับคำสั่งซื้อ</span>
              <span class="text-[10px] text-purple-600 font-medium">(แล้ว)</span>
            </div>

            <!-- Step 2: กำลังวาด -->
            <div class="flex flex-col items-center text-center">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm mb-2 transition-all"
                :class="getStepProgress(selectedCommission) >= 2 ? 'bg-purple-600 text-white ring-4 ring-purple-100' : 'bg-slate-200 text-slate-500'"
              >
                ✓
              </div>
              <span class="text-xs font-bold text-slate-800">กำลังวาด</span>
              <span class="text-[10px] text-purple-600 font-medium">(ปัจจุบัน)</span>
            </div>

            <!-- Step 3: ตรวจสอบงาน -->
            <div class="flex flex-col items-center text-center">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all"
                :class="getStepProgress(selectedCommission) >= 3 ? 'bg-purple-600 text-white' : 'bg-slate-100 border border-purple-200 text-slate-400'"
              >
                {{ getStepProgress(selectedCommission) >= 3 ? '✓' : '3' }}
              </div>
              <span class="text-xs font-semibold text-slate-600">ตรวจสอบงาน</span>
            </div>

            <!-- Step 4: จัดส่งมอบงาน -->
            <div class="flex flex-col items-center text-center">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all"
                :class="getStepProgress(selectedCommission) >= 4 ? 'bg-purple-600 text-white' : 'bg-slate-100 border border-purple-200 text-slate-400'"
              >
                {{ getStepProgress(selectedCommission) >= 4 ? '✓' : '4' }}
              </div>
              <span class="text-xs font-semibold text-slate-600">จัดส่งมอบงาน</span>
            </div>

          </div>
        </div>

        <!-- Status Highlight Banner (Exact Reference Style) -->
        <div class="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center">
          <div class="text-sm font-bold text-emerald-800">
            สถานะปัจจุบัน : {{ selectedCommission?.work_status || 'กำลังวาดภาพ' }}
          </div>
          <div class="text-xs text-emerald-700 mt-1 font-medium">
            คาดว่าจะเสร็จสิ้นภายใน 3-5 วันทำการ
          </div>
        </div>

        <!-- Artist Update Card (Exact Reference Style) -->
        <div class="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start gap-4">
          <div class="w-12 h-12 rounded-full overflow-hidden bg-purple-200 border-2 border-white shadow-sm shrink-0">
            <img src="/images/art-anime-girl.jpg" alt="Yuki_Art" class="w-full h-full object-cover" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline justify-between gap-2">
              <h4 class="text-xs font-bold text-purple-950">
                ศิลปิน : Yuki_Art
              </h4>
              <span class="text-[10px] text-slate-400 font-mono">24 เม.ย. 2568 เวลา 14:30 น.</span>
            </div>
            <p class="text-xs text-slate-700 mt-1 leading-relaxed">
              กำลังดำเนินการวาดภาพให้อยู่นะครับ ✨ หากมีข้อสงสัยหรือต้องการปรับแก้สามารถแชทแจ้งสตูดิโอได้ตลอดเวลา
            </p>
          </div>
        </div>

      </main>

    </div>

  </div>
</template>
