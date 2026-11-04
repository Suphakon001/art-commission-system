<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const conversations   = ref([])
const activeUser      = ref(null)
const messages        = ref([])
const replyText       = ref('')
const loadingList     = ref(true)
const loadingMessages = ref(false)
const sending         = ref(false)
const messagesBox     = ref(null)
let pollTimer         = null

async function fetchConversations() {
  try {
    const { data } = await api.get('/chat/conversations')
    conversations.value = data
    if (!activeUser.value && conversations.value.length > 0) {
      selectUser(conversations.value[0])
    }
  } catch (err) {
    console.error('Fetch conversations error:', err)
  } finally {
    loadingList.value = false
  }
}

async function selectUser(user) {
  activeUser.value = user
  loadingMessages.value = true
  try {
    const { data } = await api.get(`/chat/messages?other_user_id=${user.user_id}`)
    messages.value = data
    user.unread_count = 0
    await scrollToBottom()
  } catch (err) {
    console.error('Fetch messages error:', err)
  } finally {
    loadingMessages.value = false
  }
}

async function sendReply() {
  if (!replyText.value.trim() || !activeUser.value || sending.value) return
  const text = replyText.value.trim()
  replyText.value = ''
  sending.value = true

  try {
    const { data } = await api.post('/chat/send', {
      receiver_id: activeUser.value.user_id,
      message: text,
    })
    messages.value.push(data)
    await scrollToBottom()
  } catch (err) {
    alert(err.response?.data?.message || 'ส่งข้อความไม่สำเร็จ')
  } finally {
    sending.value = false
  }
}

async function scrollToBottom() {
  await nextTick()
  if (messagesBox.value) {
    messagesBox.value.scrollTop = messagesBox.value.scrollHeight
  }
}

