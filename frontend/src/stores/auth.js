// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token    = ref(localStorage.getItem('token') || null)
  const userInfo = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin    = computed(() => userInfo.value?.role === 'admin')
  const username   = computed(() => userInfo.value?.username || '')

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    token.value    = data.token
    userInfo.value = { username: data.username, role: data.role }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(userInfo.value))
  }

  async function register(username, email, password) {
    const { data } = await api.post('/auth/register', { username, email, password })
    token.value    = data.token
    userInfo.value = { username: data.username, role: data.role }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(userInfo.value))
  }

  function logout() {
    token.value    = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, userInfo, isLoggedIn, isAdmin, username, login, register, logout }
})

