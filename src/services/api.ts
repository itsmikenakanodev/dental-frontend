import axios, { type AxiosInstance, type AxiosError } from 'axios'
import type { ApiResponse, LoginRequest, LoginResponse, User, Appointment, CreateAppointmentRequest } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && token.split('.').length === 3) {
    config.headers.Authorization = `Bearer ${token}`
  } else if (token) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
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
    const response = await api.get<ApiResponse<User[]>>('/users', { params })
    return response.data.data || []
  },

  async getPatients(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/users', { params: { role: 'PATIENT' } })
    return response.data.data || []
  },

  async getDentists(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/users', { params: { role: 'DENTIST' } })
    return response.data.data || []
  },

  async getUserById(id: string): Promise<User> {
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
  }>): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, null, { params: data })
    if (response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to update user')
  },

  async deleteUser(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/users/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete user')
    }
  },

  async changePassword(id: string, newPassword: string): Promise<void> {
    const response = await api.post<ApiResponse<void>>(`/users/${id}/change-password`, null, { params: { newPassword } })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to change password')
    }
  },
}

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    const response = await api.get<ApiResponse<Appointment[]>>('/appointments')
    return response.data.data || []
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`)
    if (response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Appointment not found')
  },

  async getAppointmentsByDateRange(start: string, end: string): Promise<Appointment[]> {
    const response = await api.get<ApiResponse<Appointment[]>>('/appointments/range', { params: { start, end } })
    return response.data.data || []
  },

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const response = await api.get<ApiResponse<Appointment[]>>(`/appointments/patient/${patientId}`)
    return response.data.data || []
  },

  async getAppointmentsByDentist(dentistId: string): Promise<Appointment[]> {
    const response = await api.get<ApiResponse<Appointment[]>>(`/appointments/dentist/${dentistId}`)
    return response.data.data || []
  },

  async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
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
    const response = await api.delete<ApiResponse<void>>(`/appointments/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel appointment')
    }
  },

  async completeAppointment(id: string): Promise<void> {
    const response = await api.post<ApiResponse<void>>(`/appointments/${id}/complete`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to complete appointment')
    }
  },
}

export default api
