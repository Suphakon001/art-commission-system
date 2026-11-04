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
  const { data } = await api.get('/categories')
  categories.value = [{ category_id: '', category_name: 'ทั้งหมด' }, ...data]
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
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-primary">🛍️ ร้านค้าภาพวาดและผลงานศิลปะ</h1>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-3 mb-8">
      <input
        v-model="filters.search"
        type="text" placeholder="ค้นหาผลงาน..."
        class="input input-bordered w-full md:max-w-xs"
      />
      <select v-model="filters.category_id" class="select select-bordered">
        <option v-for="c in categories" :key="c.category_id" :value="c.category_id">
          {{ c.category_name }}
        </option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Empty -->
    <div v-else-if="artworks.length === 0" class="text-center py-20 text-base-content/50">
      <div class="text-6xl mb-4">🎨</div>
      <p>ไม่พบผลงานที่ตรงกัน</p>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      <ArtworkCard v-for="a in artworks" :key="a.artwork_id" :artwork="a" />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages() > 1" class="flex justify-center mt-8 gap-2">
      <button
        class="btn btn-sm"
        :disabled="filters.page <= 1"
        @click="filters.page--"
      >«</button>
      <span class="btn btn-sm btn-disabled">{{ filters.page }} / {{ totalPages() }}</span>
      <button
        class="btn btn-sm"
        :disabled="filters.page >= totalPages()"
        @click="filters.page++"
      >»</button>
    </div>
  </div>
</template>

