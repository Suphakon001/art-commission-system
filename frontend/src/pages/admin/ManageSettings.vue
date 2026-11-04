<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const settings = ref({ is_commission_open: true, max_queue: 5 })
const packages = ref([])
const loading  = ref(true)
const saving   = ref(false)
const pkgSaving = ref(null)
const msg      = ref('')

async function fetchAll() {
  loading.value = true
  try {
    const [setRes, pkgRes] = await Promise.all([
      api.get('/settings'),
      api.get('/commissions/packages'),
    ])
    settings.value = setRes.data
    packages.value = pkgRes.data
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  saving.value = true
  msg.value = ''
  try {
    await api.put('/settings', settings.value)
    msg.value = '✅ บันทึกการตั้งค่าสำเร็จ'
  } catch (err) {
    msg.value = '❌ ' + (err.response?.data?.message || 'เกิดข้อผิดพลาด')
  } finally {
    saving.value = false
  }
}

async function savePackage(pkg) {
  pkgSaving.value = pkg.package_id
  try {
    await api.patch(`/commissions/packages/${pkg.package_id}`, pkg)
  } catch (err) {
    alert(err.response?.data?.message || 'เกิดข้อผิดพลาด')
  } finally {
    pkgSaving.value = null
  }
}

onMounted(fetchAll)
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-2xl font-bold text-primary mb-6">⚙️ ตั้งค่าร้าน</h1>

    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else class="space-y-8">
      <!-- Commission settings -->
      <div class="card bg-base-100 shadow border border-base-200 p-6">
        <h2 class="font-bold text-lg mb-4">ระบบรับจ้างวาดภาพ</h2>
        <div class="form-control mb-4">
          <label class="cursor-pointer label justify-start gap-4">
            <input type="checkbox" v-model="settings.is_commission_open" class="toggle toggle-primary" />
            <span class="label-text text-base">
              {{ settings.is_commission_open ? '✅ เปิดรับ Commission' : '🚫 ปิดรับ Commission' }}
            </span>
          </label>
        </div>
        <div class="form-control mb-4">
          <label class="label"><span class="label-text font-semibold">จำนวนคิวสูงสุด</span></label>
          <input v-model.number="settings.max_queue" type="number" min="1" max="50"
            class="input input-bordered max-w-xs" />
        </div>
        <div v-if="msg" :class="['alert py-2 text-sm', msg.startsWith('✅') ? 'alert-success' : 'alert-error']">{{ msg }}</div>
        <button class="btn btn-primary mt-2" @click="saveSettings" :disabled="saving">
          <span v-if="saving" class="loading loading-spinner loading-sm"></span>
          <span v-else>บันทึกการตั้งค่า</span>
        </button>
      </div>

      <!-- Packages -->
      <div class="card bg-base-100 shadow border border-base-200 p-6">
        <h2 class="font-bold text-lg mb-4">แพ็กเกจ Commission</h2>
        <div class="space-y-5">
          <div v-for="pkg in packages" :key="pkg.package_id" class="border border-base-200 rounded-box p-4">
            <div class="grid md:grid-cols-2 gap-3">
              <div class="form-control">
                <label class="label"><span class="label-text text-xs">ชื่อแพ็กเกจ</span></label>
                <input v-model="pkg.package_name" class="input input-bordered input-sm" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text text-xs">ราคาฐาน (บาท)</span></label>
                <input v-model.number="pkg.base_price" type="number" min="0" class="input input-bordered input-sm" />
              </div>
              <div class="form-control col-span-2">
                <label class="label"><span class="label-text text-xs">รายละเอียด</span></label>
                <textarea v-model="pkg.description" class="textarea textarea-bordered textarea-sm" rows="2"></textarea>
              </div>
              <div class="form-control">
                <label class="cursor-pointer label justify-start gap-3">
                  <input type="checkbox" v-model="pkg.is_open" class="checkbox checkbox-primary checkbox-sm" />
                  <span class="label-text text-sm">เปิดรับ</span>
                </label>
              </div>
            </div>
            <button class="btn btn-sm btn-outline btn-primary mt-3"
              @click="savePackage(pkg)"
              :disabled="pkgSaving===pkg.package_id">
              <span v-if="pkgSaving===pkg.package_id" class="loading loading-spinner loading-xs"></span>
              <span v-else>บันทึกแพ็กเกจ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

