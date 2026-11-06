<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'
import { getArtworkImg, handleImageError } from '@/utils/media'

const router = useRouter()
const auth   = useAuthStore()

const artworks   = ref([])
const categories = ref([])
const loading    = ref(true)
const showModal  = ref(false)
const saving     = ref(false)
const error      = ref('')

const form = ref({
  artwork_id:  null,
  category_id: '',
  title:       '',
  description: '',
  price:       '',
  file_format: 'PNG',
  status:      'available',
  is_active:   true,
})
const previewFile  = ref(null)
const highResFile  = ref(null)

function openCreate() {
  form.value = {
    artwork_id: null,
    category_id: categories.value[0]?.category_id || '',
    title: '',
    description: '',
    price: '',
    file_format: 'PNG',
    status: 'available',
    is_active: true,
  }
  previewFile.value = null
  highResFile.value = null
  error.value = ''
  showModal.value = true
}

function openEdit(a) {
  form.value = {
    ...a,
    status: a.status || 'available',
    is_active: a.is_active === 1 || a.is_active === true || a.is_active === '1',
  }
  previewFile.value = null
  highResFile.value = null
  error.value = ''
  showModal.value = true
}

async function fetchAll() {
  loading.value = true
  try {
    const [artRes, catRes] = await Promise.all([
      api.get('/artworks?limit=100&all=true'),
      api.get('/categories'),
    ])
    artworks.value   = artRes.data.data
    categories.value = catRes.data
  } finally {
    loading.value = false
  }
}

