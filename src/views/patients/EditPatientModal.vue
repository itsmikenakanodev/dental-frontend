<script setup lang="ts">
import { ref, watch } from 'vue'
import type { User } from '@/types'

const props = defineProps<{
  patient: User
}>()

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
})

const isSubmitting = ref(false)
const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

// Load patient data when component mounts
watch(() => props.patient, (patient) => {
  if (patient) {
    form.value = {
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      dateOfBirth: patient.birthDate || '',
      gender: patient.gender || '',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
    }
  }
}, { immediate: true })

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
    birthDate: form.value.dateOfBirth || undefined,
    address: form.value.address?.trim() || undefined,
    gender: form.value.gender || undefined,
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
    <!-- 01 Personal Information -->
    <div>
      <h3 class="text-sm font-medium text-on-surface-variant mb-4">01 Personal Information</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-on-surface mb-2">Full Name</label>
          <div class="grid grid-cols-2 gap-4">
            <input
              v-model="form.firstName"
              type="text"
              class="input"
              placeholder="First name"
              required
            />
            <input
              v-model="form.lastName"
              type="text"
              class="input"
              placeholder="Last name"
              required
            />
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-on-surface mb-2">Date of Birth</label>
            <input
              v-model="form.dateOfBirth"
              type="date"
              class="input"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-on-surface mb-2">Gender Identity</label>
            <select v-model="form.gender" class="input">
              <option value="" disabled>Select gender</option>
              <option v-for="option in genderOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 02 Contact Details -->
    <div>
      <h3 class="text-sm font-medium text-on-surface-variant mb-4">02 Contact Details</h3>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-on-surface mb-2">Phone Number</label>
            <input
              v-model="form.phone"
              type="tel"
              class="input"
              placeholder="+54 9 11 1234 5678"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-on-surface mb-2">Email Address</label>
            <input
              v-model="form.email"
              type="email"
              class="input"
              placeholder="email@example.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-on-surface mb-2">Residential Address</label>
          <input
            v-model="form.address"
            type="text"
            class="input"
            placeholder="Street address, city, province"
          />
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="pt-4 flex justify-end gap-3 border-t border-outline-variant/20">
      <button type="button" @click="emit('cancel')" class="btn btn-ghost">
        Cancel
      </button>
      <button type="submit" :disabled="isSubmitting || !form.firstName || !form.lastName || !form.email" class="btn btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>
  </form>
</template>