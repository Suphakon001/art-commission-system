<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'

const route   = useRoute()
const orders  = ref([])
const loading = ref(true)
const successId = route.query.success

const statusMap = {
  pending:  { label: 'รอตรวจสอบ', cls: 'badge-warning' },
  approved: { label: 'อนุมัติแล้ว', cls: 'badge-success' },
  rejected: { label: 'ปฏิเสธ',     cls: 'badge-error'   },
}

function fmt(n) {
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try {
    const { data } = await api.get('/orders/my')
    orders.value = data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-3xl font-bold text-primary mb-2">📦 คำสั่งซื้อของฉัน</h1>

    <div v-if="successId" class="alert alert-success mb-6">
      ✅ สั่งซื้อสำเร็จ! (Order #{{ successId }}) รอการตรวจสอบสลิปจาก Admin
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-16 text-base-content/50">
      <div class="text-5xl mb-3">📦</div>
      <p>ยังไม่มีคำสั่งซื้อ</p>
      <RouterLink to="/shop" class="btn btn-primary mt-4">เลือกซื้อภาพ</RouterLink>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.order_id"
        class="card bg-base-100 shadow border border-base-200 p-5"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-lg">#{{ order.order_id }}</span>
              <span :class="['badge', statusMap[order.payment_status]?.cls]">
                {{ statusMap[order.payment_status]?.label }}
              </span>
            </div>
            <p class="text-sm text-base-content/60">{{ fmtDate(order.created_at) }}</p>
            <p class="text-xs text-base-content/50 mt-1">{{ order.artwork_titles }}</p>
          </div>
          <div class="text-right">
            <div class="text-sm text-base-content/60">ราคา: ฿{{ fmt(order.subtotal) }}</div>
            <div class="text-sm text-base-content/60">ค่าธรรมเนียม (5%): ฿{{ fmt(order.service_fee) }}</div>
            <div class="text-sm text-info">ค่าจัดส่ง: ฿{{ fmt(order.shipping_fee != null ? order.shipping_fee : 50) }}</div>
            <div class="font-bold text-primary text-lg">ยอดรวม: ฿{{ fmt(order.total_amount) }}</div>
          </div>
        </div>

        <!-- Shipping Details Box -->
        <div v-if="order.shipping_name" class="mt-3 bg-base-200/50 p-3 rounded-xl border border-base-300 text-xs space-y-1">
          <div class="flex items-center justify-between font-bold text-base-content">
            <span>📦 ข้อมูลการจัดส่งพัสดุ:</span>
            <span v-if="order.tracking_number" class="badge badge-success badge-sm font-mono text-white">
              🚚 เลขพัสดุ: {{ order.tracking_number }}
            </span>
            <span v-else class="badge badge-ghost badge-sm text-base-content/60">
              ⏳ กำลังเตรียมจัดส่ง
            </span>
          </div>
          <div><span class="text-base-content/60">ผู้รับ:</span> {{ order.shipping_name }} | <span class="text-base-content/60">เบอร์โทร:</span> {{ order.shipping_phone }}</div>
          <div><span class="text-base-content/60">ที่อยู่จัดส่ง:</span> {{ order.shipping_address }}</div>
        </div>

        <!-- Download section when approved -->
        <div v-if="order.payment_status === 'approved'" class="mt-4 pt-3 border-t border-base-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-success flex items-center gap-1">
              ✅ ชำระเงินได้รับการอนุมัติแล้ว — รอรับพัสดุจัดส่ง (หรือดาวน์โหลดรูปภาพสำรองได้ที่นี่):
            </span>
          </div>
          <div class="space-y-2">
            <div
              v-for="item in order.items"
              :key="item.order_item_id"
              class="flex items-center justify-between bg-base-200/50 p-2.5 rounded-xl border border-base-300"
            >
              <div class="flex items-center gap-3">
                <img
                  :src="`/uploads/artworks/${item.preview_image}`"
                  :alt="item.title"
                  class="w-12 h-12 object-cover rounded-lg"
                />
                <div>
                  <h4 class="font-bold text-sm text-base-content">{{ item.title }}</h4>
                  <span class="badge badge-primary badge-xs">{{ item.file_format }} ความละเอียดสูง</span>
                </div>
              </div>
              <a
                :href="`/uploads/artworks/${item.high_res_file}`"
                :download="`${item.title}.${item.file_format?.toLowerCase() || 'png'}`"
                target="_blank"
                class="btn btn-success btn-sm gap-1 text-white shadow-sm"
              >
                ⬇️ ดาวน์โหลดไฟล์เต็ม
              </a>
            </div>
          </div>
        </div>
        <div v-else-if="order.payment_status === 'pending'" class="mt-3 alert alert-warning p-3 text-xs flex justify-between items-center">
          <span>⏳ อยู่ระหว่างตรวจสอบสลิปโอนเงิน เมื่ออนุมัติแล้วปุ่มดาวน์โหลดไฟล์จะปรากฏที่นี่</span>
        </div>
        <div v-else-if="order.payment_status === 'rejected'" class="mt-3 alert alert-error p-3 text-xs">
          ❌ สลิปถูกปฏิเสธ กรุณาติดต่อ Admin ทางแชท
        </div>
      </div>
    </div>
  </div>
</template>

