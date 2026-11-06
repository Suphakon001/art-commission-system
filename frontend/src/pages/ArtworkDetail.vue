<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { useCartStore } from '@/stores/cart'
import { getArtworkImg, handleImageError } from '@/utils/media'

const route   = useRoute()
const router  = useRouter()
const cart    = useCartStore()
const artwork = ref(null)
const loading = ref(true)
const error   = ref('')
const qty     = ref(1)
const isLiked = ref(false)

const inCart  = computed(() => artwork.value && cart.isInCart(artwork.value.artwork_id))
const imgSrc  = computed(() => getArtworkImg(artwork.value?.preview_image))

function fmt(n) {
  return Number(n).toLocaleString('th-TH')
}

function decreaseQty() {
  if (qty.value > 1) qty.value--
}

function increaseQty() {
  qty.value++
}

function addToCart() {
  if (!artwork.value) return
  cart.addItem(artwork.value)
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/artworks/${route.params.id}`)
    artwork.value = data
  } catch {
    error.value = 'ไม่พบผลงานนี้ในระบบ'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-xs text-slate-500 mb-6">
      <RouterLink to="/" class="hover:text-purple-700">หน้าแรก</RouterLink>
      <span>/</span>
      <RouterLink to="/shop" class="hover:text-purple-700">ร้านค้า</RouterLink>
      <span>/</span>
      <span class="text-purple-900 font-bold truncate max-w-xs">{{ artwork?.title || 'รายละเอียดสินค้า' }}</span>
    </div>

    <div v-if="loading" class="flex justify-center py-20 text-purple-600">
      <div class="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
      {{ error }}
    </div>

    <!-- Product Detail Layout (Matching Reference 1 Product Detail) -->
    <div v-else-if="artwork" class="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
      
      <!-- Left: Big Artwork Image -->
      <div class="relative rounded-3xl overflow-hidden bg-purple-50 border border-purple-100 shadow-sm aspect-square">
        <img
          :src="imgSrc"
          :alt="artwork.title"
          @error="handleImageError"
          class="w-full h-full object-cover"
        />
        <div v-if="artwork.status === 'sold_out'" class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <span class="px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-slate-800 text-white shadow-xl">
            สินค้าหมดแล้ว (Sold Out)
          </span>
        </div>
      </div>

      <!-- Right: Artwork Info & Purchase (Matching Reference 1) -->
      <div class="flex flex-col gap-5">
        
        <!-- Title & Price -->
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {{ artwork.title }}
          </h1>

          <div class="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
            ฿ {{ fmt(artwork.price) }}
          </div>

          <!-- Rating -->
          <div class="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-600">
            <span class="text-amber-400 text-sm">★</span>
            <span class="font-bold text-slate-800">5.0</span>
            <span class="text-slate-400 font-normal">(รีวิว 24 รายการ)</span>
          </div>
        </div>

        <!-- Description -->
        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {{ artwork.description || 'ภาพอนิเมะแนวนุ่มละมุน สไตล์ญี่ปุ่น ความละเอียดสูง ขนาด 4K' }}
        </p>

        <!-- Quantity Selector (Reference style: "จำนวน :  - 1 +") -->
        <div class="flex items-center gap-4 text-xs font-bold text-slate-700">
          <span>จำนวน :</span>
          <div class="inline-flex items-center border border-purple-100 rounded-xl bg-purple-50/50 overflow-hidden">
            <button
              @click="decreaseQty"
              class="w-8 h-8 flex items-center justify-center hover:bg-purple-100 text-slate-700 font-bold transition-colors"
            >
              -
            </button>
            <span class="w-10 text-center font-bold text-sm text-purple-950">{{ qty }}</span>
            <button
              @click="increaseQty"
              class="w-8 h-8 flex items-center justify-center hover:bg-purple-100 text-slate-700 font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <!-- Action Buttons (Reference style) -->
        <div class="flex items-center gap-3 pt-2">
          <button
            v-if="artwork.status === 'sold_out'"
            disabled
            class="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-400 cursor-not-allowed"
          >
            สินค้าหมดแล้ว
          </button>
          <button
            v-else
            @click="addToCart"
            :disabled="inCart"
            :class="[
              'flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 active:scale-98 transition-all',
              inCart
                ? 'bg-purple-100 text-purple-700 font-bold'
                : 'bg-purple-700 hover:bg-purple-800 text-white'
            ]"
          >
            {{ inCart ? '✓ อยู่ในตะกร้าสินค้าแล้ว' : 'ใส่ตะกร้าสินค้า' }}
          </button>

          <!-- Heart Wishlist button -->
          <button
            @click="isLiked = !isLiked"
            class="w-12 h-12 rounded-2xl border border-purple-200 hover:border-purple-300 bg-white flex items-center justify-center transition-all shadow-sm"
            :class="isLiked ? 'text-rose-500' : 'text-purple-600'"
          >
            <svg class="w-5 h-5" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <!-- รายละเอียดเพิ่มเติม (Exact Reference Box) -->
        <div class="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2 mt-2">
          <h3 class="text-xs font-bold text-purple-950 uppercase tracking-wider mb-2">รายละเอียดเพิ่มเติม</h3>
          <ul class="space-y-1.5 text-xs text-slate-700 font-medium">
            <li class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span>ไฟล์คุณภาพสูง {{ artwork.file_format || 'PNG' }}</span>
            </li>
            <li class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span>ขนาด 3840 x 2160 px (ความละเอียด 4K)</span>
            </li>
            <li class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span>ใช้งานได้ทั้งส่วนตัวและเชิงพาณิชย์</span>
            </li>
          </ul>
        </div>

      </div>

    </div>

  </div>
</template>
