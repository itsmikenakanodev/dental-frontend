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
  async getUsers(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/users')
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
    const response = await api.post<ApiResponse<Appointment>>('/appointments', null, { params: data })
    if (response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to create appointment')
  },

  async updateAppointment(id: string, data: Partial<{
    newTime: string
    newNotes: string
  }>): Promise<Appointment> {
    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}`, null, { params: data })
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
