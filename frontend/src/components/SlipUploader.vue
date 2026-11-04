<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: null },
  required:   { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])

const previewUrl = ref(null)
const errorMsg   = ref('')
const fileInput  = ref(null)
const isDragging = ref(false)

function handleFile(file) {
  errorMsg.value = ''
  if (!file) return

  // Check type
  const allowed = ['image/png', 'image/jpeg', 'image/jpg']
  if (!allowed.includes(file.type)) {
    errorMsg.value = 'กรุณาแนบเฉพาะไฟล์ภาพ .PNG หรือ .JPG เท่านั้น'
    return
  }

  // Check size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    errorMsg.value = 'ขนาดไฟล์ต้องไม่เกิน 10 MB'
    return
  }

  // Create local preview
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
  emit('update:modelValue', file)
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) handleFile(file)
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files?.[0]
  if (file) handleFile(file)
}

function clearFile() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  emit('update:modelValue', null)
  if (fileInput.value) fileInput.value.value = ''
}

function triggerSelect() {
  fileInput.value?.click()
}

function formatBytes(bytes) {
  if (!bytes) return ''
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<template>
  <div class="w-full">
    <label class="label pb-1">
      <span class="label-text font-semibold flex items-center gap-1.5 text-base">
        🧾 แนบหลักฐานการชำระเงิน (สลิปโอนเงิน)
        <span v-if="required" class="text-error font-bold">*</span>
      </span>
    </label>

    <!-- Hidden native input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/png, image/jpeg, image/jpg"
      class="hidden"
      @change="onFileChange"
    />

    <!-- When NO file chosen: Upload Zone -->
    <div
      v-if="!previewUrl"
      class="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200"
      :class="isDragging ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-base-300 hover:border-primary/60 bg-base-100 hover:bg-base-200/50'"
      @click="triggerSelect"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl">
        📤
      </div>
      <p class="font-bold text-sm text-base-content">
        คลิกเพื่อเลือกรูปภาพสลิป หรือลากไฟล์มาวางที่นี่
      </p>
      <p class="text-xs text-base-content/50 mt-1">
        รองรับไฟล์รูปภาพ PNG, JPG, JPEG (ขนาดไม่เกิน 10 MB)
      </p>
    </div>

    <!-- When file IS chosen: Active Preview Card -->
    <div
      v-else
      class="card bg-base-100 border border-success/30 shadow-md p-4 flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden"
    >
      <div class="relative shrink-0 w-28 h-36 bg-base-200 rounded-xl overflow-hidden border border-base-300 shadow-inner group">
        <img
          :src="previewUrl"
          alt="Slip Preview"
          class="w-full h-full object-cover object-top"
        />
        <a
          :href="previewUrl"
          target="_blank"
          class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium"
        >
          🔍 ดูภาพเต็ม
        </a>
      </div>

      <div class="flex-1 w-full text-center sm:text-left">
        <div class="badge badge-success badge-sm gap-1 mb-1.5 font-medium">
          ✓ แนบสลิปเรียบร้อยแล้ว
        </div>
        <h4 class="font-semibold text-sm line-clamp-1 text-base-content">
          {{ modelValue?.name }}
        </h4>
        <p class="text-xs text-base-content/50 mt-0.5">
          ขนาด: {{ formatBytes(modelValue?.size) }}
        </p>

        <div class="flex items-center gap-2 mt-3 justify-center sm:justify-start">
          <button
            type="button"
            class="btn btn-outline btn-xs gap-1"
            @click="triggerSelect"
          >
            🔄 เปลี่ยนรูปสลิป
          </button>
          <button
            type="button"
            class="btn btn-error btn-outline btn-xs gap-1"
            @click="clearFile"
          >
            ✕ ลบรูปนี้
          </button>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="errorMsg" class="alert alert-error text-xs py-2 mt-2">
      ⚠️ {{ errorMsg }}
    </div>
  </div>
</template>

