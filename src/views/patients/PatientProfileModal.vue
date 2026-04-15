<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { User } from '@/types'
import { appointmentService } from '@/services/api'
import type { Appointment } from '@/types'

const props = defineProps<{
  patient: User
}>()

const emit = defineEmits(['close'])

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
    SCHEDULED: 'Programado',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'No asistido',
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
            {{ patient.isActive ? 'Activo' : 'Inactivo' }}
          </span>
          <span class="text-sm text-on-surface-variant">
            Registrado: {{ formatDate(patient.createdAt) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex gap-3">
      <button class="btn btn-secondary flex-1">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Nuevo turno
      </button>
      <button class="btn btn-ghost flex-1">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Ver historial
      </button>
    </div>

    <!-- Appointments History -->
    <div>
      <h4 class="text-lg font-heading font-medium text-on-surface mb-4">Historial de turnos</h4>
      
      <div v-if="isLoadingAppointments" class="py-8 text-center">
        <div class="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-2 text-sm text-on-surface-variant">Cargando turnos...</p>
      </div>
      
      <div v-else-if="appointments.length === 0" class="py-8 text-center bg-surface-container-low rounded-lg">
        <p class="text-on-surface-variant">No hay turnos registrados</p>
      </div>
      
      <div v-else class="space-y-2">
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
        Cerrar
      </button>
    </div>
  </div>
</template>