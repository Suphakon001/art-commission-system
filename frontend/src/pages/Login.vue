<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()
const email  = ref('')
const password = ref('')
const error  = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push(auth.isAdmin ? '/admin' : '/')
  } catch (err) {
    error.value = err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลหรือรหัสผ่าน'
  } finally {
    loading.value = false
  }
}

function fillAdmin() {
  email.value = 'admin@artshop.com'
  password.value = 'admin1234'
}
</script>

<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
    
    <div class="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
      
      <!-- Studio Header -->
      <div class="text-center mb-6">
        <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold mx-auto mb-3 shadow-lg shadow-amber-500/10">
          A
        </div>
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">เข้าสู่ระบบสตูดิโอ</h1>
        <p class="text-xs text-slate-400 mt-1">ARTSHOP STUDIO & GALLERY</p>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">อีเมล</label>
          <input
            v-model="email"
            type="email"
            class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 focus:outline-none rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-600 transition-colors"
            placeholder="admin@artshop.com หรืออีเมลของคุณ"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">รหัสผ่าน</label>
          <input
            v-model="password"
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
          <span>เข้าสู่ระบบ</span>
        </button>
      </form>

      <!-- Admin Quick Fill Helper -->
      <div class="mt-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
        <div class="text-slate-400">
          <span class="text-amber-400 font-mono font-semibold">บัญชีผู้ดูแลระบบ:</span> admin@artshop.com
        </div>
        <button
          type="button"
          @click="fillAdmin"
          class="text-amber-400 hover:text-amber-300 font-semibold underline text-[11px]"
        >
          กรอกรหัสทันที
        </button>
      </div>

      <p class="text-center text-xs text-slate-400 mt-5">
        ยังไม่มีบัญชีสมาชิก?
        <RouterLink to="/register" class="text-amber-400 hover:text-amber-300 font-semibold">
          สมัครสมาชิกใหม่
        </RouterLink>
      </p>

    </div>
  </div>
</template>
