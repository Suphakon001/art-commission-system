<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import FeeCalculator from '@/components/FeeCalculator.vue'
import PromptPayQR from '@/components/PromptPayQR.vue'
import SlipUploader from '@/components/SlipUploader.vue'

const route  = useRoute()
const router = useRouter()

// Current Step in the 4-step wizard
const currentStep = ref(1)

// Form State
const packages    = ref([])
const selectedPkg = ref(null)
const addonOptions = ref([
  { id: 'bg',   label: 'วาดฉากหลังเพิ่มเติม (Simple Background)', price: 150, checked: false },
  { id: 'char', label: 'เพิ่มตัวละครในภาพ (+1 Character)',        price: 300, checked: false },
  { id: 'comm', label: 'ใช้งานเชิงพาณิชย์ (Commercial Use)',      price: 500, checked: false },
])
const customAddon = ref(0)
const brief       = ref('')
const refFile     = ref(null)
const refPreview  = ref(null)
const slipFile    = ref(null)

const loading       = ref(true)
const submitLoading = ref(false)
const error         = ref('')
const createdOrder  = ref(null)

// Price Computations
const basePrice = computed(() => parseFloat(selectedPkg.value?.base_price || 0))

const addonPrice = computed(() => {
  const optionsTotal = addonOptions.value
    .filter(o => o.checked)
    .reduce((sum, o) => sum + o.price, 0)
  return optionsTotal + (parseFloat(customAddon.value) || 0)
})

const baseAmount = computed(() => parseFloat((basePrice.value + addonPrice.value).toFixed(2)))
const serviceFee = computed(() => parseFloat((baseAmount.value * 0.05).toFixed(2)))
const totalAmount = computed(() => parseFloat((baseAmount.value + serviceFee.value).toFixed(2)))

