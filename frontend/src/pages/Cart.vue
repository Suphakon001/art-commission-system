<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { getArtworkImg, handleImageError } from '@/utils/media'

const cart = useCartStore()

function fmt(n) {
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    
    <div class="border-b border-slate-800 pb-5 mb-8">
      <span class="text-xs font-mono font-semibold uppercase tracking-widest text-amber-400">Order Bag</span>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 mt-1">
        ตะกร้าผลงานศิลปะ
      </h1>
    </div>

    <!-- Empty Cart -->
    <div v-if="cart.count === 0" class="text-center py-20 px-4 rounded-2xl bg-slate-900/40 border border-slate-800 max-w-md mx-auto">
      <div class="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <h3 class="text-base font-semibold text-slate-200 mb-1">ยังไม่มีผลงานในตะกร้า</h3>
      <p class="text-xs text-slate-400 mb-6">เลือกชมผลงานศิลปะที่ชื่นชอบในแกลเลอรีและเพิ่มลงในตะกร้า</p>
      <RouterLink
        to="/shop"
        class="inline-flex px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md"
      >
        ไปยังแกลเลอรีภาพวาด
      </RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      <!-- Cart Items List -->
      <div class="lg:col-span-2 space-y-3.5">
        <div
          v-for="item in cart.items"
          :key="item.artwork_id"
          class="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md"
        >
          <!-- Thumbnail -->
          <div class="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
            <img
              :src="getArtworkImg(item.preview_image)"
              :alt="item.title"
              @error="handleImageError"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-semibold text-slate-100 truncate">{{ item.title }}</h3>
            <span class="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700 mt-1">
              {{ item.file_format || 'PNG' }}
            </span>
            <div class="text-sm font-bold font-mono text-amber-400 mt-1.5">
              ฿{{ fmt(item.price) }}
            </div>
          </div>

          <!-- Remove Button -->
          <button
            @click="cart.removeItem(item.artwork_id)"
            class="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="ลบออกจากตะกร้า"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Order Summary Card -->
      <div class="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3.5 shadow-xl">
        <h2 class="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3">
          สรุปคำสั่งซื้อ
        </h2>
        <div class="flex justify-between text-xs text-slate-400">
          <span>ราคาสินค้ารวม ({{ cart.count }} รายการ)</span>
          <span class="text-slate-200 font-mono">฿{{ fmt(cart.subtotal) }}</span>
        </div>
        <div class="flex justify-between text-xs text-slate-400">
          <span>ค่าธรรมเนียมบริการ (5%)</span>
          <span class="text-amber-400 font-mono">฿{{ fmt(cart.serviceFee) }}</span>
        </div>
        <div class="flex justify-between text-xs text-slate-400">
          <span>ค่าจัดส่ง (คงที่)</span>
          <span class="text-slate-200 font-mono">฿50.00</span>
        </div>

        <div class="border-t border-slate-800 my-2 pt-3 flex justify-between items-baseline font-bold text-base">
          <span class="text-slate-100">ยอดชำระสุทธิ</span>
          <span class="text-lg text-amber-400 font-mono">฿{{ fmt(cart.totalWithShipping) }}</span>
        </div>

        <RouterLink
          to="/checkout"
          class="block w-full text-center py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all mt-4"
        >
          ดำเนินการสั่งซื้อและชำระเงิน
        </RouterLink>

        <button
          @click="cart.clearCart()"
          class="block w-full text-center text-xs text-slate-400 hover:text-rose-400 py-1 transition-colors"
        >
          ล้างตะกร้าทั้งหมด
        </button>
      </div>

    </div>
  </div>
</template>
