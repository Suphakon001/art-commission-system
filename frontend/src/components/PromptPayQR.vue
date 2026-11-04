<script setup>
import { computed } from 'vue'

const props = defineProps({
  amount: { type: Number, required: true },
  accountName: { type: String, default: 'นาย ศุภกร ศุภลา' },
  promptpayId: { type: String, default: '0823247377' },
  accountNumber: { type: String, default: 'xxx-x-x6237-x (กสิกรไทย)' },
})

const formattedAmount = computed(() => {
  return Number(props.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

const qrImageSrc = '/images/promptpay.jpg'

function copyPromptPay() {
  navigator.clipboard.writeText(props.promptpayId)
  alert('คัดลอกหมายเลขพร้อมเพย์เรียบร้อยแล้ว: ' + props.promptpayId)
}
</script>

<template>
  <div class="card bg-base-100 shadow-2xl border border-primary/20 overflow-hidden max-w-sm mx-auto my-5">
    <!-- Header -->
    <div class="bg-gradient-to-r from-[#113566] to-[#0d503c] text-white p-3.5 text-center">
      <div class="flex items-center justify-center gap-2">
        <span class="text-lg font-black tracking-wider text-amber-300">THAI QR PAYMENT</span>
      </div>
      <p class="text-xs text-blue-100 font-light mt-0.5">สแกนจ่ายผ่าน Mobile Banking ได้ทุกธนาคาร</p>
    </div>

    <!-- Official QR Code Image Container -->
    <div class="p-5 bg-white text-slate-800 text-center flex flex-col items-center">
      <!-- Total Amount Highlight Box -->
      <div class="w-full bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 mb-4 shadow-sm">
        <span class="text-xs text-emerald-800 font-medium block">
          ยอดเงินที่ต้องชำระสุทธิ
        </span>
        <span class="text-3xl font-black text-emerald-700 tracking-tight">
          ฿{{ formattedAmount }}
        </span>
      </div>

      <!-- Real Bank QR Card -->
      <div class="relative rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md bg-white p-2 w-full max-w-[270px]">
        <img
          :src="qrImageSrc"
          alt="Thai QR Payment"
          class="w-full h-auto object-contain rounded-xl"
        />
      </div>

      <!-- Bank Details Box -->
      <div class="w-full text-xs text-slate-700 mt-4 space-y-1.5 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div class="flex justify-between">
          <span class="text-slate-500">ชื่อบัญชี:</span>
          <span class="font-bold text-slate-900">{{ accountName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">ธนาคาร:</span>
          <span class="font-semibold text-slate-800">{{ accountNumber }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-500">พร้อมเพย์:</span>
          <span class="font-mono font-bold text-emerald-700 text-sm">{{ promptpayId }}</span>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex gap-2 w-full mt-3">
        <button
          type="button"
          class="btn btn-outline btn-sm flex-1 gap-1 text-xs"
          @click="copyPromptPay"
        >
          📋 คัดลอกเบอร์พร้อมเพย์
        </button>
        <a
          :href="qrImageSrc"
          target="_blank"
          download="promptpay-qr.jpg"
          class="btn btn-success btn-sm flex-1 gap-1 text-xs text-white"
        >
          ⬇️ บันทึกรูป QR
        </a>
      </div>

      <p class="text-[11px] text-slate-400 mt-3 font-light">
        👉 เมื่อสแกนโอนเงินสำเร็จแล้ว กรุณาแนบภาพสลิปที่ช่องด้านล่าง
      </p>
    </div>
  </div>
</template>
