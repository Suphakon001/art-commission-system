<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

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
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-primary mb-6">📦 จัดการคำสั่งซื้อ</h1>

    <!-- Filter -->
    <div class="flex gap-2 mb-5 flex-wrap">
      <button
        v-for="f in ['all', 'pending', 'approved', 'rejected']"
        :key="f"
        class="btn btn-sm"
        :class="filter === f ? 'btn-primary' : 'btn-outline'"
        @click="filter = f; fetchOrders()"
      >
        {{ f === 'all' ? 'ทั้งหมด' : statusMap[f]?.label }}
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="table table-zebra text-sm">
        <thead>
          <tr>
            <th>Order ID</th><th>ลูกค้า</th><th>ที่อยู่จัดส่ง</th><th>ราคา</th>
            <th>ค่าธรรมเนียม</th><th>ค่าจัดส่ง</th><th>ยอดรวม</th><th>สลิป</th>
            <th>สถานะชำระ</th><th>วันที่</th><th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o.order_id">
            <td>#{{ o.order_id }}</td>
            <td>
              <div class="font-semibold">{{ o.username }}</div>
              <div class="text-xs text-base-content/50">{{ o.email }}</div>
            </td>
            <td>
              <button
                v-if="o.shipping_name"
                class="btn btn-xs btn-outline btn-info gap-1"
                @click="viewingShipping = { ...o }"
              >
                📦 ดูที่อยู่
                <span v-if="o.tracking_number" class="badge badge-success badge-xs">ส่งแล้ว</span>
              </button>
              <span v-else class="text-xs text-base-content/40">-</span>
            </td>
            <td>฿{{ fmt(o.subtotal) }}</td>
            <td class="text-warning">฿{{ fmt(o.service_fee) }}</td>
            <td class="text-info">฿{{ fmt(o.shipping_fee != null ? o.shipping_fee : 50) }}</td>
            <td class="font-bold text-primary">฿{{ fmt(o.total_amount) }}</td>
            <td>
              <button
                v-if="o.slip_image"
                class="btn btn-xs btn-outline btn-primary gap-1"
                @click="viewingSlip = `/uploads/slips/${o.slip_image}`"
              >
                🔍 ดูสลิป
              </button>
              <span v-else class="text-base-content/40 text-xs">ไม่มี</span>
            </td>
            <td>
              <span :class="['badge badge-sm', statusMap[o.payment_status]?.cls]">
                {{ statusMap[o.payment_status]?.label }}
              </span>
            </td>
            <td class="text-xs">{{ fmtDate(o.created_at) }}</td>
            <td>
              <div v-if="o.payment_status === 'pending'" class="flex gap-1">
                <button class="btn btn-xs btn-success" @click="updateStatus(o.order_id, 'approved')">อนุมัติ</button>
                <button class="btn btn-xs btn-error"   @click="updateStatus(o.order_id, 'rejected')">ปฏิเสธ</button>
              </div>
              <span v-else class="text-xs text-base-content/40">—</span>
            </td>
          </tr>
        </tbody>
      </table>
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

