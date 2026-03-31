export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface User {
  userId: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type UserRole = 'ADMIN' | 'DENTIST' | 'ASSISTANT' | 'PATIENT'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface Appointment {
  appointmentId: string
  tenantId: string
  patientId: string
  dentistId: string
  appointmentTime: string
  durationMinutes: number
  status: AppointmentStatus
  notes?: string
  reminderSentAt?: string
  reminderAttempts: number
  createdAt: string
  updatedAt: string
  patient?: User
  dentist?: User
}

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface CreateAppointmentRequest {
  patientId: string
  dentistId: string
  appointmentTime: string
  durationMinutes?: number
  notes?: string
}

export interface Clinic {
  clinicId: string
  tenantId: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
