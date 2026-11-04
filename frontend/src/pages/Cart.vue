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
          class="card card-side bg-base-100 shadow border border-base-200"
        >
          <figure class="w-24 h-24 shrink-0">
            <img :src="imgSrc(item.preview_image)" :alt="item.title" class="w-full h-full object-cover" />
          </figure>
          <div class="card-body p-4 flex-row items-center justify-between">
            <div>
              <h3 class="font-semibold text-sm">{{ item.title }}</h3>
              <span class="badge badge-primary badge-sm">{{ item.file_format }}</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="font-bold text-primary">฿{{ fmt(item.price) }}</span>
              <button class="btn btn-error btn-xs btn-outline" @click="cart.removeItem(item.artwork_id)">ลบ</button>
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

