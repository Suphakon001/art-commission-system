<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const router = useRouter()
const auth   = useAuthStore()

const isOpen      = ref(false)
const messages    = ref([])
const newMessage  = ref('')
const sending     = ref(false)
const unreadCount = ref(0)
const messagesBox = ref(null)
let pollTimer     = null

const isLoggedIn = computed(() => auth.isLoggedIn)
const isAdmin    = computed(() => auth.isAdmin)

async function fetchUnread() {
  if (!isLoggedIn.value) return
  try {
    const { data } = await api.get('/chat/unread-count')
    unreadCount.value = data.unread
  } catch {}
}

async function fetchMessages() {
  if (!isLoggedIn.value) return
  try {
    const { data } = await api.get('/chat/messages')
    messages.value = data
    unreadCount.value = 0
    await scrollToBottom()
  } catch (err) {
    console.error('Fetch messages error:', err)
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || sending.value) return
  const text = newMessage.value.trim()
  newMessage.value = ''
  sending.value = true

  try {
    const { data } = await api.post('/chat/send', { message: text })
    messages.value.push(data)
    await scrollToBottom()
  } catch (err) {
    alert(err.response?.data?.message || 'ส่งข้อความไม่สำเร็จ')
  } finally {
    sending.value = false
  }
}

function sendQuick(text) {
  newMessage.value = text
  sendMessage()
}

async function scrollToBottom() {
  await nextTick()
  if (messagesBox.value) {
    messagesBox.value.scrollTop = messagesBox.value.scrollHeight
  }
}

function toggleChat() {
  if (isAdmin.value) {
    if (router.currentRoute.value.path !== '/admin/chat') {
      router.push('/admin/chat')
    }
    return
  }
  isOpen.value = !isOpen.value
  if (isOpen.value && isLoggedIn.value) {
    fetchMessages()
    startPolling()
  } else {
    stopPolling()
  }
}

function startPolling() {
  stopPolling()
  pollTimer = setInterval(() => {
    if (isOpen.value && isLoggedIn.value) {
      fetchMessages()
    } else if (isLoggedIn.value) {
      fetchUnread()
    }
  }, 3500)
}

function stopPolling() {
  if (pollTimer) clearInterval(pollTimer)
}

function fmtTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

watch(isOpen, (open) => {
  if (open) scrollToBottom()
})

