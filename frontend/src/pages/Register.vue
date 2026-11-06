<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router   = useRouter()
const auth     = useAuthStore()
const username = ref('')
const email    = ref('')
const password = ref('')
const confirm  = ref('')
const error    = ref('')
const loading  = ref(false)

async function submit() {
  error.value = ''
  if (password.value !== confirm.value)
    return (error.value = 'รหัสผ่านไม่ตรงกัน')
  if (password.value.length < 6)
    return (error.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')

  loading.value = true
  try {
    await auth.register(username.value, email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
    <div class="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
      
      <div class="text-center mb-6">
        <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold mx-auto mb-3 shadow-lg shadow-amber-500/10">
          A
        </div>
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">สมัครสมาชิกสตูดิโอ</h1>
        <p class="text-xs text-slate-400 mt-1">เข้าร่วมรับสิทธิ์การสั่งซื้อและติดตามผลงานศิลปะ</p>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">ชื่อผู้ใช้ (Username)</label>
          <input
            v-model="username"
            type="text"
            class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 focus:outline-none rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-600 transition-colors"
            placeholder="ชื่อของคุณ"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">อีเมล</label>
          <input
            v-model="email"
            type="email"
            class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 focus:outline-none rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-600 transition-colors"
            placeholder="email@example.com"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">รหัสผ่าน</label>
          <input
            v-model="password"
            type="password"
            class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 focus:outline-none rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-600 transition-colors"
            placeholder="อย่างน้อย 6 ตัวอักษร"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">ยืนยันรหัสผ่าน</label>
          <input
            v-model="confirm"
            type="password"
            class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 focus:outline-none rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-600 transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="error" class="p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs">
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full py-3 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
          :disabled="loading"
        >
          <span v-if="loading" class="loading loading-spinner loading-xs mr-2"></span>
          <span>สมัครสมาชิก</span>
        </button>
      </form>

      <p class="text-center text-xs text-slate-400 mt-5">
        มีบัญชีอยู่แล้ว?
        <RouterLink to="/login" class="text-amber-400 hover:text-amber-300 font-semibold">
          เข้าสู่ระบบ
        </RouterLink>
      </p>

    </div>
  </div>
</template>
