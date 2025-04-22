// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

// Authentication Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role?: string // For backward compatibility
  roles?: string[] // Preferred way to specify roles
  tenantName?: string
  [key: string]: any // Allow for additional properties
}

export interface AuthResponse {
  user: User
  token: string
  message?: string
}

// Base User Interface - Common properties for all user types
export interface BaseUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role?: string // For backward compatibility
  roles: string[] // Always use this for role-based logic
  status?: string
  phone?: string
  tenantName?: string
  createdAt: string
  updatedAt: string
  [key: string]: any // Allow for additional properties
}

// User Types
export interface User extends BaseUser {
  // Additional user properties can be added here
}

// Domain Types
export interface Student extends BaseUser {
  gradeLevel?: string
  school?: string
  notes?: string
  subjects?: Subject[]
  parents?: Array<Parent | string>
  tutors?: Array<Tutor | string>
}

export interface Parent extends BaseUser {
  students?: Array<Student | string>
  tutors?: Array<Tutor | string>
}

export interface Tutor extends BaseUser {
  subjects?: Subject[]
  students?: Array<Student | string>
  parents?: Array<Parent | string>
  hourlyRate?: number // Added hourly rate for payment calculation
}

export interface Subject {
  id: string
  name: string
  description?: string
}

// Participant interface for unified handling of users in appointments
export interface Participant {
  id: string
  type: "student" | "tutor" | "parent"
  user: BaseUser | string
}

// Update the Appointment interface to match the new schema
export interface Appointment {
  id: string
  title: string
  startTime: string
  endTime: string
  status: "pending" | "confirmed" | "cancelled" | "completed" | "awaiting_payment"
  notes?: string
  tutors: Array<Tutor | string>
  students: Array<Student | string>
  parents?: Array<Parent | string>
  payment?: Payment | string
  price?: number // Added price field
  stripeSessionId?: string // Added Stripe session ID
}

// Add Payment interface
export interface Payment {
  id: string
  transactionId: string
  amount: number
  status: "pending" | "completed" | "failed" | "refunded"
  createdAt: string
  updatedAt: string
  stripePaymentIntentId?: string // Added Stripe payment intent ID
}

export interface Session {
  id: string
  title?: string
  startTime: string
  endTime: string
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
  notes?: string
  student: Student | string
  tutor: Tutor | string
  subject: Subject | string
}

export interface Document {
  id: string
  title: string
  description?: string
  fileUrl: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedBy: User | string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  content: string
  sender: User | string
  conversation: Conversation | string
  isSensitive: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  title?: string
  participants: Array<User | string>
  lastMessage?: Message
  createdAt: string
  updatedAt: string
}

export interface Content {
  id: string
  title: string
  description?: string
  content?: string
  thumbnail?: string
  collectionId?: string
  updatedAt: string
  createdAt: string
}
// Authentication State
export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  successMessage: string | null
}

// Stripe Types
export interface StripeCheckoutSession {
  id: string
  url: string
}

export interface StripePaymentStatus {
  status: "complete" | "incomplete" | "expired"
  appointmentId?: string
}
