import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { userService } from '@/services/api'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const patients = ref<User[]>([])
  const dentists = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const activePatients = computed(() => 
    patients.value.filter(u => u.isActive)
  )

  const activeDentists = computed(() => 
    dentists.value.filter(u => u.isActive)
  )

  const fetchUsers = async (params?: { role?: string, isActive?: boolean }) => {
    isLoading.value = true
    error.value = null
    try {
      users.value = await userService.getUsers(params)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load users'
    } finally {
      isLoading.value = false
    }
  }

  const fetchPatients = async () => {
    isLoading.value = true
    error.value = null
    try {
      patients.value = await userService.getPatients()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load patients'
    } finally {
      isLoading.value = false
    }
  }

  const fetchDentists = async () => {
    isLoading.value = true
    error.value = null
    try {
      dentists.value = await userService.getDentists()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load dentists'
    } finally {
      isLoading.value = false
    }
  }

  const fetchAllForAppointment = async () => {
    await Promise.all([
      fetchPatients(),
      fetchDentists()
    ])
  }

  return {
    users,
    patients,
    dentists,
    isLoading,
    error,
    activePatients,
    activeDentists,
    fetchUsers,
    fetchPatients,
    fetchDentists,
    fetchAllForAppointment,
  }
})