<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { userService } from '@/services/api'
import type { User } from '@/types'
import AddPatientModal from './AddPatientModal.vue'
import EditPatientModal from './EditPatientModal.vue'
import PatientProfileModal from './PatientProfileModal.vue'

const patients = ref<User[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

const showProfileModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedPatient = ref<User | null>(null)

const filteredPatients = computed(() => {
  let result = [...patients.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.firstName?.toLowerCase().includes(query) ||
      p.lastName?.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query)
    )
  }
  
  return result.sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
  )
})

const stats = computed(() => ({
  total: patients.value.length,
  active: patients.value.filter(p => p.isActive).length,
  inactive: patients.value.filter(p => !p.isActive).length,
}))

onMounted(async () => {
  isLoading.value = true
  try {
    patients.value = await userService.getPatients()
  } catch (e) {
    console.error('Error loading patients:', e)
  } finally {
    isLoading.value = false
  }
})

const openProfile = (patient: User) => {
  selectedPatient.value = patient
  showProfileModal.value = true
}

const closeModal = () => {
  showProfileModal.value = false
  showAddModal.value = false
  showEditModal.value = false
  selectedPatient.value = null
}

const handleCreate = async (data: { firstName: string, lastName: string, email: string, phone?: string, birthDate?: string, address?: string, gender?: string }) => {
  try {
    await userService.createUser({
      ...data,
      role: 'PATIENT',
      password: 'Temp1234!' // Temporal password
    })
    patients.value = await userService.getPatients()
    showAddModal.value = false
  } catch (e) {
    console.error('Error creating patient:', e)
  }
}

const handleEdit = async (data: { firstName: string, lastName: string, email: string, phone?: string, birthDate?: string, address?: string, gender?: string }) => {
  if (!selectedPatient.value) return
  try {
    await userService.updateUser(selectedPatient.value.userId, {
      firstName: data.firstName,
      lastName: data.lastName,
      role: selectedPatient.value.role,
    })
    patients.value = await userService.getPatients()
    showEditModal.value = false
    // Update selected patient for profile modal
    const updated = patients.value.find(p => p.userId === selectedPatient.value?.userId)
    if (updated) selectedPatient.value = updated
  } catch (e) {
    console.error('Error updating patient:', e)
  }
}

const openEditModal = () => {
  showEditModal.value = true
}

const toggleActive = async (patient: User) => {
  try {
    await userService.updateUser(patient.userId, {
      firstName: patient.firstName,
      lastName: patient.lastName,
      role: patient.role,
    })
    // Refresh the list
    patients.value = await userService.getPatients()
  } catch (e) {
    console.error('Error updating patient:', e)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-heading font-bold text-on-surface">Pacientes</h1>
        <p class="text-on-surface-variant mt-1">Gestión de patients registrados</p>
      </div>
      <button @click="showAddModal = true" class="btn btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Nuevo paciente
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div class="card">
        <p class="text-sm text-on-surface-variant">Total</p>
        <p class="text-2xl font-heading font-bold text-on-surface">{{ stats.total }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-on-surface-variant">Activos</p>
        <p class="text-2xl font-heading font-bold text-primary">{{ stats.active }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-on-surface-variant">Inactivos</p>
        <p class="text-2xl font-heading font-bold text-on-surface-variant">{{ stats.inactive }}</p>
      </div>
    </div>

    <!-- Search -->
    <div class="card">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre, apellido o email..."
          class="input pl-10"
        />
      </div>
    </div>

    <!-- Patients Table -->
    <div class="card p-0 overflow-hidden">
      <!-- Loading State -->
      <div v-if="isLoading" class="py-16 text-center">
        <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-4 text-on-surface-variant">Cargando pacientes...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredPatients.length === 0" class="py-16 text-center">
        <div class="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p class="text-on-surface font-medium">No se encontraron pacientes</p>
        <p class="text-sm text-on-surface-variant mt-1">Intenta cambiar los filtros o agrega un nuevo paciente</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-outline-variant/20">
              <th class="text-left px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Paciente</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Email</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Teléfono</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Estado</th>
              <th class="text-right px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="patient in filteredPatients"
              :key="patient.userId"
              @click="openProfile(patient)"
              class="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <td class="px-6 py-4">
                <p class="font-medium text-on-surface">
                  {{ patient.firstName }} {{ patient.lastName }}
                </p>
                <p class="text-sm text-on-surface-variant">
                  ID: {{ patient.userId.slice(0, 8) }}...
                </p>
              </td>
              <td class="px-6 py-4">
                <p class="text-on-surface">{{ patient.email }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="text-on-surface">{{ patient.phone || '—' }}</p>
              </td>
              <td class="px-6 py-4">
                <span :class="[
                  patient.isActive 
                    ? 'bg-primary-container text-primary' 
                    : 'bg-surface-container-high text-on-surface-variant',
                  'px-3 py-1 rounded-full text-xs font-medium'
                ]">
                  {{ patient.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2" @click.stop>
                  <!-- Toggle Active/Inactive -->
                  <button
                    @click="toggleActive(patient)"
                    class="p-2 rounded-lg hover:bg-surface-container-high transition-colors"
                    :title="patient.isActive ? 'Desactivar' : 'Activar'"
                  >
                    <svg v-if="patient.isActive" class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <svg v-else class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Patient Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 backdrop-blur-sm" @click.self="closeModal">
      <div class="bg-surface-container-lowest rounded-xl shadow-floating w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-outline-variant/20">
          <h2 class="text-xl font-heading font-semibold text-on-surface">Nuevo paciente</h2>
        </div>
        <AddPatientModal @submit="handleCreate" @cancel="closeModal" />
      </div>
    </div>

    <!-- Patient Profile Modal -->
    <div v-if="showProfileModal && selectedPatient" class="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 backdrop-blur-sm" @click.self="closeModal">
      <div class="bg-surface-container-lowest rounded-xl shadow-floating w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-outline-variant/20 flex items-center justify-between">
          <h2 class="text-xl font-heading font-semibold text-on-surface">Perfil del paciente</h2>
          <button @click="closeModal" class="p-2 rounded-lg hover:bg-surface-container-high">
            <svg class="w-5 h-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <PatientProfileModal :patient="selectedPatient" @close="closeModal" @edit="openEditModal" />
      </div>
    </div>

    <!-- Edit Patient Modal -->
    <div v-if="showEditModal && selectedPatient" class="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 backdrop-blur-sm" @click.self="closeModal">
      <div class="bg-surface-container-lowest rounded-xl shadow-floating w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-outline-variant/20">
          <h2 class="text-xl font-heading font-semibold text-on-surface">Editar paciente</h2>
        </div>
        <EditPatientModal :patient="selectedPatient" @submit="handleEdit" @cancel="closeModal" />
      </div>
    </div>
  </div>
</template>