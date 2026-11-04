<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import ChatWidget from '@/components/ChatWidget.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-base-100">
    <Navbar />
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer />
    <ChatWidget />
  </div>
</template>