onMounted(() => {
  if (isLoggedIn.value) {
    fetchUnread()
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <!-- Floating Chat Container (Bottom Right) -->
  <div
    v-if="!(isAdmin && router.currentRoute.value.path === '/admin/chat')"
    class="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end"
  >
    <!-- Chat Window Popup -->
    <div
      v-if="isOpen"
      class="card w-[calc(100vw-24px)] max-w-sm sm:w-96 h-[480px] max-h-[78vh] bg-base-100 shadow-2xl border border-primary/30 rounded-2xl sm:rounded-3xl overflow-hidden mb-2 sm:mb-3 flex flex-col animate-scaleUp"
    >
      <!-- Chat Header -->
      <div class="bg-gradient-to-r from-primary to-secondary text-primary-content p-3.5 flex items-center justify-between shadow-md">
        <div class="flex items-center gap-2.5">
          <div class="avatar">
            <div class="w-10 h-10 rounded-full ring-2 ring-white/50 overflow-hidden shadow">
              <img src="/images/profile.jpg" alt="ArtShop Admin" class="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <h4 class="font-bold text-sm leading-tight">ArtShop Studio & Admin</h4>
            <span class="text-[11px] text-white/80 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              แอดมินออนไลน์ พร้อมตอบแชท
            </span>
          </div>
        </div>
        <button
          class="btn btn-ghost btn-circle btn-xs text-white hover:bg-white/20"
          @click="isOpen = false"
        >
          ✕
        </button>
      </div>

      <!-- Body: Not Logged In -->
      <div
        v-if="!isLoggedIn"
        class="flex-1 p-6 flex flex-col items-center justify-center text-center bg-base-100"
      >
        <div class="text-4xl mb-3">💬</div>
        <h4 class="font-bold text-base text-base-content">เข้าสู่ระบบเพื่อเริ่มพูดคุย</h4>
        <p class="text-xs text-base-content/60 mt-1 mb-5">
          กรุณาเข้าสู่ระบบ เพื่อให้คุณสามารถส่งข้อความ สอบถามคิวงาน และพูดคุยกับแอดมินได้ตลอดเวลา
        </p>
        <RouterLink
          to="/login"
          class="btn btn-primary btn-sm rounded-xl px-6"
          @click="isOpen = false"
        >
          เข้าสู่ระบบ
        </RouterLink>
      </div>

      <!-- Body: Logged In & Admin Info banner -->
      <template v-else>
        <!-- Message Bubbles Container -->
        <div
          ref="messagesBox"
          class="flex-1 p-3.5 overflow-y-auto space-y-3 bg-base-200/40 text-xs"
        >
          <!-- Welcome message -->
          <div class="chat chat-start">
            <div class="chat-image avatar">
              <div class="w-8 h-8 rounded-full overflow-hidden shadow ring-1 ring-primary/30">
                <img src="/images/profile.jpg" alt="ArtShop Admin" class="w-full h-full object-cover" />
              </div>
            </div>
            <div class="chat-header text-[10px] text-base-content/50 mb-0.5">
              ArtShop Admin
            </div>
            <div class="chat-bubble chat-bubble-primary text-xs shadow-sm leading-relaxed">
              สวัสดีครับ! 👋 มีข้อสงสัยเกี่ยวกับภาพวาด หรือต้องการสอบถามเรื่องคิวงาน Commission พิมพ์ข้อความไว้ได้เลยนะครับ
            </div>
          </div>

          <!-- Messages loop -->
          <div
            v-for="msg in messages"
            :key="msg.message_id"
            :class="msg.sender_id === auth.userInfo?.user_id ? 'chat chat-end' : 'chat chat-start'"
          >
            <div v-if="msg.sender_id !== auth.userInfo?.user_id" class="chat-image avatar">
              <div class="w-7 h-7 rounded-full overflow-hidden shadow-sm ring-1 ring-primary/30">
                <img src="/images/profile.jpg" alt="ArtShop Admin" class="w-full h-full object-cover" />
              </div>
            </div>
            <div class="chat-header text-[10px] text-base-content/50 mb-0.5">
              {{ msg.sender_id === auth.userInfo?.user_id ? 'คุณ' : (msg.sender_name || 'แอดมิน') }}
              <time class="text-[9px] opacity-70 ml-1">{{ fmtTime(msg.created_at) }}</time>
            </div>
            <div
              :class="msg.sender_id === auth.userInfo?.user_id
                ? 'chat-bubble chat-bubble-secondary text-white text-xs shadow-sm'
                : 'chat-bubble bg-base-100 text-base-content text-xs border border-base-300 shadow-sm'"
            >
              {{ msg.message }}
            </div>
          </div>
        </div>

        <!-- Quick Reply Chips -->
        <div class="px-3 py-1.5 bg-base-100 border-t border-base-200 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none text-[11px]">
          <button
            type="button"
            class="badge badge-outline hover:badge-primary cursor-pointer text-[10px] py-2"
            @click="sendQuick('สอบถามคิวงาน Commission ตอนนี้หน่อยครับ')"
          >
            ⏳ สอบถามคิวงาน
          </button>
          <button
            type="button"
            class="badge badge-outline hover:badge-primary cursor-pointer text-[10px] py-2"
            @click="sendQuick('ต้องการสั่งวาดภาพเชิงพาณิชย์ครับ')"
          >
            🎨 วาดเชิงพาณิชย์
          </button>
          <button
            type="button"
            class="badge badge-outline hover:badge-primary cursor-pointer text-[10px] py-2"
            @click="sendQuick('โอนเงินและแนบสลิปแล้วครับ')"
          >
            🧾 แจ้งชำระเงิน
          </button>
        </div>

        <!-- Chat Input Footer -->
        <form
          @submit.prevent="sendMessage"
          class="p-2.5 bg-base-100 border-t border-base-200 flex items-center gap-2"
        >
          <input
            v-model="newMessage"
            type="text"
            placeholder="พิมพ์ข้อความที่นี่..."
            class="input input-bordered input-sm flex-1 text-xs rounded-xl"
            :disabled="sending"
          />
          <button
            type="submit"
            class="btn btn-primary btn-sm btn-circle shrink-0 shadow-md"
            :disabled="!newMessage.trim() || sending"
          >
            <span v-if="sending" class="loading loading-spinner loading-xs"></span>
            <span v-else>➤</span>
          </button>
        </form>
      </template>
    </div>

    <!-- Floating Trigger Button -->
    <button
      class="btn btn-primary rounded-full shadow-2xl px-3.5 py-2 sm:px-5 sm:py-3 flex items-center gap-1.5 sm:gap-2.5 hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm font-bold border-2 border-white"
      @click="toggleChat"
    >
      <span class="text-base sm:text-xl">💬</span>
      <span>{{ isAdmin ? 'ศูนย์ข้อความแชท' : 'แชทกับแอดมิน' }}</span>
      <span
        v-if="unreadCount > 0"
        class="badge badge-error badge-xs sm:badge-sm text-white font-bold animate-bounce"
      >
        {{ unreadCount }}
      </span>
    </button>
  </div>
</template>

<style scoped>
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-scaleUp {
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>

