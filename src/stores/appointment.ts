import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Appointment, CreateAppointmentRequest } from '@/types'
import { appointmentService } from '@/services/api'

export const useAppointmentStore = defineStore('appointment', () => {
  const appointments = ref<Appointment[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const todayAppointments = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return appointments.value.filter(a => {
      const date = new Date(a.appointmentTime)
      return date >= today && date < tomorrow
    })
  })

  const upcomingAppointments = computed(() => {
    const now = new Date()
    return appointments.value
      .filter(a => new Date(a.appointmentTime) >= now && a.status === 'SCHEDULED')
      .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime())
  })

  const fetchAppointments = async (start?: string, end?: string) => {
    isLoading.value = true
    error.value = null
    try {
      if (start && end) {
        appointments.value = await appointmentService.getAppointmentsByDateRange(start, end)
      } else {
        const today = new Date()
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
        appointments.value = await appointmentService.getAppointmentsByDateRange(startOfMonth.toISOString(), endOfMonth.toISOString())
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load appointments'
      console.error('Error fetching appointments:', e)
    } finally {
      isLoading.value = false
    }
  }

  const fetchByDentist = async (dentistId: string) => {
    isLoading.value = true
    error.value = null
    try {
      appointments.value = await appointmentService.getAppointmentsByDentist(dentistId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load dentist appointments'
    } finally {
      isLoading.value = false
    }
  }

  const createAppointment = async (data: CreateAppointmentRequest) => {
    isLoading.value = true
    error.value = null
    try {
      const created = await appointmentService.createAppointment(data)
      appointments.value.push(created)
      return created
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create appointment'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const updateAppointment = async (id: string, data: Partial<{ newTime: string, newNotes: string }>) => {
    isLoading.value = true
    error.value = null
    try {
      const updated = await appointmentService.updateAppointment(id, data)
      const index = appointments.value.findIndex(a => a.appointmentId === id)
      if (index !== -1) {
        appointments.value[index] = updated
      }
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update appointment'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const cancelAppointment = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await appointmentService.cancelAppointment(id)
      const index = appointments.value.findIndex(a => a.appointmentId === id)
      if (index !== -1) {
        appointments.value[index]!.status = 'CANCELLED'
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to cancel appointment'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const completeAppointment = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await appointmentService.completeAppointment(id)
      const index = appointments.value.findIndex(a => a.appointmentId === id)
      if (index !== -1) {
        appointments.value[index]!.status = 'COMPLETED'
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to complete appointment'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    appointments,
    isLoading,
    error,
    todayAppointments,
    upcomingAppointments,
    fetchAppointments,
    fetchByDentist,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    completeAppointment,
  }
})