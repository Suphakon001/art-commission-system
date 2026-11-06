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
const sortBy     = ref('latest')

const filters = ref({
  category_id: route.query.category_id || '',
  search:      route.query.search      || '',
  page:        parseInt(route.query.page) || 1,
  limit:       12,
})

const shopTabs = [
  { id: '',        name: 'ทั้งหมด' },
  { id: 'anime',   name: 'อนิเมะ' },
  { id: 'fanart',  name: 'แฟนอาร์ต' },
  { id: 'bg',      name: 'ภาพพื้นหลัง' },
  { id: 'other',   name: 'อื่นๆ' },
]

const activeTab = ref('')

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
  } catch (err) {
    console.error('Fetch artworks error:', err)
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const { data } = await api.get('/categories')
    categories.value = [{ category_id: '', category_name: 'ทั้งหมด' }, ...data]
  } catch (err) {
    console.error('Fetch categories error:', err)
  }
}

function selectTab(tab) {
  activeTab.value = tab.id
  if (tab.id === '') {
    filters.value.category_id = ''
    filters.value.search = ''
  } else {
    filters.value.search = tab.name
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
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Left Sidebar Menu (Matching Reference 1 Shop Page) -->
      <aside class="hidden lg:block lg:col-span-3 bg-white rounded-3xl p-4 border border-purple-100 shadow-soft sticky top-24">
        <div class="flex items-center gap-2 px-3 py-2 text-purple-950 font-bold text-base mb-2">
          <svg class="w-5 h-5 text-purple-600 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.49 2 2 6.49 2 12c0 4.41 3.59 8 8 8 .55 0 1-.45 1-1 0-.25-.09-.47-.26-.64-.17-.18-.27-.41-.27-.67 0-.55.45-1 1-1h1.53c4.41 0 8-3.59 8-8 0-5.51-4.49-10-10-10zm-5.5 8c-.83 0-1.5-.67-1.5-1.5S5.67 7 6.5 7s1.5.67 1.5 1.5S7.33 10 6.5 10zm3-3c-.83 0-1.5-.67-1.5-1.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 3c-.83 0-1.5-.67-1.5-1.5S16.67 7 17.5 7s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          <span>ArtSpace</span>
        </div>

        <nav class="space-y-1 text-xs font-semibold">
          <RouterLink
            to="/"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <span>🏠</span>
            <span>หน้าหลัก</span>
          </RouterLink>

          <RouterLink
            to="/shop"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-100/90 text-purple-700 font-bold transition-colors"
          >
            <span>🛍️</span>
            <span>ร้านค้า</span>
          </RouterLink>

          <RouterLink
            to="/commission"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <span>✏️</span>
            <span>Commission</span>
          </RouterLink>

          <RouterLink
            to="/tracking"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <span>📋</span>
            <span>ติดตามงาน</span>
          </RouterLink>

          <RouterLink
            to="/checkout"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <span>💳</span>
            <span>แจ้งชำระเงิน</span>
          </RouterLink>

          <RouterLink
            to="/profile"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <span>👤</span>
            <span>โปรไฟล์</span>
          </RouterLink>
        </nav>
      </aside>

      <!-- Main Shop Content Area (Matching Reference 1) -->
      <main class="lg:col-span-9 space-y-4">
        
        <!-- Search, Category Tabs, Sort Filter Row -->
        <div class="bg-white rounded-3xl p-4 border border-purple-100 shadow-soft space-y-3">
          
          <!-- Top: Search Bar -->
          <div class="relative w-full">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="filters.search"
              type="text"
              placeholder="ค้นหาสินค้า..."
              class="w-full pl-10 pr-4 py-2 bg-purple-50/50 border border-purple-100 rounded-full text-xs sm:text-sm text-slate-800 placeholder-purple-400 outline-none focus:bg-white focus:border-purple-400 transition-colors"
            />
          </div>

          <!-- Bottom: Category Filter Tabs & Sort Dropdown (Reference Style) -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
            
            <!-- Category Tabs -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                v-for="tab in shopTabs"
                :key="tab.id"
                @click="selectTab(tab)"
                class="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
                :class="activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'"
              >
                {{ tab.name }}
              </button>
            </div>

            <!-- Sort Dropdown -->
            <div class="flex items-center gap-2 shrink-0 text-xs text-slate-600">
              <span class="text-slate-500 font-medium hidden sm:inline">เรียงตาม:</span>
              <select
                v-model="sortBy"
                class="px-3 py-1.5 rounded-full bg-purple-50/60 border border-purple-100 text-xs font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option value="latest">ล่าสุด</option>
                <option value="price_asc">ราคา: ต่ำ - สูง</option>
                <option value="price_desc">ราคา: สูง - ต่ำ</option>
              </select>
            </div>

          </div>

        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-20 text-purple-600">
          <div class="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="artworks.length === 0" class="text-center py-20 px-4 rounded-3xl bg-white border border-purple-100 shadow-soft">
          <div class="text-4xl mb-3">🎨</div>
          <h3 class="text-base font-bold text-slate-800 mb-1">ไม่พบผลงานที่ตรงกัน</h3>
          <p class="text-xs text-slate-500 mb-4">ลองปรับคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
          <button
            @click="filters.search = ''; activeTab = '';"
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-700 text-white"
          >
            แสดงผลงานทั้งหมด
          </button>
        </div>

        <!-- 3 Columns Artwork Cards Grid (Matching Reference 1 Shop Page) -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <ArtworkCard
            v-for="a in artworks"
            :key="a.artwork_id"
            :artwork="a"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages() > 1" class="flex justify-center items-center mt-8 gap-2">
          <button
            class="px-3 py-1.5 rounded-xl text-xs bg-white border border-purple-100 text-purple-700 hover:bg-purple-50 disabled:opacity-40"
            :disabled="filters.page <= 1"
            @click="filters.page--"
          >
            « ก่อนหน้า
          </button>
          <span class="px-3 py-1.5 rounded-xl text-xs font-bold text-purple-900 bg-purple-100">
            {{ filters.page }} / {{ totalPages() }}
          </span>
          <button
            class="px-3 py-1.5 rounded-xl text-xs bg-white border border-purple-100 text-purple-700 hover:bg-purple-50 disabled:opacity-40"
            :disabled="filters.page >= totalPages()"
            @click="filters.page++"
          >
            ถัดไป »
          </button>
        </div>

      </main>

    </div>

  </div>
</template>
