<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const router = useRouter()
const auth   = useAuthStore()

const packages    = ref([])
const settings    = ref({ is_commission_open: true, max_queue: 5 })
const loading     = ref(false)
const submitting  = ref(false)
const error       = ref('')
const success     = ref('')

const form = ref({
  package_id: '',
  brief_detail: '',
  budget: '฿ 1,000 - 2,000',
  reference_file: null,
})

const fileName = ref('ไม่ได้เลือกไฟล์')

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    form.value.reference_file = file
    fileName.value = file.name
  } else {
    form.value.reference_file = null
    fileName.value = 'ไม่ได้เลือกไฟล์'
  }
}

async function fetchInitial() {
  try {
    const [pkgRes, setRes] = await Promise.all([
      api.get('/commissions/packages'),
      api.get('/settings'),
    ])
    packages.value = pkgRes.data
    settings.value = setRes.data
    if (packages.value.length > 0) {
      form.value.package_id = packages.value[1]?.package_id || packages.value[0].package_id
    }
  } catch (err) {
    console.error('Fetch packages error:', err)
  }
}

async function submitCommission() {
  error.value = ''
  success.value = ''

  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }

  if (!form.value.brief_detail.trim()) {
    error.value = 'กรุณาระบุรายละเอียดงานที่ต้องการ'
    return
  }

  if (!form.value.package_id) {
    error.value = 'กรุณาเลือกประเภทงาน'
    return
  }

  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('package_id', form.value.package_id)
    fd.append('brief_detail', form.value.brief_detail)
    fd.append('addon_price', '0')
    if (form.value.reference_file) {
      fd.append('reference_image', form.value.reference_file)
    }

    const { data } = await api.post('/commissions', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    success.value = 'ส่งคำสั่งจ้างงานสำเร็จ! ระบบกำลังนำคุณไปยังหน้าติดตามสถานะงาน...'
    setTimeout(() => {
      router.push(`/tracking?commission_id=${data.commission_id}`)
    }, 1200)
  } catch (err) {
    error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งคำสั่งจ้างงาน'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchInitial()
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
          <RouterLink to="/commission" class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-100/90 text-purple-700 font-bold transition-colors">
            <span>✏️</span>
            <span>Commission</span>
          </RouterLink>
          <RouterLink to="/tracking" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
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

      <!-- Main Commission Form (Matching Reference 1 Commission) -->
      <main class="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
        
        <div class="border-b border-purple-100 pb-4">
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
            แบบฟอร์มสั่งจ้างวาดภาพ (Commission)
          </h1>
          <p class="text-xs text-purple-600 font-medium mt-1">
            กรอกรายละเอียดความต้องการเพื่อให้ศิลปินประเมินและเริ่มร่างผลงาน
          </p>
        </div>

        <div v-if="error" class="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {{ error }}
        </div>

        <div v-if="success" class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          {{ success }}
        </div>

        <!-- 2 Columns Layout: Left Mascot + Right Form (Exact Reference Style) -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <!-- Left: Mascot Illustration -->
          <div class="md:col-span-5 flex justify-center">
            <div class="relative w-full max-w-[280px] aspect-[4/5] rounded-3xl overflow-hidden bg-purple-50 border border-purple-100 shadow-sm">
              <img
                src="/images/art-anime-girl.jpg"
                alt="Artist Mascot"
                class="w-full h-full object-cover"
                @error="$event.target.src='/images/reference-home.jpg'"
              />
              <div class="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md rounded-2xl p-2.5 text-center text-xs text-purple-950 font-bold border border-purple-100 shadow-sm">
                Yuki_Art Studio
              </div>
            </div>
          </div>

          <!-- Right: Form Fields -->
          <form @submit.prevent="submitCommission" class="md:col-span-7 space-y-4 text-xs">
            
            <!-- รายละเอียดงาน * -->
            <div>
              <label class="block font-bold text-slate-800 mb-1">
                รายละเอียดงาน <span class="text-rose-500">*</span>
              </label>
              <textarea
                v-model="form.brief_detail"
                rows="4"
                placeholder="อธิบายรายละเอียดภาพของคุณ เช่น ท่าทาง โทนสี อารมณ์ภาพ หรือฉากหลัง..."
                class="w-full p-3 rounded-2xl bg-purple-50/40 border border-purple-100 focus:bg-white focus:border-purple-500 outline-none text-xs text-slate-800 transition-colors"
                required
              ></textarea>
            </div>

            <!-- อัปโหลดไฟล์อ้างอิง (ถ้ามี) -->
            <div>
              <label class="block font-bold text-slate-800 mb-1">
                อัปโหลดไฟล์อ้างอิง (ถ้ามี)
              </label>
              <div class="flex items-center gap-2">
                <label class="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold cursor-pointer transition-colors shrink-0">
                  <span>เลือกไฟล์</span>
                  <input type="file" @change="onFileChange" accept="image/*" class="hidden" />
                </label>
                <span class="text-slate-500 truncate">{{ fileName }}</span>
              </div>
            </div>

            <!-- ประเภทงาน -->
            <div>
              <label class="block font-bold text-slate-800 mb-1">
                ประเภทงาน
              </label>
              <select
                v-model="form.package_id"
                class="w-full px-3 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-100 focus:bg-white focus:border-purple-500 outline-none text-xs text-slate-800 cursor-pointer"
              >
                <option v-for="pkg in packages" :key="pkg.package_id" :value="pkg.package_id">
                  {{ pkg.package_name }} (เริ่มต้น ฿ {{ Number(pkg.base_price).toLocaleString('th-TH') }})
                </option>
              </select>
            </div>

            <!-- งบประมาณโดยประมาณ (บาท) -->
            <div>
              <label class="block font-bold text-slate-800 mb-1">
                งบประมาณโดยประมาณ (บาท)
              </label>
              <select
                v-model="form.budget"
                class="w-full px-3 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-100 focus:bg-white focus:border-purple-500 outline-none text-xs text-slate-800 cursor-pointer"
              >
                <option value="฿ 500 - 1,000">฿ 500 - 1,000</option>
                <option value="฿ 1,000 - 2,000">฿ 1,000 - 2,000</option>
                <option value="฿ 2,000 - 3,500">฿ 2,000 - 3,500</option>
                <option value="฿ 3,500 ขึ้นไป">฿ 3,500 ขึ้นไป</option>
              </select>
            </div>

            <!-- Submit Button (Exact Reference Button) -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="submitting"
                class="w-full py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
                <span>ส่งคำสั่งจ้างงาน</span>
              </button>
            </div>

          </form>

        </div>

      </main>

    </div>

  </div>
</template>
