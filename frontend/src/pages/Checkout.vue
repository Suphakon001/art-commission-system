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
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <div class="border-b border-purple-100 pb-4 mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">
        แจ้งชำระเงินและสั่งซื้อ (Checkout)
      </h1>
      <p class="text-xs text-purple-600 font-medium mt-1">
        ตรวจสอบสรุปรายการ สแกน QR Code PromptPay และแนบหลักฐานการโอนเงิน
      </p>
    </div>

    <div v-if="cart.count === 0" class="p-6 rounded-3xl bg-white border border-purple-100 shadow-soft text-center">
      <p class="text-sm font-bold text-slate-800">ตะกร้าของคุณยังไม่มีสินค้า</p>
      <RouterLink to="/shop" class="inline-block mt-3 px-5 py-2.5 rounded-full bg-purple-700 text-white text-xs font-bold">
        กลับไปเลือกสินค้า
      </RouterLink>
    </div>

    <div v-else class="space-y-6">
      <!-- Order summary -->
      <div class="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-3">
        <h2 class="font-bold text-base text-slate-900 mb-2">สรุปรายการสั่งซื้อ</h2>
        <div v-for="item in cart.items" :key="item.artwork_id" class="flex justify-between text-xs sm:text-sm text-slate-700">
          <span>{{ item.title }}</span>
          <span class="font-bold">฿{{ fmt(item.price) }}</span>
        </div>
        <div class="border-t border-purple-50 my-2 pt-2 space-y-1.5 text-xs text-slate-500">
          <div class="flex justify-between">
            <span>ค่าธรรมเนียมบริการ (5%)</span>
            <span class="text-purple-700 font-bold font-mono">฿{{ fmt(cart.serviceFee) }}</span>
          </div>
          <div class="flex justify-between">
            <span>ค่าจัดส่งพัสดุ</span>
            <span class="text-slate-700 font-bold font-mono">฿{{ fmt(cart.shippingFee) }}</span>
          </div>
        </div>
        <div class="border-t border-purple-100 my-2 pt-3 flex justify-between font-extrabold text-base text-slate-900">
          <span>ยอดชำระสุทธิ</span>
          <span class="text-purple-700 font-mono text-xl">฿{{ fmt(cart.totalAmount) }}</span>
        </div>
      </div>

      <!-- Shipping Information Form -->
      <div class="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
        <h2 class="font-bold text-base text-slate-900 flex items-center gap-2">
          <span>📦 ข้อมูลสำหรับจัดส่งสินค้า</span>
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล ผู้รับ <span class="text-rose-500">*</span></label>
            <input
              v-model="shippingName"
              type="text"
              class="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 outline-none text-xs text-slate-800"
              placeholder="เช่น นาย สมชาย ใจดี"
              required
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ <span class="text-rose-500">*</span></label>
            <input
              v-model="shippingPhone"
              type="tel"
              class="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 outline-none text-xs text-slate-800"
              placeholder="เช่น 081-234-5678"
              required
            />
          </div>
          <div class="sm:col-span-2">
            <label class="block font-bold text-slate-700 mb-1">ที่อยู่สำหรับจัดส่ง <span class="text-rose-500">*</span></label>
            <textarea
              v-model="shippingAddress"
              rows="3"
              class="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 outline-none text-xs text-slate-800"
              placeholder="บ้านเลขที่ หมู่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
              required
            ></textarea>
          </div>
        </div>
      </div>

      <!-- PromptPay QR Code Payment -->
      <div class="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4 text-center">
        <h2 class="font-bold text-base text-slate-900">สแกนชำระเงินผ่าน PromptPay</h2>
        <PromptPayQR :amount="cart.totalAmount" account-name="นาย ศุภกร ศุภลา" promptpay-id="0823247377" />
        <div class="pt-2">
          <SlipUploader v-model="slip" :required="true" />
        </div>
      </div>

      <div v-if="error" class="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
        {{ error }}
      </div>

      <button
        @click="placeOrder"
        :disabled="loading"
        class="w-full py-4 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md shadow-purple-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
      >
        <span v-if="loading" class="loading loading-spinner loading-xs"></span>
        <span>ยืนยันการสั่งซื้อและส่งหลักฐานโอนเงิน</span>
      </button>
    </div>
  </div>
</template>

