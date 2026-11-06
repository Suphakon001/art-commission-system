<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const users   = ref([])
const loading = ref(true)
const error   = ref('')

function fmtDate(d) {
  return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function fetchUsers() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/users')
    users.value = data
  } catch (err) {
    error.value = err.response?.data?.message || 'ไม่สามารถโหลดรายชื่อผู้ใช้ได้'
  } finally {
    loading.value = false
  }
}

async function toggleRole(u) {
  const newRole = u.role === 'admin' ? 'customer' : 'admin'
  if (!confirm(`ต้องการเปลี่ยนสิทธิ์ของ "${u.username}" เป็น ${newRole === 'admin' ? 'แอดมิน' : 'สมาชิกทั่วไป'} ใช่หรือไม่?`)) return
  try {
    await api.patch(`/admin/users/${u.user_id}/role`, { role: newRole })
    await fetchUsers()
  } catch (err) {
    alert(err.response?.data?.message || 'เกิดข้อผิดพลาด')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Admin Sidebar -->
      <aside class="hidden lg:block lg:col-span-3 bg-gradient-to-b from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-xl border border-purple-900/50 sticky top-24">
        <div class="flex items-center gap-3 px-2 py-3 border-b border-purple-800/40 mb-4">
          <div class="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-base shadow-sm">
            ⚙️
          </div>
          <div>
            <h2 class="font-bold text-sm tracking-wide text-white">Admin Panel</h2>
            <span class="text-[10px] text-purple-300 font-mono">ArtSpace Studio</span>
          </div>
        </div>

        <nav class="space-y-1.5 text-xs font-medium text-purple-200">
          <RouterLink to="/admin" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            <span>📊</span>
            <span>ภาพรวม</span>
          </RouterLink>
          <RouterLink to="/admin/artworks" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            <span>🛍️</span>
            <span>จัดการสินค้า</span>
          </RouterLink>
          <RouterLink to="/admin/commissions" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            <span>✏️</span>
            <span>จัดการคิวงาน</span>
          </RouterLink>
          <RouterLink to="/admin/orders" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            <span>📦</span>
            <span>จัดการคำสั่งซื้อ</span>
          </RouterLink>
          <RouterLink to="/admin/users" class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-700/80 text-white font-bold shadow-sm">
            <span>👥</span>
            <span>จัดการผู้ใช้</span>
          </RouterLink>
          <RouterLink to="/admin/reports" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            <span>📈</span>
            <span>รายงานรายได้</span>
          </RouterLink>
          <RouterLink to="/admin/chat" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            <span>💬</span>
            <span>แชทกับลูกค้า</span>
          </RouterLink>
          <RouterLink to="/admin/settings" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            <span>⚙️</span>
            <span>ตั้งค่าระบบ</span>
          </RouterLink>
        </nav>
      </aside>

      <!-- Main Users Table -->
      <main class="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
        <div class="flex items-center justify-between border-b border-purple-100 pb-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
              จัดการผู้ใช้ (Manage Users)
            </h1>
            <p class="text-xs text-purple-600 font-medium mt-1">
              รายชื่อผู้ใช้ที่ลงทะเบียนในระบบ ArtSpace ทั้งหมด
            </p>
          </div>
          <span class="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
            {{ users.length }} ผู้ใช้งาน
          </span>
        </div>

        <div v-if="loading" class="flex justify-center py-16 text-purple-600">
          <div class="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr class="border-b border-purple-100 text-slate-500 font-bold text-xs uppercase">
                <th class="py-3 px-3">ผู้ใช้</th>
                <th class="py-3 px-3">อีเมล</th>
                <th class="py-3 px-3">บทบาท</th>
                <th class="py-3 px-3">วันที่สมัคร</th>
                <th class="py-3 px-3 text-center">จัดการสิทธิ์</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-purple-50">
              <tr v-for="u in users" :key="u.user_id" class="hover:bg-purple-50/40 transition-colors">
                <td class="py-3 px-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs">
                      {{ u.username.charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-bold text-slate-800">{{ u.username }}</span>
                  </div>
                </td>
                <td class="py-3 px-3 text-slate-600 font-mono text-xs">{{ u.email }}</td>
                <td class="py-3 px-3">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    :class="u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'"
                  >
                    {{ u.role === 'admin' ? '👑 Admin' : 'Customer' }}
                  </span>
                </td>
                <td class="py-3 px-3 text-slate-400 font-mono text-xs">{{ fmtDate(u.created_at) }}</td>
                <td class="py-3 px-3 text-center">
                  <button
                    @click="toggleRole(u)"
                    class="px-3 py-1 rounded-xl text-xs font-bold border hover:bg-purple-50 transition-colors"
                    :class="u.role === 'admin' ? 'border-amber-200 text-amber-700' : 'border-purple-200 text-purple-700'"
                  >
                    {{ u.role === 'admin' ? 'ปรับเป็นสมาชิก' : 'ตั้งเป็นแอดมิน' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

    </div>
  </div>
</template>

