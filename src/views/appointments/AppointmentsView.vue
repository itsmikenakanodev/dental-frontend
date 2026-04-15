<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'
import type { Appointment, CreateAppointmentRequest } from '@/types'
import UserSelect from '@/components/common/UserSelect.vue'

const store = useAppointmentStore()
const userStore = useUserStore()
const toast = useToast()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showCancelConfirm = ref(false)
const selectedAppointment = ref<Appointment | null>(null)

const filterStatus = ref('ALL')
const searchQuery = ref('')

// Date filter mode and values
const dateFilterMode = ref<'ALL' | 'DAY' | 'RANGE'>('ALL')
const filterDay = ref('')
const filterRangeStart = ref('')
const filterRangeEnd = ref('')

const newAppointment = ref<CreateAppointmentRequest>({
  patientId: '',
  dentistId: '',
  appointmentTime: '',
  durationMinutes: 30,
  notes: '',
})

const editData = ref({
  newTime: '',
  newNotes: '',
})

const filteredAppointments = computed(() => {
  let result = [...store.appointments]

  if (filterStatus.value !== 'ALL') {
    result = result.filter(a => a.status === filterStatus.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(a =>
      a.patient?.firstName?.toLowerCase().includes(query) ||
      a.patient?.lastName?.toLowerCase().includes(query) ||
      a.dentist?.firstName?.toLowerCase().includes(query) ||
      a.dentist?.lastName?.toLowerCase().includes(query) ||
      a.notes?.toLowerCase().includes(query)
    )
  }

  return result.sort((a, b) =>
    new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime()
  )
})

// Helper to parse YYYY-MM-DD as local date (avoid UTC conversion)
const parseLocalDate = (dateStr: string): Date => {
  const parts = dateStr.split('-')
  const y = parseInt(parts[0] || '0', 10)
  const m = parseInt(parts[1] || '1', 10) - 1
  const d = parseInt(parts[2] || '1', 10)
  return new Date(y, m, d)
}

// Helper to format date as local datetime (YYYY-MM-DDTHH:mm:ss)
const toLocalDateTime = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}:${s}`
}

// Watch date filter changes and fetch from API
watch([dateFilterMode, filterDay, filterRangeStart, filterRangeEnd], () => {
  console.log('[DateFilter] Mode changed:', dateFilterMode.value)

  if (dateFilterMode.value === 'ALL') {
    console.log('[DateFilter] Fetching current month')
    store.fetchAppointments()
  } else if (dateFilterMode.value === 'DAY' && filterDay.value) {
    const start = parseLocalDate(filterDay.value)
    start.setHours(0, 0, 0, 0)
    const end = parseLocalDate(filterDay.value)
    end.setHours(23, 59, 59, 0)
    console.log('[DateFilter] Day mode — start:', toLocalDateTime(start), 'end:', toLocalDateTime(end))
    store.fetchAppointments(toLocalDateTime(start), toLocalDateTime(end))
  } else if (dateFilterMode.value === 'RANGE' && filterRangeStart.value && filterRangeEnd.value) {
    const start = parseLocalDate(filterRangeStart.value)
    start.setHours(0, 0, 0, 0)
    const end = parseLocalDate(filterRangeEnd.value)
    end.setHours(23, 59, 59, 0)
    console.log('[DateFilter] Range mode — start:', toLocalDateTime(start), 'end:', toLocalDateTime(end))
    store.fetchAppointments(toLocalDateTime(start), toLocalDateTime(end))
  }
})

const stats = computed(() => ({
  total: store.appointments.length,
  scheduled: store.appointments.filter(a => a.status === 'SCHEDULED').length,
  completed: store.appointments.filter(a => a.status === 'COMPLETED').length,
  cancelled: store.appointments.filter(a => a.status === 'CANCELLED').length,
}))

onMounted(() => {
  store.fetchAppointments()
  userStore.fetchAllForAppointment()
})

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string, class: string }> = {
    SCHEDULED: { label: 'Programado', class: 'bg-primary-container text-primary' },
    COMPLETED: { label: 'Completado', class: 'bg-secondary-container text-secondary' },
    CANCELLED: { label: 'Cancelado', class: 'bg-error-container text-error' },
    NO_SHOW: { label: 'No asistido', class: 'bg-surface-container-high text-on-surface-variant' },
  }
  return configs[status] || configs.SCHEDULED
}

const openCreateModal = () => {
  newAppointment.value = {
    patientId: '',
    dentistId: '',
    appointmentTime: '',
    durationMinutes: 30,
    notes: '',
  }
  showCreateModal.value = true
}

const openEditModal = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  editData.value = {
    newTime: appointment.appointmentTime,
    newNotes: appointment.notes || '',
  }
  showEditModal.value = true
}

const openCancelConfirm = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  showCancelConfirm.value = true
}

const handleCreate = async () => {
  if (!newAppointment.value.patientId || !newAppointment.value.dentistId || !newAppointment.value.appointmentTime) {
    toast.error('Por favor completa todos los campos')
    return
  }
  try {
    await store.createAppointment(newAppointment.value)
    toast.success('Turno creado correctamente')
    showCreateModal.value = false
  } catch (e) {
    toast.error('Error al crear el turno')
  }
}

const handleEdit = async () => {
  if (!selectedAppointment.value) return
  try {
    await store.updateAppointment(selectedAppointment.value.appointmentId, editData.value)
    toast.success('Turno actualizado correctamente')
    showEditModal.value = false
  } catch (e) {
    toast.error('Error al actualizar el turno')
  }
}

const handleCancel = async () => {
  if (!selectedAppointment.value) return
  try {
    await store.cancelAppointment(selectedAppointment.value.appointmentId)
    toast.success('Turno cancelado correctamente')
    showCancelConfirm.value = false
  } catch (e) {
    toast.error('Error al cancelar el turno')
  }
}

const handleComplete = async (appointment: Appointment) => {
  try {
    await store.completeAppointment(appointment.appointmentId)
    toast.success('Turno completado correctamente')
  } catch (e) {
    toast.error('Error al completar el turno')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  showCancelConfirm.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-heading font-bold text-on-surface">Turnos</h1>
        <p class="text-on-surface-variant mt-1">Gestión de citas y agenda</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Nuevo turno
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card">
        <p class="text-sm text-on-surface-variant">Total</p>
        <p class="text-2xl font-heading font-bold text-on-surface">{{ stats.total }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-on-surface-variant">Programados</p>
        <p class="text-2xl font-heading font-bold text-primary">{{ stats.scheduled }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-on-surface-variant">Completados</p>
        <p class="text-2xl font-heading font-bold text-secondary">{{ stats.completed }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-on-surface-variant">Cancelados</p>
        <p class="text-2xl font-heading font-bold text-error">{{ stats.cancelled }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="card">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por paciente, dentista o notas..."
              class="input pl-10"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <select v-model="filterStatus" class="input md:w-48">
          <option value="ALL">Todos</option>
          <option value="SCHEDULED">Programados</option>
          <option value="COMPLETED">Completados</option>
          <option value="CANCELLED">Cancelados</option>
          <option value="NO_SHOW">No asistidos</option>
        </select>

        <!-- Date Filter Mode -->
        <select v-model="dateFilterMode" class="input md:w-40">
          <option value="ALL">Este mes</option>
          <option value="DAY">Por día</option>
          <option value="RANGE">Por rango</option>
        </select>

        <!-- Day Picker -->
        <input
          v-if="dateFilterMode === 'DAY'"
          v-model="filterDay"
          type="date"
          class="input md:w-48"
        />

        <!-- Range Picker -->
        <template v-if="dateFilterMode === 'RANGE'">
          <input
            v-model="filterRangeStart"
            type="date"
            class="input md:w-48"
            placeholder="Desde"
          />
          <input
            v-model="filterRangeEnd"
            type="date"
            class="input md:w-48"
            placeholder="Hasta"
          />
        </template>
      </div>
    </div>

    <!-- Appointments Table -->
    <div class="card p-0 overflow-hidden">
      <!-- Loading State -->
      <div v-if="store.isLoading" class="py-16 text-center">
        <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-4 text-on-surface-variant">Cargando turnos...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredAppointments.length === 0" class="py-16 text-center">
        <div class="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-on-surface font-medium">No se encontraron turnos</p>
        <p class="text-sm text-on-surface-variant mt-1">Intenta cambiar los filtros o crea un nuevo turno</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-outline-variant/20">
              <th class="text-left px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Fecha y Hora</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Paciente</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Dentista</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Notas</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Estado</th>
              <th class="text-right px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="appointment in filteredAppointments"
              :key="appointment.appointmentId"
              class="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors"
            >
              <td class="px-6 py-4">
                <p class="font-medium text-on-surface">{{ formatDate(appointment.appointmentTime) }}</p>
                <p class="text-sm text-on-surface-variant">{{ formatTime(appointment.appointmentTime) }} · {{ appointment.durationMinutes }}min</p>
              </td>
              <td class="px-6 py-4">
                <p class="font-medium text-on-surface">
                  {{ appointment.patientName || 'Sin paciente' }}
                </p>
              </td>
              <td class="px-6 py-4">
                <p class="text-on-surface">
                  {{ appointment.dentistName || 'Sin dentista' }}
                </p>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-on-surface-variant max-w-48 truncate">
                  {{ appointment.notes || '—' }}
                </p>
              </td>
              <td class="px-6 py-4">
                <span :class="[getStatusConfig(appointment.status)?.class, 'px-3 py-1 rounded-full text-xs font-medium']">
                  {{ getStatusConfig(appointment.status)?.label }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <!-- Complete -->
                  <button
                    v-if="appointment.status === 'SCHEDULED'"
                    @click="handleComplete(appointment)"
                    class="p-2 rounded-lg text-secondary hover:bg-secondary-container transition-colors"
                    title="Completar turno"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>

                  <!-- Edit -->
                  <button
                    v-if="appointment.status === 'SCHEDULED'"
                    @click="openEditModal(appointment)"
                    class="p-2 rounded-lg text-primary hover:bg-primary-container transition-colors"
                    title="Editar turno"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <!-- Cancel -->
                  <button
                    v-if="appointment.status === 'SCHEDULED'"
                    @click="openCancelConfirm(appointment)"
                    class="p-2 rounded-lg text-error hover:bg-error-container transition-colors"
                    title="Cancelar turno"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 backdrop-blur-sm" @click.self="closeModal">
      <div class="bg-surface-container-lowest rounded-xl shadow-floating w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-outline-variant/20">
          <h2 class="text-xl font-heading font-semibold text-on-surface">Nuevo turno</h2>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-on-surface mb-2">Paciente</label>
            <UserSelect 
              v-model="newAppointment.patientId" 
              role="PATIENT" 
              placeholder="Seleccionar paciente"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-on-surface mb-2">Dentista</label>
            <UserSelect 
              v-model="newAppointment.dentistId" 
              role="DENTIST" 
              placeholder="Seleccionar dentista"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-on-surface mb-2">Fecha y hora</label>
            <input v-model="newAppointment.appointmentTime" type="datetime-local" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-on-surface mb-2">Duración (minutos)</label>
            <input v-model.number="newAppointment.durationMinutes" type="number" class="input" min="15" step="15" />
          </div>
          <div>
            <label class="block text-sm font-medium text-on-surface mb-2">Notas</label>
            <textarea v-model="newAppointment.notes" class="input" rows="3" placeholder="Motivo de la consulta..."></textarea>
          </div>
        </div>
        <div class="p-6 border-t border-outline-variant/20 flex justify-end gap-3">
          <button @click="closeModal" class="btn btn-ghost">Cancelar</button>
          <button @click="handleCreate" :disabled="store.isLoading" class="btn btn-primary">
            {{ store.isLoading ? 'Creando...' : 'Crear turno' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 backdrop-blur-sm" @click.self="closeModal">
      <div class="bg-surface-container-lowest rounded-xl shadow-floating w-full max-w-lg mx-4">
        <div class="p-6 border-b border-outline-variant/20">
          <h2 class="text-xl font-heading font-semibold text-on-surface">Editar turno</h2>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-on-surface mb-2">Nueva fecha y hora</label>
            <input v-model="editData.newTime" type="datetime-local" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-on-surface mb-2">Notas</label>
            <textarea v-model="editData.newNotes" class="input" rows="3" placeholder="Notas del turno..."></textarea>
          </div>
        </div>
        <div class="p-6 border-t border-outline-variant/20 flex justify-end gap-3">
          <button @click="closeModal" class="btn btn-ghost">Cancelar</button>
          <button @click="handleEdit" :disabled="store.isLoading" class="btn btn-primary">
            {{ store.isLoading ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 backdrop-blur-sm" @click.self="closeModal">
      <div class="bg-surface-container-lowest rounded-xl shadow-floating w-full max-w-md mx-4">
        <div class="p-6">
          <div class="w-12 h-12 bg-error-container rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-heading font-semibold text-on-surface text-center mb-2">¿Cancelar turno?</h3>
          <p class="text-sm text-on-surface-variant text-center">
            Esta acción no se puede deshacer. El turno será marcado como cancelado.
          </p>
        </div>
        <div class="p-6 border-t border-outline-variant/20 flex justify-end gap-3">
          <button @click="closeModal" class="btn btn-ghost">Volver</button>
          <button @click="handleCancel" :disabled="store.isLoading" class="btn" style="background: var(--color-error); color: white;">
            {{ store.isLoading ? 'Cancelando...' : 'Sí, cancelar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>