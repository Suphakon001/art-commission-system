<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

function fmt(n) {
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

function imgSrc(filename) {
  return filename ? `/uploads/artworks/${filename}` : '/placeholder.png'
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-3xl font-bold text-primary mb-6">🛒 ตะกร้าสินค้า</h1>

    <div v-if="cart.count === 0" class="text-center py-20">
      <div class="text-6xl mb-4">🛒</div>
      <p class="text-base-content/60 mb-4">ตะกร้าของคุณว่างเปล่า</p>
      <RouterLink to="/shop" class="btn btn-primary">เลือกซื้อภาพ</RouterLink>
    </div>

    <div v-else>
      <!-- Items -->
      <div class="space-y-4 mb-6">
        <div
          v-for="item in cart.items"
          :key="item.artwork_id"
          class="card bg-base-100 shadow border border-base-200 overflow-hidden"
        >
          <div class="flex flex-col min-[480px]:flex-row items-center p-3 sm:p-4 gap-3 sm:gap-4">
            <figure class="w-full min-[480px]:w-24 h-36 min-[480px]:h-24 rounded-lg overflow-hidden shrink-0">
              <img :src="imgSrc(item.preview_image)" :alt="item.title" class="w-full h-full object-cover" />
            </figure>
            <div class="flex-1 w-full flex flex-col justify-between">
              <div>
                <h3 class="font-semibold text-sm sm:text-base">{{ item.title }}</h3>
                <span class="badge badge-primary badge-sm mt-1">{{ item.file_format }}</span>
              </div>
              <div class="flex items-center justify-between mt-2 pt-2 border-t border-base-200 min-[480px]:border-none min-[480px]:pt-0">
                <span class="font-bold text-primary text-base sm:text-lg">฿{{ fmt(item.price) }}</span>
                <button class="btn btn-error btn-xs btn-outline" @click="cart.removeItem(item.artwork_id)">ลบ</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="card bg-base-200 p-6 space-y-3">
        <div class="flex justify-between text-sm">
          <span>ราคาสินค้ารวม</span>
          <span>฿{{ fmt(cart.subtotal) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span>ค่าธรรมเนียมบริการ (5%)</span>
          <span class="text-warning">฿{{ fmt(cart.serviceFee) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span>ค่าจัดส่งพัสดุ</span>
          <span class="text-info font-medium">฿{{ fmt(cart.shippingFee) }}</span>
        </div>
        <div class="divider my-1"></div>
        <div class="flex justify-between font-bold text-lg">
          <span>ยอดชำระรวม</span>
          <span class="text-primary">฿{{ fmt(cart.totalAmount) }}</span>
        </div>
        <div class="flex gap-3 mt-4">
          <button class="btn btn-outline btn-error flex-1" @click="cart.clearCart()">ล้างตะกร้า</button>
          <RouterLink to="/checkout" class="btn btn-primary flex-1">ชำระเงิน →</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

