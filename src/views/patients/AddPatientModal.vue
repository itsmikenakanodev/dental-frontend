<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
})

const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!form.value.firstName || !form.value.lastName || !form.value.email) {
    return
  }
  
  isSubmitting.value = true
  emit('submit', {
    firstName: form.value.firstName.trim(),
    lastName: form.value.lastName.trim(),
    email: form.value.email.trim(),
    phone: form.value.phone?.trim() || undefined,
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-on-surface mb-2">Nombre *</label>
        <input
          v-model="form.firstName"
          type="text"
          class="input"
          placeholder="Juan"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-on-surface mb-2">Apellido *</label>
        <input
          v-model="form.lastName"
          type="text"
          class="input"
          placeholder="Pérez"
          required
        />
      </div>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-on-surface mb-2">Email *</label>
      <input
        v-model="form.email"
        type="email"
        class="input"
        placeholder="juan@email.com"
        required
      />
    </div>
    
    <div>
      <label class="block text-sm font-medium text-on-surface mb-2">Teléfono</label>
      <input
        v-model="form.phone"
        type="tel"
        class="input"
        placeholder="+54 9 11 1234 5678"
      />
    </div>
    
    <div class="pt-4 flex justify-end gap-3 border-t border-outline-variant/20">
      <button type="button" @click="emit('cancel')" class="btn btn-ghost">
        Cancelar
      </button>
      <button type="submit" :disabled="isSubmitting || !form.firstName || !form.lastName || !form.email" class="btn btn-primary">
        {{ isSubmitting ? 'Creando...' : 'Crear paciente' }}
      </button>
    </div>
  </form>
</template>