// API Response Types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  statusCode?: number
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
  [key: string]: any
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role?: string
  roles?: string[]
  tenantName?: string
  [key: string]: any
}

export interface AuthResponse {
  user: User
  token: string
  message?: string
}

// Pagination Types
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

// Content Types
export interface Content {
  id: string
  title: string
  slug?: string
  description?: string
  content?: any
  thumbnail?: string
  createdAt: string
  updatedAt: string
  [key: string]: any
}

// Appointment Types
export interface Appointment {
  id: string
  title: string
  startTime: string
  endTime: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  notes?: string
  student: User | string
  tutor: User | string
  subject?: Subject | string
  createdAt: string
  updatedAt: string
}

// Subject Types
export interface Subject {
  id: string
  name: string
  description?: string
  gradeLevel?: string
  createdAt: string
  updatedAt: string
}

// Session Types
export interface Session {
  id: string
  title: string
  startTime: string
  endTime: string
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  notes?: string
  student: User | string
  tutor: User | string
  subject?: Subject | string
  createdAt: string
  updatedAt: string
}

// Message Types
export interface Message {
  id: string
  content: string
  sender: User | string
  conversation: Conversation | string
  attachments?: string[]
  isSensitive?: boolean
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  id: string
  title?: string
  participants: User[] | string[]
  lastMessage?: Message | string
  createdAt: string
  updatedAt: string
}

// Parent Types
export interface Parent {
  id: string
  user: User | string
  students: (Student | string)[]
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
}

// Student Types
export interface Student {
  id: string
  user?: User | string
  parent?: Parent | string
  gradeLevel?: string
  school?: string
  subjects?: (Subject | string)[]
  createdAt: string
  updatedAt: string
}

// Tutor Types
export interface Tutor {
  id: string
  user: User | string
  subjects: (Subject | string)[]
  bio?: string
  education?: string
  experience?: string
  hourlyRate?: number
  availability?: any
  createdAt: string
  updatedAt: string
}

// Document Types
export interface Document {
  id: string
  title: string
  description?: string
  fileUrl: string
  fileType: string
  fileSize: number
  owner: User | string
  sharedWith?: (User | string)[]
  createdAt: string
  updatedAt: string
}
