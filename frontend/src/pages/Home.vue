<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import ArtworkCard from '@/components/ArtworkCard.vue'

const router      = useRouter()
const artworks    = ref([])
const categories  = ref([])
const loading     = ref(true)
const activeCategory = ref('')

const categoryList = [
  { id: '',            name: 'ทั้งหมด',               icon: 'all' },
  { id: 'illustration',name: 'ภาพประกอบ (Illustration)', icon: 'image' },
  { id: 'anime',       name: 'ภาพสไตล์อนิเมะ (Anime)', icon: 'anime' },
  { id: 'pixel',       name: 'ภาพพิกเซล (Pixel Art)',  icon: 'pixel' },
  { id: 'background',  name: 'ภาพพื้นหลัง (Background)',icon: 'scenery' },
  { id: 'commission',  name: 'รับจ้างวาดภาพ (Commission)', icon: 'pen' },
  { id: 'popular',     name: 'ผลงานยอดนิยม',          icon: 'star' },
]

function selectCategory(cat) {
  if (cat.id === 'commission') {
    router.push('/commission')
  } else {
    activeCategory.value = cat.id
    router.push({ path: '/shop', query: cat.id ? { search: cat.name.split(' ')[0] } : {} })
  }
}

onMounted(async () => {
  try {
    const [catRes, artRes] = await Promise.all([
      api.get('/categories'),
      api.get('/artworks?limit=12'),
    ])
    categories.value = catRes.data
    artworks.value   = artRes.data.data
  } catch (err) {
    console.error('Home load error:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
    
    <!-- Hero Banner (Clean AI-generated illustration with sharp UI overlay) -->
    <section class="relative rounded-3xl overflow-hidden shadow-soft border border-purple-100/80 bg-purple-950 text-white min-h-[220px] sm:min-h-[270px] flex items-center">
      <!-- Background Graphic (Clean illustration without text) -->
      <img
        src="/images/hero-banner.jpg"
        alt="ArtSpace Banner"
        class="absolute inset-0 w-full h-full object-cover object-left md:object-center pointer-events-none"
      />

      <!-- Soft right-side gradient overlay for crisp text contrast -->
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-purple-950/20 to-purple-950/70 sm:to-purple-950/60 pointer-events-none"></div>
      
      <!-- Overlay Content for sharp readability & responsiveness -->
      <div class="relative z-10 w-full p-6 sm:p-10 flex flex-col items-end text-right ml-auto max-w-xl">
        <span class="text-xs sm:text-sm font-bold text-purple-200 tracking-wider mb-1 flex items-center gap-1.5 drop-shadow">
          <span class="text-amber-300">✦</span> ร้านค้าออนไลน์ & รับจ้างวาดภาพ
        </span>
        <h2 class="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg leading-tight font-sans">
          "ร้านค้าออนไลน์<br class="hidden sm:inline" />สำหรับคนรักงานศิลปะ"
        </h2>
        <p class="text-xs sm:text-sm text-purple-100/90 mt-2 font-medium drop-shadow-md max-w-md">
          ซื้อผลงานศิลปะ • สั่งจ้างวาดภาพ (Commission) ได้ในที่เดียว!
        </p>
        <RouterLink
          to="/shop"
          class="mt-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-purple-300/30"
        >
          <span>เริ่มเลือกชมผลงาน</span>
          <span class="text-base leading-none">→</span>
        </RouterLink>
      </div>
    </section>

    <!-- Category Navigation Pills (Exact match to Reference 2) -->
    <section class="bg-white rounded-2xl p-2.5 sm:p-3 border border-purple-100 shadow-soft overflow-x-auto">
      <div class="flex items-center gap-2 min-w-max">
        
        <!-- ทั้งหมด -->
        <button
          @click="selectCategory({ id: '', name: 'ทั้งหมด' })"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all"
          :class="activeCategory === '' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 11h6a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v6a1 1 0 001 1zm10 0h6a1 1 0 001-1V4a1 1 0 00-1-1h-6a1 1 0 00-1 1v6a1 1 0 001 1zM4 21h6a1 1 0 001-1v-6a1 1 0 00-1-1H4a1 1 0 00-1 1v6a1 1 0 001 1zm10 0h6a1 1 0 001-1v-6a1 1 0 00-1-1h-6a1 1 0 00-1 1v6a1 1 0 001 1z"/>
          </svg>
          <span>ทั้งหมด</span>
        </button>

        <!-- ภาพประกอบ -->
        <button
          @click="selectCategory(categoryList[1])"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 transition-all"
        >
          <div class="w-5 h-5 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <span>ภาพประกอบ (Illustration)</span>
        </button>

        <!-- ภาพสไตล์อนิเมะ -->
        <button
          @click="selectCategory(categoryList[2])"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 transition-all"
        >
          <span class="text-base">👩‍🎨</span>
          <span>ภาพสไตล์อนิเมะ (Anime)</span>
        </button>

        <!-- ภาพพิกเซล -->
        <button
          @click="selectCategory(categoryList[3])"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 transition-all"
        >
          <span class="text-base text-rose-500">💖</span>
          <span>ภาพพิกเซล (Pixel Art)</span>
        </button>

        <!-- ภาพพื้นหลัง -->
        <button
          @click="selectCategory(categoryList[4])"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 transition-all"
        >
          <div class="w-5 h-5 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"/>
            </svg>
          </div>
          <span>ภาพพื้นหลัง (Background)</span>
        </button>

        <!-- รับจ้างวาดภาพ -->
        <RouterLink
          to="/commission"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 transition-all"
        >
          <div class="w-5 h-5 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </div>
          <span>รับจ้างวาดภาพ (Commission)</span>
        </RouterLink>

        <!-- ผลงานยอดนิยม -->
        <button
          @click="selectCategory(categoryList[6])"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 transition-all"
        >
          <span class="text-amber-400">★</span>
          <span>ผลงานยอดนิยม</span>
        </button>

      </div>
    </section>

    <!-- Main Content Area: Left Gallery + Right Sidebar (Reference 2 Layout) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Left Column (Art Showcase - approx 8.5 cols) -->
      <div class="lg:col-span-8 space-y-8">
        
        <!-- Section 1: ผลงานแนะนำ -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span class="text-purple-700">★</span>
              <span>ผลงานแนะนำ</span>
            </h2>
            <RouterLink to="/shop" class="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1">
              <span>ดูทั้งหมด</span>
              <span>→</span>
            </RouterLink>
          </div>

          <div v-if="loading" class="flex justify-center py-16">
            <div class="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
            <ArtworkCard
              v-for="a in artworks.slice(0, 4)"
              :key="a.artwork_id"
              :artwork="a"
            />
          </div>
        </section>

        <!-- Section 2: สินค้าขายดี -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span class="text-rose-500">🔥</span>
              <span>สินค้าขายดี</span>
            </h2>
            <RouterLink to="/shop" class="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1">
              <span>ดูทั้งหมด</span>
              <span>→</span>
            </RouterLink>
          </div>

          <div v-if="loading" class="flex justify-center py-16">
            <div class="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
            <ArtworkCard
              v-for="a in artworks.slice(4, 8)"
              :key="a.artwork_id"
              :artwork="a"
            />
          </div>
        </section>

      </div>

      <!-- Right Column (Sidebar Cards - approx 3.5 cols) -->
      <div class="lg:col-span-4 space-y-6">
        
        <!-- Commission Card with Mascot (Exact Reference Style) -->
        <div class="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-purple-100/90 via-purple-50 to-indigo-50 border border-purple-200/80 shadow-soft relative overflow-hidden">
          <div class="flex items-center gap-2 text-purple-900 font-bold text-sm sm:text-base mb-3">
            <div class="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </div>
            <span>บริการรับจ้างวาดภาพ (Commission)</span>
          </div>

          <!-- Features Checklist -->
          <ul class="space-y-2 text-xs text-slate-700 mb-5 relative z-10">
            <li class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span>กรอกแบบฟอร์มง่าย รู้ราคาก่อนสั่ง</span>
            </li>
            <li class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span>ติดตามสถานะงานได้ตลอด</span>
            </li>
            <li class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span>เริ่มต้นเพียง 500 บาท</span>
            </li>
          </ul>

          <div class="flex items-end justify-between relative z-10">
            <RouterLink
              to="/commission"
              class="px-5 py-2.5 rounded-full bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md shadow-purple-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>สั่งจ้างวาดภาพเลย</span>
              <span>→</span>
            </RouterLink>

            <!-- Mascot Character -->
            <img
              src="/images/mascot-boy.png"
              alt="ArtSpace Mascot"
              class="w-24 h-auto object-contain -mr-2 -mb-2"
              @error="$event.target.style.display='none'"
            />
          </div>
        </div>

        <!-- News & Updates Card (Exact Reference Style) -->
        <div class="rounded-3xl p-5 bg-white border border-purple-100 shadow-soft">
          <div class="flex items-center gap-2 text-purple-900 font-bold text-sm mb-4">
            <span class="text-purple-600">📢</span>
            <span>ข่าวสาร & อัปเดต</span>
          </div>

          <div class="flex items-center gap-3 p-2.5 rounded-2xl bg-purple-50/50 border border-purple-100 hover:bg-purple-50 transition-colors">
            <img
              src="/images/news-thumb.jpg"
              alt="News Update"
              class="w-16 h-12 object-cover rounded-xl shrink-0"
              @error="$event.target.style.display='none'"
            />
            <div class="min-w-0">
              <span class="text-[10px] text-purple-600 font-mono block">26 เม.ย. 2568</span>
              <h4 class="text-xs font-bold text-slate-800 line-clamp-2">เปิดให้บริการระบบใหม่แล้ววันนี้!</h4>
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>
