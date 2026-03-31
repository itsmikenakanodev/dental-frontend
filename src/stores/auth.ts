import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest } from '@/types'
import { authService } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isDentist = computed(() => user.value?.role === 'DENTIST')
  const isAssistant = computed(() => user.value?.role === 'ASSISTANT')

  const initFromStorage = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  const login = async (credentials: LoginRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)
      token.value = response.access_token
      user.value = response.user

      localStorage.setItem('token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))

      return response
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    error.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const getFullName = () => {
    if (!user.value) return ''
    return `${user.value.firstName} ${user.value.lastName}`
  }

  initFromStorage()

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isDentist,
    isAssistant,
    login,
    logout,
    getFullName,
    initFromStorage,
  }
})
