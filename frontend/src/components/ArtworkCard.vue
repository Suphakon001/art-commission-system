<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { getArtworkImg, handleImageError } from '@/utils/media'

const props = defineProps({
  artwork: { type: Object, required: true },
})

const cart      = useCartStore()
const isLiked   = ref(false)
const isSoldOut = computed(() => props.artwork.status === 'sold_out')
const inCart    = computed(() => cart.isInCart(props.artwork.artwork_id))
const imgSrc    = computed(() => getArtworkImg(props.artwork.preview_image))
const price     = computed(() => Number(props.artwork.price).toLocaleString('th-TH'))
</script>

<template>
  <div class="group flex flex-col bg-white rounded-2xl border border-purple-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 overflow-hidden">
    
    <!-- Image Frame -->
    <div class="relative overflow-hidden aspect-[4/3] bg-purple-50">
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

      <!-- Heart Wishlist Button (Top Right as in Reference) -->
      <button
        @click="isLiked = !isLiked"
        class="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center transition-all shadow-sm"
        :class="isLiked ? 'text-rose-500' : 'text-purple-400 hover:text-purple-600'"
        title="บันทึกในรายการโปรด"
      >
        <svg class="w-4 h-4" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <!-- Sold Out Badge -->
      <div v-if="isSoldOut" class="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none p-2">
        <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-white shadow-md">
          สินค้าหมด
        </span>
      </div>
    </div>

    <!-- Content Details -->
    <div class="p-3 sm:p-3.5 flex flex-col justify-between flex-1 gap-2.5">
      <div>
        <RouterLink :to="`/shop/${artwork.artwork_id}`" class="block group/title">
          <h3 class="text-xs sm:text-sm font-bold text-slate-800 group-hover/title:text-purple-700 transition-colors line-clamp-1">
            {{ artwork.title }}
          </h3>
        </RouterLink>
        <p class="text-[11px] text-purple-600/70 font-medium mt-0.5 line-clamp-1">
          {{ artwork.category_name || 'ภาพศิลปะ' }}
        </p>
      </div>

      <!-- Price & Add to Cart (Reference Style) -->
      <div class="flex items-center justify-between gap-1.5 pt-1">
        <span class="text-sm sm:text-base font-extrabold text-slate-900">
          ฿ {{ price }}
        </span>

        <div>
          <button
            v-if="isSoldOut"
            disabled
            class="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-400 cursor-not-allowed"
          >
            หมด
          </button>
          <button
            v-else
            @click="cart.addItem(artwork)"
            :disabled="inCart"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shadow-sm active:scale-95',
              inCart
                ? 'bg-purple-100 text-purple-700'
                : 'bg-purple-700 hover:bg-purple-800 text-white'
            ]"
          >
            <svg v-if="!inCart" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m5-9l2 9" />
            </svg>
            <span>{{ inCart ? '✓ ในตะกร้า' : 'ใส่ตะกร้า' }}</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
