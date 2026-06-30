import axios, { type AxiosInstance, type AxiosError } from 'axios'
import type { ApiResponse, LoginRequest, LoginResponse, User, Appointment, CreateAppointmentRequest } from '@/types'
import {
  isDemoMode,
  simulateDelay,
  mockLoginResponse,
  mockUsers,
  mockAppointments,
  filterAppointmentsByDateRange,
  filterAppointmentsByPatient,
  filterAppointmentsByDentist,
  mockApiResponse,
} from './mockData'

const DEMO_MODE = isDemoMode()
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  // Skip interceptors in demo mode — no real tokens
  if (DEMO_MODE) return config

  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    if (DEMO_MODE) {
      await simulateDelay()
      if (credentials.email && credentials.password) {
        return mockLoginResponse
      }
      throw new Error('Credenciales inválidas')
    }
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials)
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Login failed')
  },

  async register(data: {
    clinicName: string
    adminEmail: string
    adminPassword: string
    adminFirstName: string
    adminLastName: string
  }): Promise<LoginResponse> {
    if (DEMO_MODE) {
      await simulateDelay()
      return mockLoginResponse
    }
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', null, { params: data })
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Registration failed')
  },
}

export const userService = {
  async getUsers(params?: {
    role?: string
    isActive?: boolean
  }): Promise<User[]> {
    if (DEMO_MODE) {
      await simulateDelay()
      let result = [...mockUsers]
      if (params?.role) result = result.filter(u => u.role === params.role)
      if (params?.isActive !== undefined) result = result.filter(u => u.isActive === params.isActive)
      return result
    }
    const response = await api.get<ApiResponse<User[]>>('/users', { params })
    return response.data.data || []
  },

  async getPatients(): Promise<User[]> {
    if (DEMO_MODE) {
      await simulateDelay()
      return mockUsers.filter(u => u.role === 'PATIENT')
    }
    const response = await api.get<ApiResponse<User[]>>('/users', { params: { role: 'PATIENT' } })
    return response.data.data || []
  },

  async getDentists(): Promise<User[]> {
    if (DEMO_MODE) {
      await simulateDelay()
      return mockUsers.filter(u => u.role === 'DENTIST')
    }
    const response = await api.get<ApiResponse<User[]>>('/users', { params: { role: 'DENTIST' } })
    return response.data.data || []
  },

  async getUserById(id: string): Promise<User> {
    if (DEMO_MODE) {
      await simulateDelay()
      const user = mockUsers.find(u => u.userId === id)
      if (user) return user
      throw new Error('Usuario no encontrado')
    }
    const response = await api.get<ApiResponse<User>>(`/users/${id}`)
    if (response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'User not found')
  },

  async createUser(data: {
    email: string
    firstName: string
    lastName: string
    role: string
    password: string
  }): Promise<User> {
    if (DEMO_MODE) {
      await simulateDelay()
      const newUser: User = {
        userId: `pat-${String(mockUsers.length + 1).padStart(3, '0')}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as User['role'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockUsers.push(newUser)
      return newUser
    }
    const response = await api.post<ApiResponse<User>>('/users', null, { params: data })
    if (response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to create user')
  },

  async updateUser(id: string, data: Partial<{
    firstName: string
    lastName: string
    role: string
    phone?: string
    birthDate?: string
    address?: string
    gender?: string
  }>): Promise<User> {
    if (DEMO_MODE) {
      await simulateDelay()
      const index = mockUsers.findIndex(u => u.userId === id)
      if (index === -1) throw new Error('Usuario no encontrado')
      const updated: User = {
        ...mockUsers[index]!,
        firstName: data.firstName ?? mockUsers[index]!.firstName,
        lastName: data.lastName ?? mockUsers[index]!.lastName,
        role: data.role ? (data.role as User['role']) : mockUsers[index]!.role,
        phone: data.phone ?? mockUsers[index]!.phone,
        birthDate: data.birthDate ?? mockUsers[index]!.birthDate,
        address: data.address ?? mockUsers[index]!.address,
        gender: data.gender ?? mockUsers[index]!.gender,
        updatedAt: new Date().toISOString(),
      }
      mockUsers[index] = updated
      return updated
    }
    const params: Record<string, string | undefined> = {}
    if (data.firstName) params.firstName = data.firstName
    if (data.lastName) params.lastName = data.lastName
    if (data.role) params.role = data.role
    if (data.phone) params.phone = data.phone
    if (data.birthDate) params.birthDate = data.birthDate
    if (data.address) params.address = data.address
    if (data.gender) params.gender = data.gender

    const response = await api.put<ApiResponse<User>>(`/users/${id}`, null, { params })
    if (response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to update user')
  },

  async deleteUser(id: string): Promise<void> {
    if (DEMO_MODE) {
      await simulateDelay()
      const index = mockUsers.findIndex(u => u.userId === id)
      if (index === -1) throw new Error('Usuario no encontrado')
      mockUsers.splice(index, 1)
      return
    }
    const response = await api.delete<ApiResponse<void>>(`/users/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete user')
    }
  },

  async changePassword(id: string, newPassword: string): Promise<void> {
    if (DEMO_MODE) {
      await simulateDelay()
      return
    }
    const response = await api.post<ApiResponse<void>>(`/users/${id}/change-password`, null, { params: { newPassword } })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to change password')
    }
  },
}

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    if (DEMO_MODE) {
      await simulateDelay()
      return [...mockAppointments]
    }
    const response = await api.get<ApiResponse<Appointment[]>>('/appointments')
    return response.data.data || []
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    if (DEMO_MODE) {
      await simulateDelay()
      const apt = mockAppointments.find(a => a.appointmentId === id)
      if (apt) return apt
      throw new Error('Turno no encontrado')
    }
    const response = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`)
    if (response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Appointment not found')
  },

  async getAppointmentsByDateRange(start: string, end: string): Promise<Appointment[]> {
    if (DEMO_MODE) {
      await simulateDelay()
      return filterAppointmentsByDateRange(start, end)
    }
    const response = await api.get<ApiResponse<Appointment[]>>('/appointments/range', { params: { start, end } })
    return response.data.data || []
  },

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    if (DEMO_MODE) {
      await simulateDelay()
      return filterAppointmentsByPatient(patientId)
    }
    const response = await api.get<ApiResponse<Appointment[]>>(`/appointments/patient/${patientId}`)
    return response.data.data || []
  },

  async getAppointmentsByDentist(dentistId: string): Promise<Appointment[]> {
    if (DEMO_MODE) {
      await simulateDelay()
      return filterAppointmentsByDentist(dentistId)
    }
    const response = await api.get<ApiResponse<Appointment[]>>(`/appointments/dentist/${dentistId}`)
    return response.data.data || []
  },

  async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
    if (DEMO_MODE) {
      await simulateDelay()
      const patient = mockUsers.find(u => u.userId === data.patientId)
      const dentist = mockUsers.find(u => u.userId === data.dentistId)
      const appointmentTime = data.appointmentTime.endsWith(':00')
        ? data.appointmentTime
        : `${data.appointmentTime}:00`
      const newApt: Appointment = {
        appointmentId: `apt-${String(mockAppointments.length + 1).padStart(3, '0')}`,
        tenantId: 'tenant-001',
        patientId: data.patientId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente',
        dentistId: data.dentistId,
        dentistName: dentist ? `${dentist.firstName} ${dentist.lastName}` : 'Dentista',
        appointmentTime,
        durationMinutes: data.durationMinutes || 30,
        status: 'SCHEDULED',
        notes: data.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reminderAttempts: 0,
      }
      mockAppointments.unshift(newApt)
      return newApt
    }
    const params: Record<string, string | number | undefined> = {
      patientId: data.patientId,
      dentistId: data.dentistId,
      appointmentTime: data.appointmentTime.endsWith(':00') ? data.appointmentTime : `${data.appointmentTime}:00`,
    }
    if (data.durationMinutes) params.durationMinutes = data.durationMinutes
    if (data.notes) params.notes = data.notes

    const response = await api.post<ApiResponse<Appointment>>('/appointments', null, { params })
    if (response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to create appointment')
  },

  async updateAppointment(id: string, data: Partial<{
    newTime: string
    newNotes: string
  }>): Promise<Appointment> {
    if (DEMO_MODE) {
      await simulateDelay()
      const index = mockAppointments.findIndex(a => a.appointmentId === id)
      if (index === -1) throw new Error('Turno no encontrado')
      const updated: Appointment = {
        ...mockAppointments[index]!,
        appointmentTime: data.newTime ?? mockAppointments[index]!.appointmentTime,
        notes: data.newNotes !== undefined ? data.newNotes : mockAppointments[index]!.notes,
        updatedAt: new Date().toISOString(),
      }
      mockAppointments[index] = updated
      return updated
    }
    const params: Record<string, string | undefined> = {}
    if (data.newTime) {
      params.newTime = data.newTime.endsWith(':00') ? data.newTime : `${data.newTime}:00`
    }
    if (data.newNotes !== undefined) {
      params.newNotes = data.newNotes
    }

    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}`, null, { params })
    if (response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to update appointment')
  },

  async cancelAppointment(id: string): Promise<void> {
    if (DEMO_MODE) {
      await simulateDelay()
      const index = mockAppointments.findIndex(a => a.appointmentId === id)
      if (index === -1) throw new Error('Turno no encontrado')
      mockAppointments[index] = {
        ...mockAppointments[index]!,
        status: 'CANCELLED',
        updatedAt: new Date().toISOString(),
      }
      return
    }
    const response = await api.delete<ApiResponse<void>>(`/appointments/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel appointment')
    }
  },

  async completeAppointment(id: string): Promise<void> {
    if (DEMO_MODE) {
      await simulateDelay()
      const index = mockAppointments.findIndex(a => a.appointmentId === id)
      if (index === -1) throw new Error('Turno no encontrado')
      mockAppointments[index] = {
        ...mockAppointments[index]!,
        status: 'COMPLETED',
        updatedAt: new Date().toISOString(),
      }
      return
    }
    const response = await api.post<ApiResponse<void>>(`/appointments/${id}/complete`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to complete appointment')
    }
  },
}

export default api