function fmt(n) {
  return Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Reference Image Handler
function onRefChange(e) {
  const file = e.target.files?.[0]
  if (file) {
    refFile.value = file
    if (refPreview.value) URL.revokeObjectURL(refPreview.value)
    refPreview.value = URL.createObjectURL(file)
  }
}

function clearRef() {
  if (refPreview.value) URL.revokeObjectURL(refPreview.value)
  refPreview.value = null
  refFile.value = null
}

// Navigation between steps
function goToStep(step) {
  error.value = ''
  if (step > currentStep.value) {
    if (currentStep.value === 1 && !selectedPkg.value) {
      error.value = 'กรุณาเลือกแพ็กเกจที่ต้องการ'
      return
    }
    if (currentStep.value === 2 && !brief.value.trim()) {
      error.value = 'กรุณากรอกรายละเอียดงานภาพวาดในขั้นตอนที่ 2'
      return
    }
  }
  currentStep.value = step
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function nextStep() {
  error.value = ''
  if (currentStep.value === 1) {
    if (!selectedPkg.value) {
      error.value = 'กรุณาเลือกแพ็กเกจก่อนไปขั้นตอนถัดไป'
      return
    }
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    if (!brief.value.trim()) {
      error.value = 'กรุณากรอกรายละเอียดงานที่ต้องการ'
      return
    }
    currentStep.value = 3
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function prevStep() {
  error.value = ''
  if (currentStep.value > 1) {
    currentStep.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

async function fetchPackages() {
  loading.value = true
  try {
    const { data } = await api.get('/commissions/packages')
    packages.value = data.filter(p => p.is_open)
    const pid = parseInt(route.query.package_id)
    if (pid) {
      selectedPkg.value = packages.value.find(p => p.package_id === pid) || packages.value[0]
      if (route.query.step === '2') {
        currentStep.value = 2
      }
    } else {
      selectedPkg.value = packages.value[0]
    }
  } finally {
    loading.value = false
  }
}

async function submitOrder() {
  error.value = ''
  if (!slipFile.value) {
    error.value = '⚠️ กรุณาแนบรูปภาพสลิปการโอนเงินก่อนยืนยัน'
    return
  }

  submitLoading.value = true
  try {
    const form = new FormData()
    form.append('package_id',   selectedPkg.value.package_id)
    form.append('brief_detail', brief.value)
    form.append('addon_price',  addonPrice.value)
    if (refFile.value)  form.append('reference_image', refFile.value)
    if (slipFile.value) form.append('slip_image',      slipFile.value)

    const { data } = await api.post('/commissions', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    
    createdOrder.value = {
      id: data.commission_id,
      total: totalAmount.value,
      packageName: selectedPkg.value.package_name,
    }
    currentStep.value = 4 // Move to Step 4 (Success / Tracking)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล'
  } finally {
    submitLoading.value = false
  }
}

onMounted(fetchPackages)
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <!-- Title -->
    <div class="text-center mb-6">
      <h1 class="text-3xl font-extrabold text-primary">✏️ สั่งจ้างวาดภาพออนไลน์</h1>
      <p class="text-sm text-base-content/60 mt-1">
        ทำรายการทีละขั้นตอน พร้อมระบบคำนวณค่าธรรมเนียม 5% และสแกน QR Code จ่ายได้ทันที
      </p>
    </div>

    <!-- ── 4-STEP WIZARD STEPPER (INTERACTIVE) ── -->
    <div class="bg-base-200/60 p-4 sm:p-6 rounded-3xl mb-8 border border-base-300 shadow-sm">
      <h3 class="text-xs font-bold text-center uppercase tracking-wider text-primary mb-3">
        ขั้นตอนการสั่งจ้าง
      </h3>
      <ul class="steps steps-vertical sm:steps-horizontal w-full text-xs sm:text-sm">
        <li
          class="step cursor-pointer transition-all"
          :class="currentStep >= 1 ? 'step-primary font-bold' : 'text-base-content/50'"
          @click="goToStep(1)"
        >
          1. เลือกแพ็กเกจ
        </li>
        <li
          class="step cursor-pointer transition-all"
          :class="currentStep >= 2 ? 'step-primary font-bold' : 'text-base-content/50'"
          @click="goToStep(2)"
        >
          2. กรอกรายละเอียด
        </li>
        <li
          class="step cursor-pointer transition-all"
          :class="currentStep >= 3 ? 'step-primary font-bold' : 'text-base-content/50'"
          @click="goToStep(3)"
        >
          3. ชำระเงิน + แนบสลิป
        </li>
        <li
          class="step transition-all"
          :class="currentStep >= 4 ? 'step-primary font-bold' : 'text-base-content/50'"
        >
          4. รอรับผลงาน
        </li>
      </ul>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else>
      <!-- Error Alert -->
      <div v-if="error" class="alert alert-error text-sm mb-6 shadow-md">
        <span>{{ error }}</span>
      </div>

      <!-- ═════════════════════════════════════════════════════════════ -->
      <!-- STEP 1: เลือกแพ็กเกจ (PACKAGE SELECTION & ADD-ONS)           -->
      <!-- ═════════════════════════════════════════════════════════════ -->
      <div v-if="currentStep === 1" class="space-y-6 animate-fadeIn">
        <div class="flex items-center justify-between border-b pb-3">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <span class="badge badge-primary badge-lg">1</span>
            เลือกแพ็กเกจงานวาดที่ต้องการ
          </h2>
          <span class="text-xs text-base-content/60">ขั้นตอน 1 จาก 3</span>
        </div>

        <!-- Package Radio Cards -->
        <div class="grid sm:grid-cols-3 gap-4">
          <div
            v-for="pkg in packages"
            :key="pkg.package_id"
            class="card border-2 cursor-pointer transition-all duration-200 p-4 rounded-2xl relative"
            :class="selectedPkg?.package_id === pkg.package_id
              ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]'
              : 'border-base-200 hover:border-primary/40 bg-base-100 shadow-sm'"
            @click="selectedPkg = pkg"
          >
            <div class="flex justify-between items-start mb-2">
              <input
                type="radio"
                name="package"
                class="radio radio-primary radio-sm mt-1"
                :checked="selectedPkg?.package_id === pkg.package_id"
              />
              <span class="badge badge-primary badge-sm font-semibold">300 DPI</span>
            </div>
            <h3 class="font-bold text-base text-base-content">{{ pkg.package_name }}</h3>
            <p class="text-xs text-base-content/60 mt-1 line-clamp-2 min-h-[32px]">
              {{ pkg.description }}
            </p>
            <div class="mt-4 pt-3 border-t border-base-200">
              <span class="text-xs text-base-content/50 block">ราคาเริ่มต้น</span>
              <span class="text-xl font-extrabold text-primary">฿{{ fmt(pkg.base_price) }}</span>
            </div>
          </div>
        </div>

        <!-- Add-on Options -->
        <div class="card bg-base-100 border border-base-200 shadow-sm p-5 rounded-2xl">
          <h3 class="font-bold text-sm text-base-content mb-3 flex items-center gap-1.5">
            ✨ บริการเพิ่มเติม (Add-on Options)
          </h3>
          <div class="space-y-2.5">
            <label
              v-for="opt in addonOptions"
              :key="opt.id"
              class="flex items-center justify-between p-3 rounded-xl border border-base-200 hover:bg-base-200/40 cursor-pointer transition-colors"
            >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  v-model="opt.checked"
                  class="checkbox checkbox-primary checkbox-sm"
                />
                <span class="text-sm font-medium">{{ opt.label }}</span>
              </div>
              <span class="text-sm font-bold text-secondary">+฿{{ fmt(opt.price) }}</span>
            </label>

            <!-- Custom Add-on Input -->
            <div class="pt-2 flex items-center gap-3">
              <span class="text-xs text-base-content/70">ค่าเพิ่มเติมอื่นๆ ตามที่ตกลง (ถ้ามี):</span>
              <div class="relative w-36">
                <span class="absolute left-3 top-2 text-xs text-base-content/50">฿</span>
                <input
                  v-model.number="customAddon"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="0"
                  class="input input-bordered input-sm w-full pl-7"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Real-time Cost Breakdown -->
        <FeeCalculator :base-price="basePrice" :addon-price="addonPrice" />

        <!-- Next Button -->
        <button
          type="button"
          class="btn btn-primary btn-lg w-full gap-2 shadow-lg"
          @click="nextStep"
        >
          ขั้นตอนต่อไป: กรอกรายละเอียดงาน (2) →
        </button>
      </div>

      <!-- ═════════════════════════════════════════════════════════════ -->
      <!-- STEP 2: กรอกรายละเอียด (BRIEF & REFERENCE IMAGES)            -->
      <!-- ═════════════════════════════════════════════════════════════ -->
      <div v-if="currentStep === 2" class="space-y-6 animate-fadeIn">
        <div class="flex items-center justify-between border-b pb-3">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <span class="badge badge-primary badge-lg">2</span>
            กรอกรายละเอียดภาพที่ต้องการ
          </h2>
          <span class="text-xs text-base-content/60">ขั้นตอน 2 จาก 3</span>
        </div>

        <!-- Selected package summary bar -->
        <div class="flex items-center justify-between bg-primary/10 p-3.5 rounded-2xl border border-primary/20">
          <div>
            <span class="text-xs text-primary font-semibold block">แพ็กเกจที่เลือก:</span>
            <span class="font-bold text-sm">{{ selectedPkg?.package_name }}</span>
          </div>
          <button type="button" class="btn btn-ghost btn-xs text-primary underline" @click="goToStep(1)">
            เปลี่ยนแพ็กเกจ
          </button>
        </div>

        <!-- Brief Detail -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-bold text-base">
              รายละเอียดงานวาด (Brief Details) <span class="text-error">*</span>
            </span>
          </label>
          <textarea
            v-model="brief"
            rows="6"
            class="textarea textarea-bordered text-sm leading-relaxed rounded-2xl"
            placeholder="อธิบายตัวละครและภาพวาด เช่น:
- เพศ, รูปร่าง, ทรงผม, สีผม, สีตา
- เสื้อผ้าและเครื่องแต่งกาย
- ท่าทาง (Action / Pose) และอารมณ์สีหน้า
- โทนสีและบรรยากาศโดยรวม"
            required
          ></textarea>
          <label class="label">
            <span class="label-text-alt text-base-content/50">ยิ่งอธิบายละเอียด นักวาดยิ่งวาดได้ตรงใจคุณมากขึ้นครับ</span>
          </label>
        </div>

        <!-- Reference Image Upload with Preview -->
        <div class="card bg-base-100 border border-base-200 p-5 rounded-2xl shadow-sm">
          <label class="label pt-0 pb-2">
            <span class="label-text font-bold text-sm">
              ภาพอ้างอิงตัวละครหรือท่าทาง (Reference Image)
            </span>
            <span class="label-text-alt text-base-content/50">ถ้ามี (ไม่บังคับ)</span>
          </label>

          <!-- Hidden input -->
          <input
            id="refFileInput"
            type="file"
            accept=".png,.jpg,.jpeg"
            class="hidden"
            @change="onRefChange"
          />

          <!-- Upload Dropzone -->
          <div
            v-if="!refPreview"
            class="border-2 border-dashed border-base-300 hover:border-primary/60 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-base-200/40"
            onclick="document.getElementById('refFileInput').click()"
          >
            <div class="text-3xl mb-2">🖼️</div>
            <p class="font-semibold text-sm">คลิกเพื่อเลือกรูปภาพอ้างอิง</p>
            <p class="text-xs text-base-content/50 mt-0.5">ไฟล์ PNG, JPG ขนาดไม่เกิน 10 MB</p>
          </div>

          <!-- Active Preview -->
          <div
            v-else
            class="flex items-center gap-4 bg-base-200/60 p-3.5 rounded-2xl border border-base-300"
          >
            <img :src="refPreview" alt="Ref" class="w-20 h-20 object-cover rounded-xl shadow-sm" />
            <div class="flex-1">
              <span class="badge badge-success badge-xs mb-1">เลือกรูปแล้ว</span>
              <p class="text-xs font-semibold line-clamp-1">{{ refFile?.name }}</p>
              <div class="flex gap-2 mt-2">
                <button
                  type="button"
                  class="btn btn-outline btn-xs"
                  onclick="document.getElementById('refFileInput').click()"
                >
                  เปลี่ยนรูป
                </button>
                <button
                  type="button"
                  class="btn btn-error btn-outline btn-xs"
                  @click="clearRef"
                >
                  ลบรูป
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex gap-3">
          <button
            type="button"
            class="btn btn-outline flex-1 rounded-xl"
            @click="prevStep"
          >
            ← ย้อนกลับ
          </button>
          <button
            type="button"
            class="btn btn-primary flex-1 rounded-xl shadow-md gap-2"
            @click="nextStep"
          >
            ขั้นตอนต่อไป: ชำระเงิน (3) →
          </button>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════════════ -->
      <!-- STEP 3: ชำระเงิน + แนบสลิป (QR PAYMENT & SLIP UPLOAD)       -->
      <!-- ═════════════════════════════════════════════════════════════ -->
      <div v-if="currentStep === 3" class="space-y-6 animate-fadeIn">
        <div class="flex items-center justify-between border-b pb-3">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <span class="badge badge-primary badge-lg">3</span>
            ชำระเงินและแนบสลิปโอนเงิน
          </h2>
          <span class="text-xs text-base-content/60">ขั้นตอน 3 จาก 3</span>
        </div>

        <!-- Order Summary Card -->
        <div class="card bg-base-100 border border-base-200 shadow-sm p-4 rounded-2xl space-y-2 text-sm">
          <h3 class="font-bold text-base text-primary">สรุปคำสั่งจ้าง</h3>
          <div class="flex justify-between">
            <span class="text-base-content/70">แพ็กเกจ</span>
            <span class="font-semibold">{{ selectedPkg?.package_name }} (฿{{ fmt(basePrice) }})</span>
          </div>
          <div v-if="addonPrice > 0" class="flex justify-between">
            <span class="text-base-content/70">ค่าบริการเพิ่มเติม (Add-ons)</span>
            <span>฿{{ fmt(addonPrice) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-base-content/70">ค่าธรรมเนียมบริการ (5%)</span>
            <span class="text-warning font-semibold">฿{{ fmt(serviceFee) }}</span>
          </div>
          <div class="divider my-1"></div>
          <div class="flex justify-between font-extrabold text-base">
            <span>ยอดชำระสุทธิ</span>
            <span class="text-primary text-xl">฿{{ fmt(totalAmount) }}</span>
          </div>
        </div>

        <!-- Official PromptPay QR Code Component -->
        <PromptPayQR
          :amount="totalAmount"
          account-name="นาย ศุภกร ศุภลา"
          promptpay-id="0823247377"
        />

        <!-- Interactive Slip Uploader Component -->
        <SlipUploader v-model="slipFile" :required="true" />

        <!-- Navigation Buttons -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            class="btn btn-outline flex-1 rounded-xl"
            @click="prevStep"
            :disabled="submitLoading"
          >
            ← ย้อนกลับ
          </button>
          <button
            type="button"
            class="btn btn-primary btn-lg flex-1 rounded-xl shadow-xl gap-2"
            @click="submitOrder"
            :disabled="submitLoading"
          >
            <span v-if="submitLoading" class="loading loading-spinner loading-sm"></span>
            <span v-else>🚀 ยืนยันคำสั่งจ้าง (ส่งสลิป)</span>
          </button>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════════════ -->
      <!-- STEP 4: รอรับผลงาน (SUCCESS & PROGRESS TRACKING)             -->
      <!-- ═════════════════════════════════════════════════════════════ -->
      <div v-if="currentStep === 4 && createdOrder" class="space-y-6 text-center animate-fadeIn py-6">
        <div class="w-20 h-20 mx-auto rounded-full bg-success/20 text-success flex items-center justify-center text-4xl shadow-inner">
          🎉
        </div>

        <div>
          <h2 class="text-3xl font-extrabold text-success">ส่งคำสั่งจ้างวาดภาพเรียบร้อยแล้ว!</h2>
          <p class="text-sm text-base-content/70 mt-1">
            หมายเลขคำสั่งจ้างของคุณ: <strong class="text-primary font-mono text-lg">#{{ createdOrder.id }}</strong>
          </p>
        </div>

        <!-- Work Progress Pipeline Display -->
        <div class="card bg-base-100 border border-base-200 shadow-md p-6 rounded-3xl max-w-lg mx-auto text-left">
          <h3 class="font-bold text-sm text-base-content mb-4 text-center">
            สถานะการดำเนินการ (Workflow Progress)
          </h3>
          <ul class="steps steps-vertical w-full text-xs">
            <li class="step step-primary font-bold">
              1. ส่งคำสั่งจ้างและสลิปเรียบร้อยแล้ว
            </li>
            <li class="step step-primary font-bold">
              2. แอดมินกำลังตรวจสอบสลิปและจัดคิว
            </li>
            <li class="step text-base-content/50">
              3. เริ่มร่างภาพ (Draft) และส่งให้ตรวจ
            </li>
            <li class="step text-base-content/50">
              4. ตัดเส้น/ลงสีสมบูรณ์ และส่งมอบไฟล์ 300 DPI
            </li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
          <RouterLink to="/my-commissions" class="btn btn-primary flex-1 rounded-xl shadow-md">
            📋 ไปที่หน้ารายการงานจ้างของฉัน
          </RouterLink>
          <RouterLink to="/shop" class="btn btn-outline flex-1 rounded-xl">
            🎨 เลือกดูภาพในร้านต่อ
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
