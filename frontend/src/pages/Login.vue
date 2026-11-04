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
    error.value = err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="card w-full max-w-sm shadow-xl bg-base-100">
      <div class="card-body">
        <h1 class="card-title text-2xl font-bold text-primary justify-center mb-2">เข้าสู่ระบบ</h1>

        <form @submit.prevent="submit" class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text">อีเมล</span></label>
            <input v-model="email" type="email" class="input input-bordered" placeholder="email@example.com" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">รหัสผ่าน</span></label>
            <input v-model="password" type="password" class="input input-bordered" placeholder="••••••••" required />
          </div>

          <div v-if="error" class="alert alert-error py-2 text-sm">{{ error }}</div>

          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            <span v-else>เข้าสู่ระบบ</span>
          </button>
        </form>

        <p class="text-center text-sm text-base-content/60 mt-3">
          ยังไม่มีบัญชี?
          <RouterLink to="/register" class="link link-primary">สมัครสมาชิก</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

