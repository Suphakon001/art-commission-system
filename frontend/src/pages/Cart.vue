<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { getArtworkImg, handleImageError } from '@/utils/media'

const cart = useCartStore()

function fmt(n) {
  return Number(n).toLocaleString('th-TH')
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Left Sidebar Menu (Matching Reference 1) -->
      <aside class="hidden lg:block lg:col-span-3 bg-white rounded-3xl p-4 border border-purple-100 shadow-soft sticky top-24">
        <div class="flex items-center gap-2 px-3 py-2 text-purple-950 font-bold text-base mb-2">
          <svg class="w-5 h-5 text-purple-600 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.49 2 2 6.49 2 12c0 4.41 3.59 8 8 8 .55 0 1-.45 1-1 0-.25-.09-.47-.26-.64-.17-.18-.27-.41-.27-.67 0-.55.45-1 1-1h1.53c4.41 0 8-3.59 8-8 0-5.51-4.49-10-10-10zm-5.5 8c-.83 0-1.5-.67-1.5-1.5S5.67 7 6.5 7s1.5.67 1.5 1.5S7.33 10 6.5 10zm3-3c-.83 0-1.5-.67-1.5-1.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 3c-.83 0-1.5-.67-1.5-1.5S16.67 7 17.5 7s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          <span>ArtSpace</span>
        </div>

        <nav class="space-y-1 text-xs font-semibold">
          <RouterLink to="/" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>🏠</span>
            <span>หน้าหลัก</span>
          </RouterLink>
          <RouterLink to="/shop" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>🛍️</span>
            <span>ร้านค้า</span>
          </RouterLink>
          <RouterLink to="/commission" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>✏️</span>
            <span>Commission</span>
          </RouterLink>
          <RouterLink to="/tracking" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>📋</span>
            <span>ติดตามงาน</span>
          </RouterLink>
          <RouterLink to="/checkout" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>💳</span>
            <span>แจ้งชำระเงิน</span>
          </RouterLink>
          <RouterLink to="/profile" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
            <span>👤</span>
            <span>โปรไฟล์</span>
          </RouterLink>
        </nav>
      </aside>

      <!-- Main Cart Table (Matching Reference 1 Cart) -->
      <main class="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
        
        <div class="flex items-center justify-between border-b border-purple-100 pb-4">
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>ตะกร้าสินค้า (Cart)</span>
          </h1>
          <span class="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
            {{ cart.count }} รายการ
          </span>
        </div>

        <!-- Empty Cart -->
        <div v-if="cart.count === 0" class="text-center py-16 px-4">
          <div class="text-5xl mb-3">🛒</div>
          <h2 class="text-base font-bold text-slate-800 mb-1">ตะกร้าสินค้าของคุณว่างเปล่า</h2>
          <p class="text-xs text-slate-500 mb-6">เลือกชมภาพศิลปะและหยิบใส่ตะกร้าเพื่อดำเนินการสั่งซื้อ</p>
          <RouterLink
            to="/shop"
            class="inline-flex px-6 py-2.5 rounded-full text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-md shadow-purple-600/20"
          >
            ไปที่หน้าร้านค้า
          </RouterLink>
        </div>

        <!-- Cart Table (Reference Style) -->
        <div v-else class="space-y-6">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr class="border-b border-purple-100 text-slate-500 font-bold text-xs uppercase">
                  <th class="py-3 px-2">พัสดุ / สินค้า</th>
                  <th class="py-3 px-2 text-center">ทีละชิ้น</th>
                  <th class="py-3 px-2 text-center">จำนวน</th>
                  <th class="py-3 px-2 text-right">รวม</th>
                  <th class="py-3 px-2 text-center"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-purple-50">
                <tr v-for="item in cart.items" :key="item.artwork_id" class="hover:bg-purple-50/30 transition-colors">
                  <!-- Thumbnail & Title -->
                  <td class="py-4 px-2">
                    <div class="flex items-center gap-3">
                      <img
                        :src="getArtworkImg(item.preview_image)"
                        :alt="item.title"
                        @error="handleImageError"
                        class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-purple-50 border border-purple-100 shrink-0"
                      />
                      <div class="min-w-0">
                        <h3 class="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{{ item.title }}</h3>
                        <span class="text-[11px] text-purple-600 font-medium">{{ item.category_name || 'ภาพศิลปะ' }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Unit Price -->
                  <td class="py-4 px-2 text-center font-bold text-slate-800 whitespace-nowrap">
                    ฿ {{ fmt(item.price) }}
                  </td>

                  <!-- Qty Selector (- 1 +) -->
                  <td class="py-4 px-2 text-center">
                    <div class="inline-flex items-center border border-purple-100 rounded-xl bg-purple-50/60 overflow-hidden">
                      <span class="w-8 py-1 text-center font-bold text-xs text-purple-950">1</span>
                    </div>
                  </td>

                  <!-- Subtotal -->
                  <td class="py-4 px-2 text-right font-extrabold text-slate-900 whitespace-nowrap">
                    ฿ {{ fmt(item.price) }}
                  </td>

                  <!-- Remove Button -->
                  <td class="py-4 px-2 text-center">
                    <button
                      @click="cart.removeItem(item.artwork_id)"
                      class="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                      title="ลบออกจากตะกร้า"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Total Summary & Action Buttons (Exact Reference Style) -->
          <div class="border-t border-purple-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-slate-800 font-bold text-base sm:text-lg">
              รวมทั้งหมด <span class="text-purple-700 font-extrabold text-xl ml-1">฿ {{ fmt(cart.subtotal) }}</span>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto">
              <RouterLink
                to="/shop"
                class="flex-1 sm:flex-initial text-center px-5 py-2.5 rounded-full text-xs font-bold border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all"
              >
                กลับไปเลือกสินค้า
              </RouterLink>

              <RouterLink
                to="/checkout"
                class="flex-1 sm:flex-initial text-center px-6 py-2.5 rounded-full text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-md shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>ดำเนินการสั่งซื้อ</span>
                <span>→</span>
              </RouterLink>
            </div>
          </div>

        </div>

      </main>

    </div>

  </div>
</template>
