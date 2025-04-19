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

export interface AuthResponse {
  user: User
  token: string
  message?: string
}

export interface SignupCredentials {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role?: string
  roles?: string[]
  tenants?: Array<{ id: any; tenant: string }>
}

// User Types
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role?: string
  roles?: string[]
  createdAt: string
  updatedAt: string
  students?: Student[]
  tutors?: Tutor[]
  parents?: Parent[]
  appointments?: Appointment[]
}

// Domain Types
export interface Student {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  gradeLevel?: string
  tenantName?: string
  subjects?: Subject[]
  parents?: Parent[]
  tutors?: Tutor[]
}

export interface Parent {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  students?: Student[]
}

export interface Tutor {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  subjects?: Subject[]
  students?: Student[]
}

export interface Subject {
  id: string
  name: string
  description?: string
}

// Update the Appointment interface to match the new schema
export interface Appointment {
  id: string
  title: string
  startTime: string
  endTime: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  notes?: string
  tutors: Array<Tutor | string>
  students: Array<Student | string>
  parents?: Array<Parent | string>
  payment?: Payment | string
}

// Add Payment interface
export interface Payment {
  id: string
  transactionId: string
  amount: number
  status: "pending" | "completed" | "failed" | "refunded"
  createdAt: string
  updatedAt: string
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
