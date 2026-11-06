<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import AdminSidebar from '@/components/AdminSidebar.vue'

const orders  = ref([])
const loading = ref(true)
const filter  = ref('all')
const viewingSlip = ref(null) // selected slip image url
const viewingShipping = ref(null) // selected order for shipping info

const statusMap = {
  pending:  { label: 'รอตรวจสอบ', cls: 'badge-warning' },
  approved: { label: 'อนุมัติแล้ว', cls: 'badge-success' },
  rejected: { label: 'ปฏิเสธ',     cls: 'badge-error'   },
}

function fmt(n) {
  return Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function fetchOrders() {
  loading.value = true
  try {
    const params = filter.value !== 'all' ? { status: filter.value, limit: 100 } : { limit: 100 }
    const { data } = await api.get('/orders', { params })
    orders.value = data.data
  } finally {
    loading.value = false
  }
}

async function updateStatus(orderId, status) {
  try {
    await api.patch(`/orders/${orderId}/status`, { payment_status: status })
    await fetchOrders()
  } catch (err) {
    alert(err.response?.data?.message || 'เกิดข้อผิดพลาด')
  }
}

async function saveTracking() {
  if (!viewingShipping.value) return
  try {
    await api.patch(`/orders/${viewingShipping.value.order_id}/status`, {
      tracking_number: viewingShipping.value.tracking_number,
      shipping_status: viewingShipping.value.tracking_number ? 'shipped' : 'pending',
    })
    alert('บันทึกข้อมูลการจัดส่งสำเร็จ!')
    viewingShipping.value = null
    await fetchOrders()
  } catch (err) {
    alert(err.response?.data?.message || 'เกิดข้อผิดพลาด')
  }
}

onMounted(fetchOrders)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <AdminSidebar />

      <main class="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
              จัดการคำสั่งซื้อ (Manage Orders)
            </h1>
            <p class="text-xs text-purple-600 font-medium mt-1">
              ตรวจสอบสลิปโอนเงิน อนุมัติการชำระเงิน และอัปเดตเลขพัสดุ
            </p>
          </div>

          <!-- Filter -->
          <div class="flex gap-1.5 flex-wrap">
            <button
              v-for="f in ['all', 'pending', 'approved', 'rejected']"
              :key="f"
              class="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              :class="filter === f ? 'bg-purple-700 text-white shadow-sm' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'"
              @click="filter = f; fetchOrders()"
            >
              {{ f === 'all' ? 'ทั้งหมด' : statusMap[f]?.label }}
            </button>
          </div>
        </div>

        <div v-if="loading" class="flex justify-center py-16 text-purple-600">
          <div class="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr class="border-b border-purple-100 text-slate-500 font-bold text-xs uppercase">
                <th class="py-3 px-2">Order ID</th>
                <th class="py-3 px-2">ลูกค้า</th>
                <th class="py-3 px-2">ที่อยู่จัดส่ง</th>
                <th class="py-3 px-2">ยอดรวม</th>
                <th class="py-3 px-2 text-center">สลิป</th>
                <th class="py-3 px-2 text-center">สถานะ</th>
                <th class="py-3 px-2">วันที่</th>
                <th class="py-3 px-2 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-purple-50">
              <tr v-for="o in orders" :key="o.order_id" class="hover:bg-purple-50/40 transition-colors">
                <td class="py-3 px-2 font-mono font-bold text-slate-900">#{{ o.order_id }}</td>
                <td class="py-3 px-2">
                  <div class="font-bold text-slate-900">{{ o.username }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ o.email }}</div>
                </td>
                <td class="py-3 px-2">
                  <button
                    v-if="o.shipping_name"
                    class="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs"
                    @click="viewingShipping = { ...o }"
                  >
                    📦 ดูที่อยู่
                    <span v-if="o.tracking_number" class="ml-1 text-emerald-600 font-bold">✓ ส่งแล้ว</span>
                  </button>
                  <span v-else class="text-slate-400">-</span>
                </td>
                <td class="py-3 px-2 font-bold font-mono text-purple-700 whitespace-nowrap">฿{{ fmt(o.total_amount) }}</td>
                <td class="py-3 px-2 text-center">
                  <button
                    v-if="o.slip_image"
                    class="px-2.5 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs"
                    @click="viewingSlip = o.slip_image.startsWith('data:') ? o.slip_image : `/uploads/slips/${o.slip_image}`"
                  >
                    🔍 ดูสลิป
                  </button>
                  <span v-else class="text-slate-400 text-xs">ไม่มี</span>
                </td>
                <td class="py-3 px-2 text-center">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    :class="o.payment_status === 'approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : o.payment_status === 'rejected'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'"
                  >
                    {{ statusMap[o.payment_status]?.label }}
                  </span>
                </td>
                <td class="py-3 px-2 text-[10px] text-slate-400 font-mono whitespace-nowrap">{{ fmtDate(o.created_at) }}</td>
                <td class="py-3 px-2 text-center">
                  <div v-if="o.payment_status === 'pending'" class="inline-flex gap-1">
                    <button class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700" @click="updateStatus(o.order_id, 'approved')">อนุมัติ</button>
                    <button class="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700" @click="updateStatus(o.order_id, 'rejected')">ปฏิเสธ</button>
                  </div>
                  <span v-else class="text-slate-400 text-xs">—</span>
                </td>
              </tr>
            </tbody>
          </table>
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

    <!-- Shipping Address & Tracking Modal -->
    <dialog :class="['modal', viewingShipping ? 'modal-open' : '']">
      <div class="modal-box max-w-md p-5" v-if="viewingShipping">
        <h3 class="font-bold text-lg mb-3 flex items-center justify-between">
          <span>📦 ข้อมูลการจัดส่งพัสดุ (#{{ viewingShipping.order_id }})</span>
          <button class="btn btn-sm btn-circle btn-ghost" @click="viewingShipping = null">✕</button>
        </h3>
        
        <div class="space-y-3 text-xs bg-base-200/50 p-4 rounded-2xl border border-base-300">
          <div>
            <span class="font-bold text-base-content/60 block mb-0.5">ชื่อ-นามสกุล ผู้รับ:</span>
            <span class="text-sm font-semibold">{{ viewingShipping.shipping_name }}</span>
          </div>
          <div>
            <span class="font-bold text-base-content/60 block mb-0.5">เบอร์โทรศัพท์ติดต่อ:</span>
            <span class="text-sm font-semibold text-primary">{{ viewingShipping.shipping_phone }}</span>
          </div>
          <div>
            <span class="font-bold text-base-content/60 block mb-0.5">ที่อยู่สำหรับจัดส่ง:</span>
            <p class="text-xs leading-relaxed bg-base-100 p-2.5 rounded-xl border border-base-200">
              {{ viewingShipping.shipping_address }}
            </p>
          </div>
        </div>

        <div class="form-control mt-4">
          <label class="label pb-1"><span class="label-text font-bold text-xs">🚚 เลขพัสดุจัดส่ง (Tracking Number)</span></label>
          <input
            v-model="viewingShipping.tracking_number"
            type="text"
            placeholder="เช่น ED123456789TH หรือ Flash/Kerry"
            class="input input-bordered input-sm"
          />
        </div>

        <div class="modal-action mt-4">
          <button class="btn btn-sm btn-ghost" @click="viewingShipping = null">ปิด</button>
          <button class="btn btn-sm btn-primary" @click="saveTracking">บันทึกเลขพัสดุ</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="viewingShipping = null"><button></button></form>
    </dialog>
  </div>
</template>

