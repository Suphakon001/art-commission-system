<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import ArtworkCard from '@/components/ArtworkCard.vue'

const route   = useRoute()
const router  = useRouter()

const artworks   = ref([])
const categories = ref([])
const loading    = ref(false)
const total      = ref(0)

const filters = ref({
  category_id: route.query.category_id || '',
  search:      route.query.search      || '',
  page:        parseInt(route.query.page) || 1,
  limit:       12,
})

async function fetchArtworks() {
  loading.value = true
  try {
    const params = { ...filters.value }
    if (!params.category_id) delete params.category_id
    if (!params.search)      delete params.search
    const { data } = await api.get('/artworks', { params })
    artworks.value = data.data
    total.value    = data.total
    router.replace({ query: { ...params } })
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const { data } = await api.get('/categories')
    categories.value = [{ category_id: '', category_name: 'ทุกหมวดหมู่' }, ...data]
  } catch (err) {
    console.error('Fetch categories error:', err)
  }
}

function resetPage() { filters.value.page = 1 }

const totalPages = () => Math.ceil(total.value / filters.value.limit)

onMounted(async () => {
  await fetchCategories()
  await fetchArtworks()
})

watch(() => filters.value.category_id, () => { resetPage(); fetchArtworks() })
watch(() => filters.value.search,      () => { resetPage(); fetchArtworks() })
watch(() => filters.value.page,        () => fetchArtworks())
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    
    <!-- Gallery Editorial Header -->
    <div class="mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-800 pb-6">
      <div>
        <span class="text-xs font-mono font-semibold uppercase tracking-widest text-amber-400">Curated Collection</span>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-100 mt-1">
          แกลเลอรีภาพวาดศิลปะ
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          เลือกชมและสะสมผลงานภาพวาดต้นฉบับคุณภาพสูง พร้อมไฟล์ดาวน์โหลดความละเอียดสูงและสิทธิ์การใช้งาน
        </p>
      </div>

      <div class="text-xs text-slate-400 font-mono">
        <span class="text-slate-200 font-semibold">{{ total }}</span> ผลงานทั้งหมด
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-8">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="filters.search"
          type="text"
          placeholder="ค้นหาชื่อผลงานศิลปะ..."
          class="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-amber-400 focus:outline-none rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 transition-colors"
        />
        <button
          v-if="filters.search"
          @click="filters.search = ''"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Category Filter Dropdown -->
      <div class="sm:w-60">
        <select
          v-model="filters.category_id"
          class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-amber-400 focus:outline-none rounded-xl text-xs sm:text-sm text-slate-200 cursor-pointer transition-colors"
        >
          <option v-for="c in categories" :key="c.category_id" :value="c.category_id">
            {{ c.category_name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
      <div class="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
      <span class="text-xs tracking-wider">กำลังโหลดผลงานศิลปะ...</span>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="artworks.length === 0"
      class="text-center py-20 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 max-w-lg mx-auto"
    >
      <div class="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-base font-semibold text-slate-200 mb-1">ไม่พบผลงานที่ตรงกัน</h3>
      <p class="text-xs text-slate-400 mb-5">ลองปรับคำค้นหาหรือเลือกหมวดหมู่อื่นเพื่อค้นหาผลงาน</p>
      <button
        @click="filters.search = ''; filters.category_id = '';"
        class="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
      >
        ล้างตัวกรองทั้งหมด
      </button>
    </div>

    <!-- Responsive Art Gallery Grid (2-cols on mobile, 3-cols on tablet, 4-cols on desktop) -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
      <ArtworkCard v-for="a in artworks" :key="a.artwork_id" :artwork="a" />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages() > 1" class="flex justify-center items-center mt-12 gap-2">
      <button
        class="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="filters.page <= 1"
        @click="filters.page--"
      >
        ย้อนกลับ
      </button>
      <span class="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400">
        {{ filters.page }} / {{ totalPages() }}
      </span>
      <button
        class="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="filters.page >= totalPages()"
        @click="filters.page++"
      >
        ถัดไป
      </button>
    </div>

  </div>
</template>
