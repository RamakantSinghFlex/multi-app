// User types
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: "admin" | "parent" | "tutor" | "student"
  createdAt: string
  updatedAt: string
}

export interface Admin extends User {
  role: "admin"
}

export interface Parent extends User {
  role: "parent"
  students: Student[]
  paymentMethods?: PaymentMethod[]
  address?: Address
  phone?: string
}

export interface Tutor extends User {
  role: "tutor"
  bio?: string
  subjects: Subject[]
  gradeLevel: GradeLevel[]
  availability: Availability[]
  hourlyRate?: number
  rating?: number
  reviews?: Review[]
  education?: Education[]
  certifications?: Certification[]
  profileImage?: string
  location?: Location
  formats: ("virtual" | "in-person")[]
}

export interface Student extends User {
  role: "student"
  parent: string // Parent ID
  gradeLevel: GradeLevel
  subjects?: Subject[]
  documents?: Document[]
  testScores?: TestScore[]
  sessions?: Session[]
}

// Auth types
export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role: "parent" | "tutor"
}

export interface AuthResponse {
  user: User
  token: string
  exp?: number
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  statusCode?: number
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

// Domain types
export type GradeLevel = "elementary" | "middle" | "high"

export interface Subject {
  id: string
  name: string
  category: "math" | "science" | "writing" | "humanities" | "languages" | "social" | "test-prep" | "college-essays"
}

export interface Availability {
  id: string
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
  startTime: string
  endTime: string
  isRecurring: boolean
}

export interface Session {
  id: string
  tutor: string // Tutor ID
  student: string // Student ID
  subject: Subject
  startTime: string
  endTime: string
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
  format: "virtual" | "in-person"
  location?: Location
  notes?: SessionNote[]
  documents?: Document[]
  payment?: Payment
  zoomLink?: string
  createdAt: string
  updatedAt: string
}

export interface SessionNote {
  id: string
  session: string // Session ID
  author: string // User ID
  content: string
  visibility: "parent" | "student" | "tutor" | "admin" | "all"
  createdAt: string
}

export interface Document {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedBy: string // User ID
  createdAt: string
}

export interface TestScore {
  id: string
  student: string // Student ID
  testName: string
  score: number
  date: string
  notes?: string
}

export interface Payment {
  id: string
  session: string // Session ID
  amount: number
  status: "pending" | "completed" | "refunded" | "failed"
  method: string
  createdAt: string
}

export interface PaymentMethod {
  id: string
  type: "credit" | "debit" | "paypal"
  lastFour?: string
  expiryDate?: string
  isDefault: boolean
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Location {
  address?: Address
  latitude?: number
  longitude?: number
}

export interface Review {
  id: string
  tutor: string // Tutor ID
  author: string // User ID
  rating: number
  comment?: string
  createdAt: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  startYear: number
  endYear?: number
}

export interface Certification {
  id: string
  name: string
  issuingOrganization: string
  issueDate: string
  expirationDate?: string
}

export interface Message {
  id: string
  conversation: string // Conversation ID
  sender: string // User ID
  content: string
  attachments?: Document[]
  isRead: boolean
  isSensitive?: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  participants: string[] // User IDs
  lastMessage?: Message
  title?: string
  createdAt: string
  updatedAt: string
}

