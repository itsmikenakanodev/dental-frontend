<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor completa todos los campos'
    return
  }

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    })
    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = 'Credenciales inválidas. Intenta de nuevo.'
  }
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left Panel - Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-container relative overflow-hidden">
      <!-- Decorative circles -->
      <div class="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-40 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      
      <div class="relative z-10 flex flex-col justify-center px-12 xl:px-20">
        <h1 class="text-5xl xl:text-6xl font-heading font-bold text-white mb-6">
          Clinical<br />Atelier
        </h1>
        <p class="text-xl text-white/80 font-body max-w-md">
          Gestión dental de siguiente generación. Eficiente, elegante y diseñada para tu práctica.
        </p>
        
        <div class="mt-12 flex items-center gap-4">
          <div class="w-12 h-12 bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div class="w-12 h-12 bg-white/10 rounded-lg backdrop-blur-sm flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="w-12 h-12 bg-white/10 rounded-lg backdrop-blur-sm flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-surface">
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="lg:hidden mb-10 text-center">
          <h1 class="text-3xl font-heading font-bold text-primary">Clinical Atelier</h1>
        </div>

        <div class="mb-8">
          <h2 class="text-3xl font-heading font-bold text-on-surface mb-2">Bienvenido de nuevo</h2>
          <p class="text-on-surface-variant">Ingresa tus credenciales para acceder al sistema</p>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="mb-6 p-4 bg-error-container border border-error/20 rounded-lg">
          <p class="text-sm text-error font-medium">{{ errorMessage }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-medium text-on-surface mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="input"
              placeholder="dentista@clinica.com"
            />
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-on-surface mb-2">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="input pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember & Forgot -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="w-4 h-4 rounded border-outline text-primary focus:ring-primary" />
              <span class="text-sm text-on-surface-variant">Recordarme</span>
            </label>
            <a href="#" class="text-sm text-primary hover:text-primary/80 font-medium">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="btn btn-primary w-full py-3 text-base"
          >
            <svg v-if="authStore.isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ authStore.isLoading ? 'Ingresando...' : 'Iniciar sesión' }}
          </button>
        </form>

        <!-- Footer -->
        <p class="mt-8 text-center text-sm text-on-surface-variant">
          ¿Primera vez? 
          <a href="#" class="text-primary hover:text-primary/80 font-medium">
            Registra tu clínica
          </a>
        </p>
      </div>
    </div>
  </div>
</template>
