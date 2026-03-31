<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { appointmentService } from '@/services/api'
import type { Appointment } from '@/types'

const authStore = useAuthStore()

const stats = ref([
  { label: 'Turnos hoy', value: 8, icon: 'calendar', color: 'primary', trend: '+2' },
  { label: 'Pacientes', value: 156, icon: 'users', color: 'secondary', trend: '+12' },
  { label: 'Completados', value: 124, icon: 'check', color: 'tertiary', trend: '+8' },
  { label: 'Cancelados', value: 5, icon: 'x', color: 'error', trend: '-2' },
])

const upcomingAppointments = ref<Appointment[]>([])
const isLoading = ref(false)

const icons: Record<string, string> = {
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  x: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
}

const colorClasses: Record<string, { bg: string, text: string, icon: string }> = {
  primary: { bg: 'bg-primary-container', text: 'text-primary', icon: 'text-primary/60' },
  secondary: { bg: 'bg-secondary-container', text: 'text-secondary', icon: 'text-secondary/60' },
  tertiary: { bg: 'bg-tertiary-fixed', text: 'text-tertiary', icon: 'text-tertiary/60' },
  error: { bg: 'bg-error-container', text: 'text-error', icon: 'text-error/60' },
}

onMounted(async () => {
  isLoading.value = true
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString()
    
    upcomingAppointments.value = await appointmentService.getAppointmentsByDateRange(startOfDay, endOfDay)
  } catch (error) {
    console.error('Failed to load appointments:', error)
  } finally {
    isLoading.value = false
  }
})

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', { weekday: 'short', month: 'short', day: 'numeric' })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    SCHEDULED: 'bg-primary-container text-primary',
    COMPLETED: 'bg-secondary-container text-secondary',
    CANCELLED: 'bg-error-container text-error',
    NO_SHOW: 'bg-surface-container-high text-on-surface-variant',
  }
  return colors[status] || colors.SCHEDULED
}
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-heading font-bold text-on-surface">
          Buenos días, {{ authStore.user?.firstName }}
        </h1>
        <p class="text-on-surface-variant mt-1">
          Aquí está lo que sucede en tu clínica hoy
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button class="btn btn-secondary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo turno
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="card-elevated hover:shadow-elevated transition-shadow duration-300"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-on-surface-variant">{{ stat.label }}</p>
            <p class="text-3xl font-heading font-bold text-on-surface mt-1">{{ stat.value }}</p>
          </div>
          <div :class="[colorClasses[stat.color]?.bg, 'w-12 h-12 rounded-lg flex items-center justify-center']">
            <svg :class="[colorClasses[stat.color]?.icon, 'w-6 h-6']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons[stat.icon]" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-1">
          <span :class="[stat.trend.startsWith('+') ? 'text-secondary' : 'text-error', 'text-sm font-medium']">
            {{ stat.trend }}
          </span>
          <span class="text-sm text-on-surface-variant">vs semana pasada</span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Today's Schedule -->
      <div class="lg:col-span-2 card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-heading font-semibold text-on-surface">Turnos de hoy</h2>
          <a href="/appointments" class="text-sm text-primary hover:text-primary/80 font-medium">
            Ver todos
          </a>
        </div>

        <div v-if="isLoading" class="py-12 text-center">
          <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p class="mt-4 text-on-surface-variant">Cargando turnos...</p>
        </div>

        <div v-else-if="upcomingAppointments.length === 0" class="py-12 text-center">
          <div class="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-on-surface-variant">No hay turnos programados para hoy</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="appointment in upcomingAppointments"
            :key="appointment.appointmentId"
            class="flex items-center gap-4 p-4 bg-surface-container-low rounded-lg hover:bg-surface-container hover:shadow-soft transition-all duration-200 cursor-pointer"
          >
            <!-- Time -->
            <div class="w-16 text-center flex-shrink-0">
              <p class="text-lg font-heading font-semibold text-on-surface">
                {{ formatTime(appointment.appointmentTime) }}
              </p>
              <p class="text-xs text-on-surface-variant">
                {{ appointment.durationMinutes }}min
              </p>
            </div>

            <!-- Divider -->
            <div class="w-px h-12 bg-outline-variant/30"></div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="font-medium text-on-surface truncate">
                {{ appointment.patient?.firstName }} {{ appointment.patient?.lastName }}
              </p>
              <p class="text-sm text-on-surface-variant truncate">
                {{ appointment.notes || 'Sin notas' }}
              </p>
            </div>

            <!-- Status -->
            <div :class="[getStatusColor(appointment.status), 'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap']">
              {{ appointment.status === 'SCHEDULED' ? 'Programado' : appointment.status === 'COMPLETED' ? 'Completado' : appointment.status === 'CANCELLED' ? 'Cancelado' : 'No asistido' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <h2 class="text-xl font-heading font-semibold text-on-surface mb-6">Acciones rápidas</h2>
        
        <div class="space-y-3">
          <button class="w-full flex items-center gap-4 p-4 bg-surface-container-low hover:bg-surface-container-high rounded-lg transition-colors text-left group">
            <div class="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-on-surface">Crear turno</p>
              <p class="text-sm text-on-surface-variant">Agenda una nueva cita</p>
            </div>
          </button>

          <button class="w-full flex items-center gap-4 p-4 bg-surface-container-low hover:bg-surface-container-high rounded-lg transition-colors text-left group">
            <div class="w-10 h-10 bg-secondary-container rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-on-surface">Nuevo paciente</p>
              <p class="text-sm text-on-surface-variant">Registra un paciente</p>
            </div>
          </button>

          <button class="w-full flex items-center gap-4 p-4 bg-surface-container-low hover:bg-surface-container-high rounded-lg transition-colors text-left group">
            <div class="w-10 h-10 bg-tertiary-fixed rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-on-surface">Historial clínico</p>
              <p class="text-sm text-on-surface-variant">Consulta historiales</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
