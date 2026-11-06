<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import AdminSidebar from '@/components/AdminSidebar.vue'

const commissions = ref([])
const loading     = ref(true)
const filterPay   = ref('all')
const filterWork  = ref('all')

const paymentMap = {
  pending:  { label: 'รอตรวจสอบ', cls: 'badge-warning' },
  approved: { label: 'อนุมัติแล้ว', cls: 'badge-success' },
  rejected: { label: 'ปฏิเสธ',     cls: 'badge-error'   },
}

const workStatuses = ['รอคิว', 'ร่างภาพ', 'ตัดเส้น/ลงสี', 'เสร็จสมบูรณ์']

function fmt(n) {
  return Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function fetchCommissions() {
  loading.value = true
  try {
    const params = { limit: 100 }
    if (filterPay.value  !== 'all') params.payment_status = filterPay.value
    if (filterWork.value !== 'all') params.work_status    = filterWork.value
    const { data } = await api.get('/commissions', { params })
    commissions.value = data.data
  } finally {
    loading.value = false
  }
}

async function updatePayment(id, status) {
  try {
    await api.patch(`/commissions/${id}/status`, { payment_status: status })
    await fetchCommissions()
  } catch (err) {
    alert(err.response?.data?.message || 'เกิดข้อผิดพลาด')
  }
}

async function updateWork(id, status) {
  try {
    await api.patch(`/commissions/${id}/status`, { work_status: status })
    await fetchCommissions()
  } catch (err) {
    alert(err.response?.data?.message || 'เกิดข้อผิดพลาด')
  }
}

// Upload draft / final
const uploadTarget = ref(null) // { id, type: 'draft'|'final' }
const uploadFile   = ref(null)
const uploading    = ref(false)
const viewingSlip  = ref(null)

function startUpload(id, type) {
  uploadTarget.value = { id, type }
  uploadFile.value   = null
}

async function doUpload() {
  if (!uploadFile.value || !uploadTarget.value) return
  uploading.value = true
  const fd = new FormData()
  const { id, type } = uploadTarget.value
  const field = type === 'draft' ? 'draft_image' : 'final_file'
  fd.append(field, uploadFile.value)
  try {
    await api.patch(`/commissions/${id}/upload-${type}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    uploadTarget.value = null
    await fetchCommissions()
  } catch (err) {
    alert(err.response?.data?.message || 'เกิดข้อผิดพลาด')
  } finally {
    uploading.value = false
  }
}

onMounted(fetchCommissions)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <AdminSidebar />

      <main class="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
              จัดการคิวงาน (Manage Commissions)
            </h1>
            <p class="text-xs text-purple-600 font-medium mt-1">
              ตรวจสอบสถานะงานจ้างวาดภาพ อนุมัติสลิป และส่งมอบไฟล์งาน
            </p>
          </div>

          <!-- Filters -->
          <div class="flex flex-wrap gap-2">
            <div class="flex gap-1">
              <button
                v-for="f in ['all','pending','approved','rejected']"
                :key="f"
                class="px-3 py-1 rounded-full text-xs font-bold transition-all"
                :class="filterPay===f ? 'bg-purple-700 text-white shadow-sm' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'"
                @click="filterPay=f; fetchCommissions()"
              >
                {{ f==='all' ? 'ชำระทั้งหมด' : paymentMap[f]?.label }}
              </button>
            </div>
          </div>
        </div>

    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Upload modal -->
    <dialog v-if="uploadTarget" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-3">
          อัปโหลด{{ uploadTarget.type==='draft'?'ภาพร่าง':'ไฟล์งานสุดท้าย' }}
          (#{{ uploadTarget.id }})
        </h3>
        <input type="file" accept=".png,.jpg,.jpeg" class="file-input file-input-bordered w-full"
          @change="e => uploadFile = e.target.files[0]" />
        <div class="modal-action">
          <button class="btn" @click="uploadTarget=null">ยกเลิก</button>
          <button class="btn btn-primary" @click="doUpload" :disabled="!uploadFile||uploading">
            <span v-if="uploading" class="loading loading-spinner loading-sm"></span>
            <span v-else>อัปโหลด</span>
          </button>
        </div>
      </div>
    </dialog>

    <div v-else class="space-y-4">
      <div v-for="c in commissions" :key="c.commission_id"
        class="card bg-base-100 shadow border border-base-200 p-5">
        <div class="grid md:grid-cols-3 gap-4">
          <!-- Info -->
          <div class="col-span-2 space-y-1">
            <div class="flex flex-wrap gap-2 items-center">
              <span class="font-bold">#{{ c.commission_id }}</span>
              <span :class="['badge badge-sm', paymentMap[c.payment_status]?.cls]">{{ paymentMap[c.payment_status]?.label }}</span>
              <span class="badge badge-sm badge-ghost">{{ c.work_status }}</span>
            </div>
            <p class="font-semibold">{{ c.package_name }}</p>
            <p class="text-sm text-base-content/70">ลูกค้า: {{ c.username }} ({{ c.email }})</p>
            <p class="text-sm text-base-content/60 mt-1 line-clamp-3">{{ c.brief_detail }}</p>
            <p class="text-xs text-base-content/40">{{ fmtDate(c.created_at) }}</p>
            <div v-if="c.reference_image" class="mt-2">
              <a :href="c.reference_image.startsWith('data:') ? c.reference_image : `/uploads/references/${c.reference_image}`" target="_blank" class="btn btn-xs btn-outline">ดูภาพอ้างอิง</a>
            </div>
            <div v-if="c.slip_image" class="mt-1">
              <button
                class="btn btn-xs btn-outline btn-primary gap-1"
                @click="viewingSlip = c.slip_image.startsWith('data:') ? c.slip_image : `/uploads/slips/${c.slip_image}`"
              >
                🔍 ดูสลิป
              </button>
            </div>
          </div>

          <!-- Pricing & Actions -->
          <div class="space-y-3">
            <div class="text-sm space-y-1">
              <div class="flex justify-between"><span>ค่าจ้าง</span><span>฿{{ fmt(c.base_amount) }}</span></div>
              <div class="flex justify-between text-warning"><span>ค่าธรรมเนียม 5%</span><span>฿{{ fmt(c.service_fee) }}</span></div>
              <div class="flex justify-between font-bold text-primary"><span>รวม</span><span>฿{{ fmt(c.total_amount) }}</span></div>
            </div>

            <!-- Payment approval -->
            <div v-if="c.payment_status === 'pending'" class="flex gap-1">
              <button class="btn btn-xs btn-success flex-1" @click="updatePayment(c.commission_id, 'approved')">อนุมัติสลิป</button>
              <button class="btn btn-xs btn-error flex-1"   @click="updatePayment(c.commission_id, 'rejected')">ปฏิเสธ</button>
            </div>

            <!-- Work status -->
            <div v-if="c.payment_status === 'approved'">
              <select class="select select-bordered select-sm w-full"
                :value="c.work_status"
                @change="updateWork(c.commission_id, $event.target.value)">
                <option v-for="ws in workStatuses" :key="ws" :value="ws">{{ ws }}</option>
              </select>
            </div>

            <!-- Upload buttons -->
            <div v-if="c.payment_status === 'approved'" class="flex gap-1 flex-wrap">
              <button class="btn btn-xs btn-info flex-1" @click="startUpload(c.commission_id, 'draft')">อัปโหลดร่าง</button>
              <button class="btn btn-xs btn-success flex-1" @click="startUpload(c.commission_id, 'final')">อัปโหลดงานจริง</button>
            </div>

            <!-- Draft preview -->
            <div v-if="c.draft_image">
              <p class="text-xs font-semibold mb-1">ภาพร่างล่าสุด:</p>
              <img :src="c.draft_image.startsWith('data:') ? c.draft_image : `/uploads/drafts/${c.draft_image}`" class="rounded max-h-28 object-contain border border-base-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </main>
  </div>

    <!-- Slip Viewer Modal -->
    <dialog :class="['modal', viewingSlip ? 'modal-open' : '']">
      <div class="modal-box max-w-lg p-5">
        <h3 class="font-bold text-lg mb-3 flex items-center justify-between">
          <span>🧾 ตรวจสอบสลิปการโอนเงิน</span>
          <button class="btn btn-sm btn-circle btn-ghost" @click="viewingSlip = null">✕</button>
        </h3>
        <div v-if="viewingSlip" class="bg-base-200 rounded-2xl p-2 flex justify-center items-center overflow-hidden border border-base-300">
          <img :src="viewingSlip" alt="Slip" class="max-h-[70vh] w-auto object-contain rounded-xl" />
        </div>
        <div class="modal-action mt-4">
          <a :href="viewingSlip" target="_blank" class="btn btn-sm btn-outline">เปิดรูปเต็มจอ ↗</a>
          <button class="btn btn-sm btn-primary" @click="viewingSlip = null">ปิด</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="viewingSlip = null"><button></button></form>
    </dialog>
  </div>
</template>

