<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import { getArtworkImg, handleImageError } from '@/utils/media'

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
    category_id: '',
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
    error.value = '⚠️ กรุณาระบุชื่อผลงาน'
    return
  }
  if (!form.value.category_id) {
    error.value = '⚠️ กรุณาเลือกหมวดหมู่'
    return
  }
  if (!form.value.price || parseFloat(form.value.price) <= 0) {
    error.value = '⚠️ กรุณาระบุราคาที่ถูกต้อง (มากกว่า 0)'
    return
  }
  if (!form.value.artwork_id && !previewFile.value) {
    error.value = '⚠️ กรุณาเลือกไฟล์ "ภาพตัวอย่าง (Preview)"'
    return
  }
  if (!form.value.artwork_id && !highResFile.value) {
    error.value = '⚠️ กรุณาเลือก "ไฟล์ความละเอียดสูง" (ไฟล์จริงสำหรับส่งมอบลูกค้า)'
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
    error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
  } finally {
    saving.value = false
  }
}

async function toggleActive(a) {
  try {
    await api.patch(`/artworks/${a.artwork_id}/toggle-active`)
    await fetchAll()
  } catch (err) {
    alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะการแสดงผล')
  }
}

async function deleteArtwork(a) {
  if (!confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบผลงาน "${a.title}" ออกจากระบบถาวร?\n(หากลบแล้ว ข้อมูลและไฟล์ภาพจะถูกลบออกจากระบบทันที)`)) return
  try {
    const { data } = await api.delete(`/artworks/${a.artwork_id}`)
    alert(data.message || 'ลบผลงานสำเร็จ')
    await fetchAll()
  } catch (err) {
    alert(err.response?.data?.message || 'ไม่สามารถลบผลงานได้')
  }
}

onMounted(fetchAll)
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-primary">🖼️ จัดการผลงาน</h1>
      <button class="btn btn-primary btn-sm" @click="openCreate">+ เพิ่มผลงาน</button>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>ID</th><th>ภาพ</th><th>ชื่อ</th><th>หมวดหมู่</th>
            <th>ราคา</th><th>ฟอร์แมต</th><th>สถานะสินค้า</th><th>หน้าร้าน</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in artworks" :key="a.artwork_id">
            <td>{{ a.artwork_id }}</td>
            <td>
              <img
                :src="getArtworkImg(a.preview_image)"
                :alt="a.title"
                @error="handleImageError"
                class="w-12 h-12 object-cover rounded-xl bg-slate-900 border border-slate-800 shadow-sm"
              />
            </td>
            <td class="max-w-xs truncate font-medium">{{ a.title }}</td>
            <td>{{ a.category_name }}</td>
            <td class="font-bold text-primary">฿{{ Number(a.price).toLocaleString('th-TH') }}</td>
            <td><span class="badge badge-primary badge-sm">{{ a.file_format }}</span></td>
            <td>
              <span v-if="a.status === 'sold_out'" class="badge badge-error badge-sm text-white font-medium">
                🔴 ขายแล้ว (Sold)
              </span>
              <span v-else class="badge badge-success badge-sm text-white font-medium">
                🟢 พร้อมจำหน่าย
              </span>
            </td>
            <td>
              <span :class="['badge badge-sm', a.is_active ? 'badge-ghost' : 'badge-neutral opacity-50']">
                {{ a.is_active ? 'แสดง' : 'ซ่อน' }}
              </span>
            </td>
            <td class="flex gap-1.5 items-center flex-wrap">
              <button class="btn btn-xs btn-outline btn-info gap-1" @click="openEdit(a)">
                ✏️ แก้ไข
              </button>
              <button
                :class="['btn btn-xs btn-outline gap-1', a.is_active ? 'btn-warning' : 'btn-success']"
                @click="toggleActive(a)"
              >
                {{ a.is_active ? '👁️ ซ่อน' : '✨ แสดง' }}
              </button>
              <button class="btn btn-xs btn-error btn-outline gap-1" @click="deleteArtwork(a)">
                🗑️ ลบ
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <dialog :class="['modal', showModal ? 'modal-open' : '']">
      <div class="modal-box w-11/12 max-w-2xl">
        <h3 class="font-bold text-lg mb-4">{{ form.artwork_id ? 'แก้ไขผลงาน' : 'เพิ่มผลงานใหม่' }}</h3>
        <div class="space-y-3">
          <div class="form-control">
            <label class="label"><span class="label-text">ชื่อผลงาน</span></label>
            <input v-model="form.title" class="input input-bordered" required />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label"><span class="label-text">หมวดหมู่</span></label>
              <select v-model="form.category_id" class="select select-bordered">
                <option v-for="c in categories" :key="c.category_id" :value="c.category_id">{{ c.category_name }}</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">ฟอร์แมต</span></label>
              <select v-model="form.file_format" class="select select-bordered">
                <option value="PNG">PNG</option>
                <option value="JPG">JPG</option>
              </select>
            </div>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">ราคา (บาท)</span></label>
            <input v-model="form.price" type="number" min="1" step="0.01" class="input input-bordered" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">รายละเอียด</span></label>
            <textarea v-model="form.description" class="textarea textarea-bordered" rows="3"></textarea>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">ภาพตัวอย่าง (Preview) {{ form.artwork_id ? '— เว้นว่างถ้าไม่เปลี่ยน' : '*' }}</span></label>
            <input type="file" accept=".png,.jpg,.jpeg" class="file-input file-input-bordered"
              @change="e => previewFile = e.target.files[0]" :required="!form.artwork_id" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">ไฟล์ความละเอียดสูง {{ form.artwork_id ? '— เว้นว่างถ้าไม่เปลี่ยน' : '*' }}</span></label>
            <input type="file" accept=".png,.jpg,.jpeg" class="file-input file-input-bordered"
              @change="e => highResFile = e.target.files[0]" :required="!form.artwork_id" />
          </div>
          <div class="grid grid-cols-2 gap-3 pt-1">
            <div class="form-control">
              <label class="label"><span class="label-text font-semibold">สถานะสินค้า</span></label>
              <select v-model="form.status" class="select select-bordered">
                <option value="available">🟢 พร้อมจำหน่าย (Available)</option>
                <option value="sold_out">🔴 ขายแล้ว (Sold Out)</option>
              </select>
            </div>
            <div class="form-control justify-end">
              <label class="cursor-pointer label justify-start gap-3 pb-3">
                <input type="checkbox" v-model="form.is_active" class="checkbox checkbox-primary" />
                <span class="label-text font-medium">เปิดแสดงในหน้าร้าน</span>
              </label>
            </div>
          </div>
        </div>
        <div v-if="error" class="alert alert-error mt-3 py-2 text-sm">{{ error }}</div>
        <div class="modal-action">
          <button class="btn" @click="showModal=false">ยกเลิก</button>
          <button class="btn btn-primary" @click="save" :disabled="saving">
            <span v-if="saving" class="loading loading-spinner loading-sm"></span>
            <span v-else>บันทึก</span>
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="showModal=false"><button></button></form>
    </dialog>
  </div>
</template>

