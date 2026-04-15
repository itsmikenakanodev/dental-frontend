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
  accessToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface Appointment {
  appointmentId: string
  tenantId: string
  patientId: string
  patientName?: string      // Nombre completo del paciente (del backend)
  dentistId: string
  dentistName?: string      // Nombre completo del dentista (del backend)
  appointmentTime: string
  durationMinutes: number
  status: AppointmentStatus
  notes?: string
  reminderSentAt?: string
  reminderAttempts: number
  createdAt: string
  updatedAt: string
  // Deprecated: el backend ahora devuelve patientName/dentistName como strings
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
