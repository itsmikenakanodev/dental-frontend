<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { User } from '@/types'
import { appointmentService } from '@/services/api'
import type { Appointment } from '@/types'

const props = defineProps<{
  patient: User
}>()

const emit = defineEmits(['close', 'edit'])

const appointments = ref<Appointment[]>([])
const isLoadingAppointments = ref(false)

onMounted(async () => {
  isLoadingAppointments.value = true
  try {
    appointments.value = await appointmentService.getAppointmentsByPatient(props.patient.userId)
  } catch (e) {
    console.error('Error loading appointments:', e)
  } finally {
    isLoadingAppointments.value = false
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'No Show',
  }
  return labels[status] || status
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    SCHEDULED: 'bg-primary-container text-primary',
    COMPLETED: 'bg-secondary-container text-secondary',
    CANCELLED: 'bg-error-container text-error',
    NO_SHOW: 'bg-surface-container-high text-on-surface-variant',
  }
  return classes[status] || 'bg-surface-container-high text-on-surface-variant'
}
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Patient Info Card -->
    <div class="flex items-start gap-6">
      <!-- Avatar -->
      <div class="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center flex-shrink-0">
        <span class="text-primary font-heading font-bold text-3xl">
          {{ patient.firstName.charAt(0) }}{{ patient.lastName.charAt(0) }}
        </span>
      </div>
      
      <!-- Info -->
      <div class="flex-1">
        <h3 class="text-xl font-heading font-semibold text-on-surface">
          {{ patient.firstName }} {{ patient.lastName }}
        </h3>
        <p class="text-on-surface-variant">{{ patient.email }}</p>
        <p v-if="patient.phone" class="text-on-surface-variant">{{ patient.phone }}</p>
        
        <div class="mt-3 flex items-center gap-3">
          <span :class="[
            patient.isActive 
              ? 'bg-primary-container text-primary' 
              : 'bg-surface-container-high text-on-surface-variant',
            'px-3 py-1 rounded-full text-sm font-medium'
          ]">
            {{ patient.isActive ? 'Active' : 'Inactive' }}
          </span>
          <span class="text-sm text-on-surface-variant">
            Patient since {{ formatDate(patient.createdAt) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-3 gap-4">
      <button @click="emit('edit')" class="btn btn-secondary w-full justify-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit Info
      </button>
      <button class="btn btn-ghost w-full justify-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        New Appointment
      </button>
      <button class="btn btn-ghost w-full justify-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        View Records
      </button>
    </div>

    <!-- Appointments History -->
    <div>
      <h4 class="text-lg font-heading font-medium text-on-surface mb-4">Appointment History</h4>
      
      <div v-if="isLoadingAppointments" class="py-8 text-center">
        <div class="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-2 text-sm text-on-surface-variant">Loading...</p>
      </div>
      
      <div v-else-if="appointments.length === 0" class="py-8 text-center bg-surface-container-low rounded-lg">
        <p class="text-on-surface-variant">No appointments yet</p>
      </div>
      
      <div v-else class="space-y-2 max-h-64 overflow-y-auto">
        <div
          v-for="apt in appointments"
          :key="apt.appointmentId"
          class="flex items-center justify-between p-3 bg-surface-container-low rounded-lg"
        >
          <div>
            <p class="font-medium text-on-surface">{{ formatDate(apt.appointmentTime) }}</p>
            <p class="text-sm text-on-surface-variant">
              {{ formatTime(apt.appointmentTime) }} · {{ apt.durationMinutes }}min
            </p>
          </div>
          <span :class="[getStatusClass(apt.status), 'px-3 py-1 rounded-full text-xs font-medium']">
            {{ getStatusLabel(apt.status) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Close Button -->
    <div class="pt-4 border-t border-outline-variant/20">
      <button @click="emit('close')" class="btn btn-ghost w-full">
        Close
      </button>
    </div>
  </div>
</template>