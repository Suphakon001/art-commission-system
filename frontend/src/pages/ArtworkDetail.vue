<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import { useCartStore } from '@/stores/cart'

const route   = useRoute()
const cart    = useCartStore()
const artwork = ref(null)
const loading = ref(true)
const error   = ref('')

const inCart  = computed(() => artwork.value && cart.isInCart(artwork.value.artwork_id))
const imgSrc  = computed(() =>
  artwork.value?.preview_image
    ? `/uploads/artworks/${artwork.value.preview_image}`
    : '/placeholder.png'
)

function fmt(n) {
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/artworks/${route.params.id}`)
    artwork.value = data
  } catch {
    error.value = 'ไม่พบผลงานนี้'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div v-if="loading" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="error" class="alert alert-error">{{ error }}</div>

    <div v-else-if="artwork" class="grid md:grid-cols-2 gap-8">
      <!-- Image -->
      <div class="rounded-box overflow-hidden shadow-lg">
        <img :src="imgSrc" :alt="artwork.title" class="w-full object-cover" />
      </div>

      <!-- Info -->
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center gap-2">
          <span v-if="artwork.status === 'sold_out'" class="badge badge-error text-white font-bold">
            🔴 ขายแล้ว (Sold Out)
          </span>
          <span v-else class="badge badge-success text-white font-medium">
            🟢 พร้อมจำหน่าย (พร้อมจัดส่ง)
          </span>
          <span class="badge badge-primary">{{ artwork.file_format }}</span>
          <span class="badge badge-ghost">{{ artwork.category_name }}</span>
        </div>
        <h1 class="text-2xl font-bold">{{ artwork.title }}</h1>
        <p class="text-base-content/70 text-sm">{{ artwork.description }}</p>

        <div class="text-3xl font-bold text-primary">฿{{ fmt(artwork.price) }}</div>

        <!-- Fee breakdown -->
        <div class="rounded-box bg-base-200 p-4 text-sm space-y-1">
          <div class="flex justify-between">
            <span class="text-base-content/70">ราคาสินค้า</span>
            <span>฿{{ fmt(artwork.price) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-base-content/70">ค่าธรรมเนียมบริการ (5%)</span>
            <span class="text-warning">฿{{ fmt((artwork.price * 0.05).toFixed(2)) }}</span>
          </div>
          <div class="divider my-1"></div>
          <div class="flex justify-between font-bold">
            <span>ยอดชำระรวม</span>
            <span class="text-primary">฿{{ fmt((artwork.price * 1.05).toFixed(2)) }}</span>
          </div>
          <p class="text-xs text-base-content/50 mt-1">* ค่าธรรมเนียมบริการคำนวณในขั้นตอน Checkout</p>
        </div>

        <button
          v-if="artwork.status === 'sold_out'"
          class="btn btn-disabled btn-lg opacity-60"
          disabled
        >
          ❌ ชิ้นนี้ขายแล้ว (Sold Out)
        </button>
        <button
          v-else
          class="btn btn-primary btn-lg"
          :class="{ 'btn-success': inCart }"
          @click="cart.addItem(artwork)"
          :disabled="inCart"
        >
          <span v-if="inCart">✓ อยู่ในตะกร้าแล้ว</span>
          <span v-else>🛒 เพิ่มลงตะกร้า</span>
        </button>

        <RouterLink to="/cart" v-if="inCart" class="btn btn-outline btn-primary">
          ไปที่ตะกร้า →
        </RouterLink>
      </div>
    </div>
  </div>
</template>

