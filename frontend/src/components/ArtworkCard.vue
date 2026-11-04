<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  artwork: { type: Object, required: true },
})

const cart     = useCartStore()
const isSoldOut = computed(() => props.artwork.status === 'sold_out')
const inCart   = computed(() => cart.isInCart(props.artwork.artwork_id))
const imgSrc   = computed(() =>
  props.artwork.preview_image
    ? `/uploads/artworks/${props.artwork.preview_image}`
    : '/placeholder.png'
)
const price = computed(() => Number(props.artwork.price).toLocaleString('th-TH', { minimumFractionDigits: 2 }))
</script>

<template>
  <div class="card bg-base-100 shadow-md card-hover border border-base-200">
    <figure class="relative overflow-hidden" style="aspect-ratio: 1/1;">
      <RouterLink :to="`/shop/${artwork.artwork_id}`">
        <img :src="imgSrc" :alt="artwork.title"
          class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          :class="{ 'grayscale opacity-75': isSoldOut }" />
      </RouterLink>

      <!-- Center overlay when sold out -->
      <div v-if="isSoldOut" class="absolute inset-0 bg-black/35 flex items-center justify-center pointer-events-none">
        <span class="bg-error/95 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-xl tracking-wide border border-white/30">
          ✕ สินค้าหมด (ขายแล้ว)
        </span>
      </div>

      <!-- Status badge (Top Left) -->
      <div class="absolute top-2 left-2">
        <span v-if="isSoldOut" class="badge badge-error badge-sm text-white font-bold shadow-md">
          🔴 ขายแล้ว
        </span>
        <span v-else class="badge badge-success badge-sm text-white font-medium shadow-md">
          🟢 มีจำหน่าย
        </span>
      </div>

      <!-- File format badge (Top Right) -->
      <div class="absolute top-2 right-2">
        <span class="badge badge-primary badge-sm shadow-md">{{ artwork.file_format }}</span>
      </div>
    </figure>

    <div class="card-body p-3 sm:p-4">
      <RouterLink :to="`/shop/${artwork.artwork_id}`">
        <h2 class="card-title text-xs sm:text-sm font-semibold line-clamp-1 sm:line-clamp-2 hover:text-primary transition-colors">
          {{ artwork.title }}
        </h2>
      </RouterLink>
      <p class="text-[11px] sm:text-xs text-base-content/60">{{ artwork.category_name }}</p>

      <div class="flex flex-col min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between gap-1.5 sm:gap-2 mt-2">
        <span class="text-primary font-bold text-base sm:text-lg">฿{{ price }}</span>
        
        <!-- Action Button based on status -->
        <button
          v-if="isSoldOut"
          class="btn btn-xs sm:btn-sm btn-disabled opacity-60 text-xs bg-base-300 border-none cursor-not-allowed w-full min-[480px]:w-auto"
          disabled
        >
          ✕ สินค้าหมด
        </button>
        <button
          v-else
          class="btn btn-primary btn-xs sm:btn-sm w-full min-[480px]:w-auto font-medium"
          :class="{ 'btn-disabled btn-success': inCart }"
          @click="cart.addItem(artwork)"
          :disabled="inCart"
        >
          <span v-if="inCart">✓ ในตะกร้า</span>
          <span v-else>+ ใส่ตะกร้า</span>
        </button>
      </div>
    </div>
  </div>
</template>

