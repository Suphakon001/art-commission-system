<script setup>
import { computed } from 'vue'

/**
 * FeeCalculator — reusable component
 * Props: basePrice (Number), addonPrice (Number)
 * Shows: base + addon + 5% fee = total
 */
const props = defineProps({
  basePrice:  { type: Number, default: 0 },
  addonPrice: { type: Number, default: 0 },
})

const FEE_RATE = 0.05

const baseAmount = computed(() => parseFloat((props.basePrice + props.addonPrice).toFixed(2)))
const serviceFee = computed(() => parseFloat((baseAmount.value * FEE_RATE).toFixed(2)))
const total      = computed(() => parseFloat((baseAmount.value + serviceFee.value).toFixed(2)))

function fmt(n) {
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}
</script>

<template>
  <div class="rounded-box bg-base-200 p-4 space-y-2 text-sm">
    <h3 class="font-semibold text-base text-primary">สรุปค่าใช้จ่าย</h3>
    <div class="flex justify-between">
      <span class="text-base-content/70">ราคาฐาน</span>
      <span>฿{{ fmt(basePrice) }}</span>
    </div>
    <div v-if="addonPrice > 0" class="flex justify-between">
      <span class="text-base-content/70">ค่าเพิ่มเติม</span>
      <span>฿{{ fmt(addonPrice) }}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-base-content/70">ค่าธรรมเนียมบริการ (5%)</span>
      <span class="text-warning">฿{{ fmt(serviceFee) }}</span>
    </div>
    <div class="divider my-1"></div>
    <div class="flex justify-between font-bold text-base">
      <span>ยอดชำระรวม</span>
      <span class="text-primary text-lg">฿{{ fmt(total) }}</span>
    </div>
  </div>
</template>
