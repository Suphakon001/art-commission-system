<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import { useCartStore } from '@/stores/cart'
import { getArtworkImg, handleImageError } from '@/utils/media'

const route   = useRoute()
const cart    = useCartStore()
const artwork = ref(null)
const loading = ref(true)
const error   = ref('')

const inCart  = computed(() => artwork.value && cart.isInCart(artwork.value.artwork_id))
const imgSrc  = computed(() => getArtworkImg(artwork.value?.preview_image))

function fmt(n) {
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2 })
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
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    
    <!-- Back to Gallery -->
    <RouterLink
      to="/shop"
      class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 mb-6 transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span>กลับไปยังแกลเลอรี</span>
    </RouterLink>

    <div v-if="loading" class="flex justify-center py-20 text-slate-400">
      <div class="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error" class="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
      {{ error }}
    </div>

    <div v-else-if="artwork" class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
      
      <!-- Artwork Image Container -->
      <div class="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        <img
          :src="imgSrc"
          :alt="artwork.title"
          @error="handleImageError"
          class="w-full h-auto object-cover max-h-[600px]"
        />
        <div v-if="artwork.status === 'sold_out'" class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <span class="px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-slate-800 text-slate-300 border border-slate-700 shadow-xl">
            ผลงานนี้จำหน่ายแล้ว
          </span>
        </div>
      </div>

      <!-- Artwork Details & Actions -->
      <div class="flex flex-col gap-6">
        
        <div>
          <!-- Tags -->
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span
              v-if="artwork.status !== 'sold_out'"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              พร้อมจำหน่าย
            </span>
            <span
              v-else
              class="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700"
            >
              จำหน่ายแล้ว
            </span>
            <span class="px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {{ artwork.file_format || 'PNG' }}
            </span>
            <span class="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800">
              {{ artwork.category_name }}
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            {{ artwork.title }}
          </h1>

          <div class="mt-3 text-2xl sm:text-3xl font-bold font-mono text-amber-400">
            ฿{{ fmt(artwork.price) }}
          </div>
        </div>

        <!-- Description -->
        <div class="text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4">
          <p class="whitespace-pre-line">{{ artwork.description || 'ไม่มีรายละเอียดเพิ่มเติม' }}</p>
        </div>

        <!-- Price Breakdown Card -->
        <div class="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2 text-xs">
          <div class="flex justify-between text-slate-400">
            <span>ราคางานศิลปะ</span>
            <span class="text-slate-200 font-mono">฿{{ fmt(artwork.price) }}</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>ค่าธรรมเนียมแพลตฟอร์ม (5%)</span>
            <span class="text-amber-400 font-mono">฿{{ fmt((artwork.price * 0.05).toFixed(2)) }}</span>
          </div>
          <div class="border-t border-slate-800 my-1 pt-2 flex justify-between font-bold text-sm">
            <span class="text-slate-200">ยอดรวมโดยประมาณ</span>
            <span class="text-amber-400 font-mono">฿{{ fmt((artwork.price * 1.05).toFixed(2)) }}</span>
          </div>
          <p class="text-[11px] text-slate-500 pt-1">* ค่าจัดส่งจะถูกคำนวณในขั้นตอนชำระเงิน</p>
        </div>

        <!-- Purchase Button -->
        <div>
          <button
            v-if="artwork.status === 'sold_out'"
            disabled
            class="w-full py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
          >
            ผลงานนี้จำหน่ายหมดแล้ว
          </button>
          <button
            v-else
            @click="cart.addItem(artwork)"
            :disabled="inCart"
            :class="[
              'w-full py-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg',
              inCart
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.99]'
            ]"
          >
            <span v-if="inCart">อยู่ในตะกร้าผลงานแล้ว</span>
            <template v-else>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              <span>เพิ่มลงในตะกร้า</span>
            </template>
          </button>
        </div>

      </div>

    </div>
  </div>
</template>
