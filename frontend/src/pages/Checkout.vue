<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import api from '@/api'
import PromptPayQR from '@/components/PromptPayQR.vue'
import SlipUploader from '@/components/SlipUploader.vue'

const router = useRouter()
const cart   = useCartStore()
const slip   = ref(null)
const loading = ref(false)
const error   = ref('')

const shippingName    = ref('')
const shippingPhone   = ref('')
const shippingAddress = ref('')

function fmt(n) {
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

function onSlipChange(e) { slip.value = e.target.files[0] || null }

async function placeOrder() {
  error.value = ''
  if (!shippingName.value.trim()) {
    error.value = '⚠️ กรุณากรอกชื่อ-นามสกุลผู้รับสินค้า'
    return
  }
  if (!shippingPhone.value.trim()) {
    error.value = '⚠️ กรุณากรอกเบอร์โทรศัพท์สำหรับติดต่อจัดส่ง'
    return
  }
  if (!shippingAddress.value.trim()) {
    error.value = '⚠️ กรุณากรอกที่อยู่สำหรับจัดส่งสินค้า'
    return
  }
  if (!slip.value) return (error.value = '⚠️ กรุณาแนบสลิปการชำระเงิน')

  loading.value = true
  try {
    const form = new FormData()
    form.append('items',            JSON.stringify(cart.items.map(i => ({ artwork_id: i.artwork_id }))))
    form.append('shipping_name',    shippingName.value.trim())
    form.append('shipping_phone',   shippingPhone.value.trim())
    form.append('shipping_address', shippingAddress.value.trim())
    form.append('slip_image',       slip.value)

    const { data } = await api.post('/orders', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    cart.clearCart()
    router.push({ path: '/my-orders', query: { success: data.order_id } })
  } catch (err) {
    error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold text-primary mb-6">💳 ชำระเงิน</h1>

    <div v-if="cart.count === 0" class="alert alert-warning">
      ตะกร้าของคุณว่างเปล่า
      <RouterLink to="/shop" class="btn btn-sm btn-primary ml-4">กลับไปเลือกสินค้า</RouterLink>
    </div>

    <div v-else class="space-y-6">
      <!-- Order summary -->
      <div class="card bg-base-100 shadow border border-base-200 p-5 space-y-2">
        <h2 class="font-bold text-lg mb-3">รายการสั่งซื้อ</h2>
        <div v-for="item in cart.items" :key="item.artwork_id" class="flex justify-between text-sm">
          <span>{{ item.title }}</span>
          <span>฿{{ fmt(item.price) }}</span>
        </div>
        <div class="divider my-2"></div>
        <div class="flex justify-between text-sm">
          <span>ค่าธรรมเนียมบริการ (5%)</span>
          <span class="text-warning">฿{{ fmt(cart.serviceFee) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span>ค่าจัดส่งพัสดุ</span>
          <span class="text-info font-medium">฿{{ fmt(cart.shippingFee) }}</span>
        </div>
        <div class="divider my-2"></div>
        <div class="flex justify-between font-bold text-lg text-primary">
          <span>ยอดชำระรวม</span>
          <span>฿{{ fmt(cart.totalAmount) }}</span>
        </div>
      </div>

      <!-- Shipping Information Form -->
      <div class="card bg-base-100 shadow border border-base-200 p-5 space-y-3">
        <h2 class="font-bold text-base text-primary flex items-center gap-1.5">
          <span>📦 ข้อมูลสำหรับจัดส่งสินค้า (ภาพวาดชิ้นงานจริง)</span>
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label pb-1"><span class="label-text font-semibold text-xs">ชื่อ-นามสกุล ผู้รับ <span class="text-error">*</span></span></label>
            <input
              v-model="shippingName"
              type="text"
              class="input input-bordered input-sm"
              placeholder="เช่น นาย สมชาย ใจดี"
              required
            />
          </div>
          <div class="form-control">
            <label class="label pb-1"><span class="label-text font-semibold text-xs">เบอร์โทรศัพท์ติดต่อ <span class="text-error">*</span></span></label>
            <input
              v-model="shippingPhone"
              type="tel"
              class="input input-bordered input-sm"
              placeholder="เช่น 081-234-5678"
              required
            />
          </div>
        </div>
        <div class="form-control">
          <label class="label pb-1"><span class="label-text font-semibold text-xs">ที่อยู่สำหรับจัดส่ง (บ้านเลขที่, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์) <span class="text-error">*</span></span></label>
          <textarea
            v-model="shippingAddress"
            rows="3"
            class="textarea textarea-bordered text-xs leading-relaxed"
            placeholder="กรอกที่อยู่จัดส่งอย่างละเอียด เพื่อความถูกต้องและรวดเร็วในการจัดส่งชิ้นงาน..."
            required
          ></textarea>
        </div>
      </div>

      <!-- PromptPay QR Code Payment -->
      <PromptPayQR :amount="cart.totalAmount" account-name="นาย ศุภกร ศุภลา" promptpay-id="0823247377" />

      <!-- Interactive Slip Uploader -->
      <SlipUploader v-model="slip" :required="true" />

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <button class="btn btn-primary btn-lg w-full" @click="placeOrder" :disabled="loading">
        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
        <span v-else>✅ ยืนยันคำสั่งซื้อ</span>
      </button>
    </div>
  </div>
</template>

