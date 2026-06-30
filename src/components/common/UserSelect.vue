<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'

const props = withDefaults(defineProps<{
  modelValue: string
  role: 'PATIENT' | 'DENTIST' | 'ASSISTANT' | 'ADMIN'
  placeholder?: string
  required?: boolean
  disabled?: boolean
}>(), {
  placeholder: 'Seleccionar...',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const userStore = useUserStore()
const isLoading = ref(false)

const users = computed(() => {
  if (props.role === 'PATIENT') return userStore.activePatients
  if (props.role === 'DENTIST') return userStore.activeDentists
  return userStore.users.filter(u => u.role === props.role)
})

const loadUsers = async () => {
  isLoading.value = true
  try {
    if (props.role === 'PATIENT') {
      await userStore.fetchPatients()
    } else if (props.role === 'DENTIST') {
      await userStore.fetchDentists()
    } else {
      await userStore.fetchUsers({ role: props.role })
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadUsers()
})

watch(() => props.role, () => {
  loadUsers()
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    PATIENT: 'Paciente',
    DENTIST: 'Dentista',
    ADMIN: 'Administrador',
    ASSISTANT: 'Asistente',
  }
  return labels[role] || role
}
</script>

<template>
  <select
    :value="modelValue"
    @change="handleChange"
    :disabled="disabled || isLoading"
    class="input"
    :class="{ 'border-error': required && !modelValue }"
  >
    <option value="" disabled>{{ isLoading ? 'Cargando...' : placeholder }}</option>
    <option 
      v-for="user in users" 
      :key="user.userId" 
      :value="user.userId"
    >
      {{ user.firstName }} {{ user.lastName }}
    </option>
  </select>
</template>