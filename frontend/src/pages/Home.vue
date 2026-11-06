<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import ArtworkCard from '@/components/ArtworkCard.vue'

const artworks    = ref([])
const categories  = ref([])
const loading     = ref(true)
const featured    = ref([])

onMounted(async () => {
  try {
    const [catRes, artRes] = await Promise.all([
      api.get('/categories'),
      api.get('/artworks?limit=8'),
    ])
    categories.value = catRes.data
    artworks.value   = artRes.data.data
    featured.value   = artworks.value.slice(0, 4)
  } catch (err) {
    console.error('Home load error:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="overflow-hidden">
    
    <!-- Hero Section -->
    <section class="relative min-h-[68vh] sm:min-h-[75vh] flex items-center justify-center bg-slate-950 overflow-hidden px-4 sm:px-6">
      
      <!-- Studio Ambient Glows -->
      <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div class="absolute -bottom-40 left-1/4 w-[500px] h-[300px] bg-slate-800/40 blur-[120px] rounded-full pointer-events-none"></div>
      
      <!-- Subtle Architectural Grid Pattern -->
      <div class="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25 pointer-events-none"></div>

      <div class="relative z-10 max-w-4xl mx-auto text-center py-16 sm:py-24">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-mono mb-6 shadow-xl">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          ARTSHOP STUDIO & GALLERY
        </div>

        <!-- Headline -->
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.15] mb-5">
          แกลเลอรีภาพวาดศิลปะ<br />
          <span class="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            และบริการสั่งวาดระดับพรีเมียม
          </span>
        </h1>

        <!-- Subtitle -->
        <p class="text-xs sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 font-normal">
          คลังภาพวาดดิจิทัลอาร์ตและภาพประกอบต้นฉบับโดยศิลปินมืออาชีพ พร้อมสิทธิ์การใช้งาน ไฟล์ต้นฉบับความละเอียดสูง และบริการรับวาดภาพตามบรีฟที่คุณต้องการ
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-sm sm:max-w-none mx-auto">
          <RouterLink
            to="/shop"
            class="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <span>ชมคอลเลกชันภาพวาด</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </RouterLink>

          <RouterLink
            to="/commission"
            class="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
          >
            <span>สั่งวาดภาพพิเศษ</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Featured Artworks Section -->
    <section class="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
        <div>
          <span class="text-xs font-mono font-semibold uppercase tracking-widest text-amber-400">Featured Art</span>
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight mt-1">
            ผลงานศิลปะไฮไลต์
          </h2>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            ผลงานศิลปะคัดสรรพิเศษ พร้อมจัดส่งและดาวน์โหลดได้ทันที
          </p>
        </div>

        <RouterLink
          to="/shop"
          class="text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <span>ดูทั้งหมด</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </RouterLink>
      </div>

      <!-- Featured Art Grid -->
      <div v-if="loading" class="flex justify-center py-20 text-slate-500">
        <div class="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
        <ArtworkCard v-for="a in featured" :key="a.artwork_id" :artwork="a" />
      </div>
    </section>

    <!-- Studio Quality Pillars -->
    <section class="py-16 bg-slate-900/60 border-y border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="text-xs font-mono uppercase tracking-widest text-amber-400">Studio Standards</span>
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
            มาตรฐานงานศิลปะระดับมืออาชีพ
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <!-- Pillar 1 -->
          <div class="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 transition-colors">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="text-base font-semibold text-slate-100 mb-2">ไฟล์ต้นฉบับความละเอียดสูง</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              งานทุกชิ้นมอบไฟล์ความละเอียดสูง 300 DPI (PNG / JPG) เหมาะสำหรับงานพิมพ์ ของสะสม หรือสื่อดิจิทัล
            </p>
          </div>

          <!-- Pillar 2 -->
          <div class="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 transition-colors">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </div>
            <h3 class="text-base font-semibold text-slate-100 mb-2">บริการสั่งวาดตามต้องการ</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              ระบุรายละเอียด บรีฟท่าทาง แนบภาพอ้างอิง และติดตามขั้นตอนการทำงานตั้งแต่ภาพร่างจนถึงงานสมบูรณ์
            </p>
          </div>

          <!-- Pillar 3 -->
          <div class="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 transition-colors">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 class="text-base font-semibold text-slate-100 mb-2">ระบบชำระเงินปลอดภัยและโปร่งใส</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              ตรวจสอบการชำระเงินด้วยสลิป PromptPay พร้อมระบบคำนวณค่าธรรมเนียมบริการ 5% ชัดเจน ไม่มีค่าใช้จ่ายแอบแฝง
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="text-xs font-mono uppercase tracking-widest text-amber-400">Categories</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
          หมวดหมู่ผลงานศิลปะ
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RouterLink
          v-for="cat in categories"
          :key="cat.category_id"
          :to="`/shop?category_id=${cat.category_id}`"
          class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/40 hover:-translate-y-1 transition-all group"
        >
          <div class="text-xs font-mono text-amber-400/70 mb-2">COLLECTION</div>
          <h3 class="text-base font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
            {{ cat.category_name }}
          </h3>
          <p class="text-xs text-slate-400 mt-2 line-clamp-2">
            {{ cat.description }}
          </p>
        </RouterLink>
      </div>
    </section>

    <!-- Commission Banner Callout -->
    <section class="relative py-16 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800 text-center px-4">
      <div class="max-w-3xl mx-auto">
        <span class="text-xs font-mono uppercase tracking-widest text-amber-400">Custom Commission</span>
        <h2 class="text-2xl sm:text-4xl font-bold text-slate-100 mt-2 mb-3">
          ต้องการภาพวาดเฉพาะสำหรับคุณ?
        </h2>
        <p class="text-xs sm:text-sm text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
          เลือกแพ็กเกจวาดภาพ ระบุรายละเอียดของตัวละครหรือคอนเซปต์ที่คุณต้องการ สั่งจ้างและติดตามผลงานได้โดยตรงกับสตูดิโอ
        </p>
        <RouterLink
          to="/commission"
          class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all"
        >
          <span>ดูรายละเอียดแพ็กเกจ Commission</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </RouterLink>
      </div>
    </section>

  </div>
</template>
