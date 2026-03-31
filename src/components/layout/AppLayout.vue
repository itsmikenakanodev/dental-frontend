<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isSidebarOpen = ref(true)
const isProfileMenuOpen = ref(false)

const navigation = [
  { name: 'Dashboard', icon: 'home', path: '/dashboard' },
  { name: 'Turnos', icon: 'calendar', path: '/appointments' },
  { name: 'Pacientes', icon: 'users', path: '/patients' },
  { name: 'Equipo', icon: 'user-group', path: '/users' },
  { name: 'Configuración', icon: 'cog', path: '/settings' },
]

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const icons: Record<string, string> = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  'user-group': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-container transition-all duration-300',
        isSidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center h-16 px-6 border-b border-outline-variant/20">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-lg flex items-center justify-center">
            <span class="text-white font-heading font-bold text-xl">C</span>
          </div>
          <span v-if="isSidebarOpen" class="font-heading font-bold text-lg text-on-surface">
            Clinical<br />Atelier
          </span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-6 space-y-1">
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 group"
          active-class="bg-primary-container text-primary font-medium"
        >
          <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons[item.icon]" />
          </svg>
          <span v-if="isSidebarOpen">{{ item.name }}</span>
        </RouterLink>
      </nav>

      <!-- User Section -->
      <div class="p-4 border-t border-outline-variant/20">
        <button
          @click="handleLogout"
          class="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-all duration-200"
        >
          <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.logout" />
          </svg>
          <span v-if="isSidebarOpen">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div :class="['transition-all duration-300', isSidebarOpen ? 'ml-64' : 'ml-20']">
      <!-- Header -->
      <header class="sticky top-0 z-40 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
        <div class="flex items-center justify-between h-full px-6">
          <!-- Toggle Sidebar -->
          <button
            @click="isSidebarOpen = !isSidebarOpen"
            class="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Right Section -->
          <div class="flex items-center gap-4">
            <!-- Search -->
            <div class="hidden md:flex items-center">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  class="w-64 pl-10 pr-4 py-2 bg-surface-container-highest rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <!-- Profile -->
            <div class="relative">
              <button
                @click="isProfileMenuOpen = !isProfileMenuOpen"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <div class="w-9 h-9 bg-primary-container rounded-full flex items-center justify-center">
                  <span class="text-primary font-medium text-sm">
                    {{ authStore.user?.firstName?.charAt(0) }}{{ authStore.user?.lastName?.charAt(0) }}
                  </span>
                </div>
                <div class="hidden md:block text-left">
                  <p class="text-sm font-medium text-on-surface">{{ authStore.getFullName() }}</p>
                  <p class="text-xs text-on-surface-variant">{{ authStore.user?.role }}</p>
                </div>
                <svg class="hidden md:block w-4 h-4 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Profile Dropdown -->
              <div
                v-if="isProfileMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-lg shadow-elevated py-1 z-50"
              >
                <a href="#" class="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">
                  Mi perfil
                </a>
                <a href="#" class="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">
                  Configuración
                </a>
                <hr class="my-1 border-outline-variant/20" />
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6 xl:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