function startPolling() {
  pollTimer = setInterval(async () => {
    // Refresh conversations list
    const { data } = await api.get('/chat/conversations')
    conversations.value = data
    // If active user, refresh their messages
    if (activeUser.value) {
      const msgRes = await api.get(`/chat/messages?other_user_id=${activeUser.value.user_id}`)
      if (msgRes.data.length !== messages.value.length) {
        messages.value = msgRes.data
        await scrollToBottom()
      }
    }
  }, 3500)
}

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchConversations()
  startPolling()
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-primary flex items-center gap-2">
        <span>💬 ศูนย์ข้อความแชท (Customer Chat Center)</span>
      </h1>
      <RouterLink to="/admin" class="btn btn-outline btn-sm">← กลับไป Dashboard</RouterLink>
    </div>

    <!-- Main Chat Layout Card -->
    <div class="card bg-base-100 shadow-xl border border-base-200 overflow-hidden h-[620px] flex flex-col md:flex-row">
      <!-- Left: Conversations List -->
      <div class="w-full md:w-80 border-r border-base-200 flex flex-col bg-base-200/30">
        <div class="p-3.5 border-b border-base-200 font-bold text-sm flex justify-between items-center bg-base-100">
          <span>รายการลูกค้า ({{ conversations.length }})</span>
          <button class="btn btn-ghost btn-xs" @click="fetchConversations">🔄 รีเฟรช</button>
        </div>

        <div v-if="loadingList" class="flex justify-center py-10">
          <span class="loading loading-spinner text-primary"></span>
        </div>

        <div v-else-if="conversations.length === 0" class="p-8 text-center text-base-content/50 text-xs">
          ยังไม่มีข้อความสนทนาจากลูกค้า
        </div>

        <div v-else class="flex-1 overflow-y-auto divide-y divide-base-200">
          <div
            v-for="c in conversations"
            :key="c.user_id"
            class="p-3.5 cursor-pointer hover:bg-base-200/70 transition-colors flex items-start gap-3"
            :class="activeUser?.user_id === c.user_id ? 'bg-primary/10 border-l-4 border-primary' : ''"
            @click="selectUser(c)"
          >
            <div class="avatar placeholder shrink-0">
              <div class="bg-primary/20 text-primary font-bold rounded-full w-10 text-sm">
                {{ c.username?.charAt(0)?.toUpperCase() || 'U' }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline mb-0.5">
                <span class="font-bold text-xs truncate">{{ c.username }}</span>
                <span class="text-[10px] text-base-content/40">{{ fmtDate(c.last_message_time) }}</span>
              </div>
              <p class="text-[11px] text-base-content/60 truncate">{{ c.last_message }}</p>
            </div>
            <span
              v-if="c.unread_count > 0"
              class="badge badge-error badge-xs text-white font-bold shrink-0 mt-1"
            >
              {{ c.unread_count }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right: Active Chat Area -->
      <div class="flex-1 flex flex-col bg-base-100">
        <!-- Selected User Header -->
        <div v-if="activeUser" class="p-3.5 border-b border-base-200 flex items-center justify-between bg-base-200/20">
          <div class="flex items-center gap-3">
            <div class="avatar placeholder">
              <div class="bg-secondary text-secondary-content rounded-full w-9 text-xs font-bold">
                {{ activeUser.username?.charAt(0)?.toUpperCase() }}
              </div>
            </div>
            <div>
              <h3 class="font-bold text-sm">{{ activeUser.username }}</h3>
              <span class="text-xs text-base-content/50">{{ activeUser.email }}</span>
            </div>
          </div>
          <span class="badge badge-success badge-sm text-white font-medium">ลูกค้า</span>
        </div>

        <!-- Chat Messages Container -->
        <div
          v-if="activeUser"
          ref="messagesBox"
          class="flex-1 p-4 overflow-y-auto space-y-3 bg-base-200/20 text-xs"
        >
          <div v-if="loadingMessages" class="flex justify-center py-10">
            <span class="loading loading-spinner text-primary"></span>
          </div>

          <div
            v-for="m in messages"
            :key="m.message_id"
            :class="m.sender_role === 'admin' ? 'chat chat-end' : 'chat chat-start'"
          >
            <div v-if="m.sender_role === 'admin'" class="chat-image avatar">
              <div class="w-7 h-7 rounded-full overflow-hidden shadow-sm ring-1 ring-primary/30">
                <img src="/images/profile.jpg" alt="Admin" class="w-full h-full object-cover" />
              </div>
            </div>
            <div class="chat-header text-[10px] text-base-content/50 mb-0.5">
              {{ m.sender_role === 'admin' ? 'คุณ (Admin)' : m.sender_name }}
              <time class="text-[9px] opacity-70 ml-1">{{ fmtDate(m.created_at) }}</time>
            </div>
            <div
              :class="m.sender_role === 'admin'
                ? 'chat-bubble chat-bubble-primary text-white text-xs shadow-sm'
                : 'chat-bubble bg-base-100 text-base-content text-xs border border-base-300 shadow-sm'"
            >
              {{ m.message }}
            </div>
          </div>
        </div>

        <div v-else class="flex-1 flex items-center justify-center text-base-content/40 text-sm">
          เลือกรายชื่อลูกค้าทางซ้ายเพื่อเริ่มสนทนา
        </div>

        <!-- Chat Reply Input -->
        <form
          v-if="activeUser"
          @submit.prevent="sendReply"
          class="p-3 border-t border-base-200 flex items-center gap-2 bg-base-100"
        >
          <input
            v-model="replyText"
            type="text"
            placeholder="ตอบกลับลูกค้า..."
            class="input input-bordered input-sm flex-1 text-xs rounded-xl"
            :disabled="sending"
          />
          <button
            type="submit"
            class="btn btn-primary btn-sm px-5 rounded-xl shadow-md"
            :disabled="!replyText.trim() || sending"
          >
            <span v-if="sending" class="loading loading-spinner loading-xs"></span>
            <span v-else>ส่งข้อความ</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

