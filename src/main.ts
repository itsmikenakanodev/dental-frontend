import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize auth store BEFORE mount so localStorage is populated
// for the router guard (especially in demo mode)
import { useAuthStore } from '@/stores/auth'
useAuthStore()

app.mount('#app')