async function save() {
  error.value = ''
  if (!form.value.title?.trim()) {
    error.value = 'กรุณาระบุชื่อผลงาน'
    return
  }
  if (!form.value.category_id) {
    error.value = 'กรุณาเลือกหมวดหมู่'
    return
  }
  if (!form.value.price || parseFloat(form.value.price) <= 0) {
    error.value = 'กรุณาระบุราคาที่ถูกต้อง'
    return
  }
  if (!form.value.artwork_id && !previewFile.value) {
    error.value = 'กรุณาเลือกภาพตัวอย่าง (Preview)'
    return
  }
  if (!form.value.artwork_id && !highResFile.value) {
    error.value = 'กรุณาเลือกไฟล์ความละเอียดสูง'
    return
  }

  saving.value = true
  try {
    const fd = new FormData()
    fd.append('category_id', form.value.category_id)
    fd.append('title',       form.value.title)
    fd.append('description', form.value.description || '')
    fd.append('price',       form.value.price)
    fd.append('file_format', form.value.file_format)
    fd.append('status',      form.value.status || 'available')
    fd.append('is_active',   form.value.is_active ? '1' : '0')
    if (previewFile.value) fd.append('preview_image', previewFile.value)
    if (highResFile.value) fd.append('high_res_file', highResFile.value)

    if (form.value.artwork_id) {
      await api.put(`/artworks/${form.value.artwork_id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    } else {
      await api.post('/artworks', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    showModal.value = false
    await fetchAll()
  } catch (err) {
    error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก'
  } finally {
    saving.value = false
  }
}

async function toggleActive(a) {
  try {
    await api.patch(`/artworks/${a.artwork_id}/toggle-active`)
    await fetchAll()
  } catch (err) {
    alert(err.response?.data?.message || 'เกิดข้อผิดพลาด')
  }
}

async function deleteArtwork(a) {
  if (!confirm(`ต้องการลบผลงาน "${a.title}" ใช่หรือไม่?`)) return
  try {
    await api.delete(`/artworks/${a.artwork_id}`)
    await fetchAll()
  } catch (err) {
    alert(err.response?.data?.message || 'เกิดข้อผิดพลาด')
  }
}

onMounted(() => {
  fetchAll()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Dark Purple Admin Sidebar -->
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
          <RouterLink to="/admin/artworks" class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-700/80 text-white font-bold shadow-sm">
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
          <RouterLink to="/admin/users" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
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

      <!-- Main Manage Products Table (Exact Reference 1 Manage Products) -->
      <main class="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
        
        <!-- Header & Add Button -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
              จัดการสินค้า (Manage Products)
            </h1>
            <p class="text-xs text-purple-600 font-medium mt-1">
              เพิ่ม แก้ไข และเปิด/ปิดการจำหน่ายผลงานศิลปะในร้านค้า
            </p>
          </div>

          <!-- Add Product Button (Reference Style) -->
          <button
            @click="openCreate"
            class="px-5 py-2.5 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <span>+</span>
            <span>เพิ่มสินค้า</span>
          </button>
        </div>

        <div v-if="loading" class="flex justify-center py-16 text-purple-600">
          <div class="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Products Table (Exact Reference Style: รูปภาพ, ชื่อสินค้า, ราคา, สถานะ, จัดการ) -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr class="border-b border-purple-100 text-slate-500 font-bold text-xs uppercase">
                <th class="py-3 px-3">รูปภาพ</th>
                <th class="py-3 px-3">ชื่อสินค้า</th>
                <th class="py-3 px-3">ราคา</th>
                <th class="py-3 px-3 text-center">สถานะ</th>
                <th class="py-3 px-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-purple-50">
              <tr v-for="a in artworks" :key="a.artwork_id" class="hover:bg-purple-50/40 transition-colors">
                
                <!-- รูปภาพ -->
                <td class="py-3 px-3">
                  <img
                    :src="getArtworkImg(a.preview_image)"
                    :alt="a.title"
                    @error="handleImageError"
                    class="w-12 h-12 rounded-xl object-cover bg-purple-50 border border-purple-100 shadow-sm"
                  />
                </td>

                <!-- ชื่อสินค้า -->
                <td class="py-3 px-3">
                  <span class="font-bold text-slate-800 block line-clamp-1">{{ a.title }}</span>
                  <span class="text-[11px] text-purple-600 font-medium">{{ a.category_name }}</span>
                </td>

                <!-- ราคา -->
                <td class="py-3 px-3 font-extrabold text-slate-900 whitespace-nowrap">
                  ฿ {{ Number(a.price).toLocaleString('th-TH') }}
                </td>

                <!-- สถานะ (Reference Style: เปิดใช้งาน / ปิดใช้งาน) -->
                <td class="py-3 px-3 text-center whitespace-nowrap">
                  <button
                    @click="toggleActive(a)"
                    class="px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer"
                    :class="a.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'"
                    title="คลิกเพื่อสลับสถานะ"
                  >
                    {{ a.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                  </button>
                </td>

                <!-- จัดการ (Reference Style: Edit pencil + Delete trash icons) -->
                <td class="py-3 px-3 text-center whitespace-nowrap">
                  <div class="inline-flex items-center gap-1.5">
                    <button
                      @click="openEdit(a)"
                      class="p-2 rounded-xl text-purple-700 hover:bg-purple-100 transition-colors"
                      title="แก้ไขผลงาน"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                      </svg>
                    </button>
                    <button
                      @click="deleteArtwork(a)"
                      class="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                      title="ลบผลงาน"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

      </main>

    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
        <div class="flex items-center justify-between border-b border-purple-100 pb-3">
          <h2 class="text-base font-bold text-slate-900">
            {{ form.artwork_id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}
          </h2>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div v-if="error" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
          {{ error }}
        </div>

        <form @submit.prevent="save" class="space-y-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">ชื่อสินค้า *</label>
            <input v-model="form.title" type="text" class="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 outline-none text-xs" required />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">หมวดหมู่ *</label>
            <select v-model="form.category_id" class="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 outline-none text-xs" required>
              <option v-for="c in categories" :key="c.category_id" :value="c.category_id">{{ c.category_name }}</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">ราคา (บาท) *</label>
            <input v-model="form.price" type="number" step="0.01" class="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 outline-none text-xs" required />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">รายละเอียดสินค้า</label>
            <textarea v-model="form.description" rows="3" class="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 outline-none text-xs"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">ภาพตัวอย่าง (Preview) {{ form.artwork_id ? '(เลือกเพื่อเปลี่ยน)' : '*' }}</label>
              <input type="file" @change="e => previewFile = e.target.files[0]" accept="image/*" class="w-full text-xs" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">ไฟล์ความละเอียดสูง {{ form.artwork_id ? '(เลือกเพื่อเปลี่ยน)' : '*' }}</label>
              <input type="file" @change="e => highResFile = e.target.files[0]" accept="image/*" class="w-full text-xs" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-purple-100">
            <button type="button" @click="showModal = false" class="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold">ยกเลิก</button>
            <button type="submit" :disabled="saving" class="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold">
              {{ saving ? 'กำลังบันทึก...' : 'บันทึกสินค้า' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>
