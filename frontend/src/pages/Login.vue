<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

// Login Form
const loginEmail    = ref('')
const loginPassword = ref('')
const rememberMe    = ref(true)
const loginError    = ref('')
const loginLoading  = ref(false)

// Register Form
const regUsername = ref('')
const regEmail    = ref('')
const regPassword = ref('')
const regError    = ref('')
const regSuccess  = ref('')
const regLoading  = ref(false)

async function handleLogin() {
  loginError.value = ''
  loginLoading.value = true
  try {
    await auth.login(loginEmail.value, loginPassword.value)
    router.push(auth.isAdmin ? '/admin' : '/profile')
  } catch (err) {
    loginError.value = err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  } finally {
    loginLoading.value = false
  }
}

async function handleRegister() {
  regError.value = ''
  regSuccess.value = ''
  if (regPassword.value.length < 6) {
    regError.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    return
  }

  regLoading.value = true
  try {
    await auth.register(regUsername.value, regEmail.value, regPassword.value)
    regSuccess.value = 'สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...'
    setTimeout(() => {
      router.push('/profile')
    }, 1000)
  } catch (err) {
    regError.value = err.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ'
  } finally {
    regLoading.value = false
  }
}

function fillAdmin() {
  loginEmail.value = 'admin@artshop.com'
  loginPassword.value = 'admin1234'
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
    
    <!-- Header Title -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
        ArtSpace Authentication
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        เข้าสู่ระบบ / สมัครสมาชิก
      </h1>
      <p class="text-xs sm:text-sm text-slate-500 mt-1">
        ยินดีต้อนรับสู่ ArtSpace คลังผลงานศิลปะและระบบสั่งจ้างวาดภาพออนไลน์
      </p>
    </div>

    <!-- Dual Cards (Matching Reference 1 Login/Register) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
      
      <!-- Card 1: เข้าสู่ระบบ (Login) -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-4">
        <h2 class="text-lg font-bold text-slate-900 pb-2 border-b border-purple-50">
          เข้าสู่ระบบ
        </h2>

        <form @submit.prevent="handleLogin" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">อีเมล หรือชื่อผู้ใช้</label>
            <input
              v-model="loginEmail"
              type="text"
              placeholder="admin@artshop.com หรืออีเมลของคุณ"
              class="w-full px-3.5 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-100 focus:bg-white focus:border-purple-500 outline-none text-xs text-slate-800 transition-colors"
              required
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">รหัสผ่าน</label>
            <input
              v-model="loginPassword"
              type="password"
              placeholder="••••••••"
              class="w-full px-3.5 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-100 focus:bg-white focus:border-purple-500 outline-none text-xs text-slate-800 transition-colors"
              required
            />
          </div>

          <!-- Remember me & Forgot Password -->
          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
              <input type="checkbox" v-model="rememberMe" class="rounded text-purple-600 focus:ring-0" />
              <span>จำฉันไว้ในระบบ</span>
            </label>
            <button type="button" @click="fillAdmin" class="text-purple-600 hover:text-purple-800 font-bold">
              ลืมรหัสผ่าน ? (กรอกแอดมิน)
            </button>
          </div>

          <div v-if="loginError" class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {{ loginError }}
          </div>

          <button
            type="submit"
            :disabled="loginLoading"
            class="w-full py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span v-if="loginLoading" class="loading loading-spinner loading-xs"></span>
            <span>เข้าสู่ระบบ</span>
          </button>
        </form>
      </div>

      <!-- Card 2: สมัครสมาชิก (Register) -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-4">
        <h2 class="text-lg font-bold text-slate-900 pb-2 border-b border-purple-50">
          สมัครสมาชิก
        </h2>

        <form @submit.prevent="handleRegister" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">ชื่อผู้ใช้</label>
            <input
              v-model="regUsername"
              type="text"
              placeholder="ชื่อของคุณ"
              class="w-full px-3.5 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-100 focus:bg-white focus:border-purple-500 outline-none text-xs text-slate-800 transition-colors"
              required
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">อีเมล</label>
            <input
              v-model="regEmail"
              type="email"
              placeholder="email@example.com"
              class="w-full px-3.5 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-100 focus:bg-white focus:border-purple-500 outline-none text-xs text-slate-800 transition-colors"
              required
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">รหัสผ่าน</label>
            <input
              v-model="regPassword"
              type="password"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              class="w-full px-3.5 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-100 focus:bg-white focus:border-purple-500 outline-none text-xs text-slate-800 transition-colors"
              required
            />
          </div>

          <div v-if="regError" class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {{ regError }}
          </div>

          <div v-if="regSuccess" class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            {{ regSuccess }}
          </div>

          <button
            type="submit"
            :disabled="regLoading"
            class="w-full py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span v-if="regLoading" class="loading loading-spinner loading-xs"></span>
            <span>สมัครสมาชิก</span>
          </button>
        </form>
      </div>

    </div>

  </div>
</template>
