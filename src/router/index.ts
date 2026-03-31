import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },
        {
          path: 'appointments',
          name: 'appointments',
          component: () => import('@/views/appointments/AppointmentsView.vue'),
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/users/UsersView.vue'),
        },
        {
          path: 'patients',
          redirect: '/dashboard',
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/settings/SettingsView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, _from) => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  const isAuthenticated = !!token && !!user
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login'
  } else if (to.path === '/login' && isAuthenticated) {
    return '/dashboard'
  }
})

export default router
