<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import HeroSparkleBackground from '@/components/HeroSparkleBackground.vue'

const artworks    = ref([])
const categories  = ref([])
const loading     = ref(true)
const featured    = ref([])

onMounted(async () => {
  try {
    const [catRes, artRes] = await Promise.all([
      api.get('/categories'),
      api.get('/artworks?limit=6'),
    ])
    categories.value = catRes.data
    artworks.value   = artRes.data.data
    featured.value   = artworks.value.slice(0, 3)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="hero min-h-[60vh] sm:min-h-[70vh] bg-gradient-to-br from-primary to-secondary text-primary-content relative overflow-hidden">
      <!-- Interactive Parallax Sparkle Background -->
      <HeroSparkleBackground />

      <div class="hero-content text-center py-12 sm:py-20 relative z-10 px-4 w-full">
        <div class="max-w-2xl mx-auto">
          <h1 class="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4">🎨 ArtShop</h1>
          <p class="text-base sm:text-xl mb-6 opacity-90">
            ร้านค้าภาพวาดและรับจ้างวาดภาพผลงานศิลปะ<br />
            <span class="text-xs sm:text-sm opacity-70">งานศิลปะคุณภาพ คัดสรรพิเศษ พร้อมจัดส่ง</span>
          </p>
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-sm sm:max-w-none mx-auto">
            <RouterLink to="/shop" class="btn btn-accent btn-md sm:btn-lg w-full sm:w-auto shadow-lg">🛍️ เลือกซื้อภาพวาด</RouterLink>
            <RouterLink to="/commission" class="btn btn-outline btn-md sm:btn-lg text-white border-white hover:bg-white hover:text-primary w-full sm:w-auto shadow-lg">
              ✏️ สั่งจ้างวาดภาพ
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 bg-base-200">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-10 text-primary">ทำไมต้องเลือก ArtShop?</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card bg-base-100 shadow p-6 text-center">
            <div class="text-4xl mb-3">🎨</div>
            <h3 class="font-bold text-lg mb-2">ผลงานศิลปะคุณภาพสูง</h3>
            <p class="text-sm text-base-content/70">ภาพวาดประณีต สวยงาม พร้อมจัดส่งถึงบ้านอย่างปลอดภัย</p>
          </div>
          <div class="card bg-base-100 shadow p-6 text-center">
            <div class="text-4xl mb-3">✏️</div>
            <h3 class="font-bold text-lg mb-2">รับจ้างวาดตามสั่ง</h3>
            <p class="text-sm text-base-content/70">บอกรายละเอียด เลือกแพ็กเกจ แนบไฟล์อ้างอิง แล้วรอรับงานสำเร็จ</p>
          </div>
          <div class="card bg-base-100 shadow p-6 text-center">
            <div class="text-4xl mb-3">🔒</div>
            <h3 class="font-bold text-lg mb-2">ปลอดภัยและโปร่งใส</h3>
            <p class="text-sm text-base-content/70">แสดงค่าธรรมเนียมบริการ 5% แบบเรียลไทม์ ไม่มีค่าซ่อนเร้น</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="py-16 container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-10">หมวดหมู่ผลงาน</h2>
      <div v-if="loading" class="flex justify-center">
        <span class="loading loading-dots loading-lg text-primary"></span>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RouterLink
          v-for="cat in categories"
          :key="cat.category_id"
          :to="`/shop?category_id=${cat.category_id}`"
          class="card bg-base-100 shadow-md border border-base-200 p-6 text-center card-hover group"
        >
          <h3 class="font-bold text-lg group-hover:text-primary transition-colors">{{ cat.category_name }}</h3>
          <p class="text-sm text-base-content/60 mt-2">{{ cat.description }}</p>
        </RouterLink>
      </div>
    </section>

    <!-- CTA Commission -->
    <section class="py-16 bg-gradient-to-r from-secondary to-primary text-white text-center">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-4">ต้องการภาพวาดส่วนตัว?</h2>
        <p class="mb-6 opacity-90 max-w-lg mx-auto">
          เลือกแพ็กเกจที่ต้องการ กรอกรายละเอียด แล้วรอรับผลงานของคุณ
        </p>
        <RouterLink to="/commission" class="btn btn-accent btn-lg">ดูแพ็กเกจ Commission</RouterLink>
      </div>
    </section>
  </div>
</template>

