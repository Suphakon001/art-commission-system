<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { getArtworkImg, handleImageError } from '@/utils/media'

const props = defineProps({
  artwork: { type: Object, required: true },
})

const cart      = useCartStore()
const isSoldOut = computed(() => props.artwork.status === 'sold_out')
const inCart    = computed(() => cart.isInCart(props.artwork.artwork_id))
const imgSrc    = computed(() => getArtworkImg(props.artwork.preview_image))
const price     = computed(() => Number(props.artwork.price).toLocaleString('th-TH', { minimumFractionDigits: 2 }))
</script>

<template>
  <div class="group flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/5">
    
    <!-- Image Frame -->
    <div class="relative overflow-hidden aspect-square bg-slate-950">
      <RouterLink :to="`/shop/${artwork.artwork_id}`" class="block w-full h-full">
        <img
          :src="imgSrc"
          :alt="artwork.title"
          @error="handleImageError"
          class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          :class="{ 'grayscale opacity-60': isSoldOut }"
          loading="lazy"
        />
      </RouterLink>

      <!-- Sold Out Veil -->
      <div v-if="isSoldOut" class="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center pointer-events-none p-2">
        <span class="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700 shadow-xl">
          จำหน่ายแล้ว
        </span>
      </div>

      <!-- Status micro badge (Top Left) -->
      <div class="absolute top-2.5 left-2.5 pointer-events-none">
        <span
          v-if="!isSoldOut"
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-md"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          พร้อมจำหน่าย
        </span>
      </div>

      <!-- File Format Chip (Top Right) -->
      <div class="absolute top-2.5 right-2.5 pointer-events-none">
        <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800 shadow-md">
          {{ artwork.file_format || 'PNG' }}
        </span>
      </div>
    </div>

    <!-- Content Details -->
    <div class="flex-1 p-3.5 sm:p-4 flex flex-col justify-between gap-3">
      <div>
        <RouterLink :to="`/shop/${artwork.artwork_id}`" class="block group/title">
          <h2 class="text-xs sm:text-sm font-semibold text-slate-100 group-hover/title:text-amber-400 transition-colors line-clamp-1">
            {{ artwork.title }}
          </h2>
        </RouterLink>
        <p class="text-[11px] text-slate-400 mt-0.5 font-medium">
          {{ artwork.category_name || 'หมวดหมู่ทั่วไป' }}
        </p>
      </div>

      <!-- Price & Action -->
      <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div>
          <span class="text-[10px] text-slate-400 block font-mono -mb-0.5">PRICE</span>
          <span class="text-sm sm:text-base font-bold text-amber-400 font-mono">฿{{ price }}</span>
        </div>

        <div>
          <button
            v-if="isSoldOut"
            disabled
            class="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 text-slate-400 cursor-not-allowed opacity-60"
          >
            หมด
          </button>
          <button
            v-else
            @click="cart.addItem(artwork)"
            :disabled="inCart"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm',
              inCart
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-md hover:shadow-amber-500/20 active:scale-95'
            ]"
          >
            <span v-if="inCart">ในตะกร้า</span>
            <template v-else>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span>เพิ่ม</span>
            </template>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
