"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Student } from "@/lib/types"
import { useRouter } from "next/navigation"
import { logger } from "@/lib/monitoring"

interface StudentContextType {
  students: Student[]
  addStudent: (student: Student) => void
  refreshStudents: () => void
  isLoading: boolean
  clearStudentData: () => void
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

export function StudentProvider({
  children,
  initialStudents = [],
}: {
  children: ReactNode
  initialStudents?: Student[]
}) {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize with any recently created students from localStorage
  useEffect(() => {
    try {
      const recentlyCreatedStudentsJson = localStorage.getItem("recentlyCreatedStudents")
      if (recentlyCreatedStudentsJson) {
        const recentlyCreatedStudents = JSON.parse(recentlyCreatedStudentsJson)

        if (Array.isArray(recentlyCreatedStudents) && recentlyCreatedStudents.length > 0) {
          // Create a map of existing student IDs for quick lookup
          const existingIds = new Set(initialStudents.map((student) => student.id))

          // Filter out students that are already in the list
          const newStudents = recentlyCreatedStudents.filter(
            (student: Student) => student && student.id && !existingIds.has(student.id),
          )

          // If we have new students, add them to the list
          if (newStudents.length > 0) {
            setStudents([...newStudents, ...initialStudents])
          } else {
            setStudents(initialStudents)
          }
        } else {
          setStudents(initialStudents)
        }
      } else {
        setStudents(initialStudents)
      }
    } catch (err) {
      logger.error("Error retrieving recently created students:", err)
      setStudents(initialStudents)
    }
  }, [initialStudents])

  // Function to add a new student to the list
  const addStudent = (newStudent: Student) => {
    if (!newStudent || !newStudent.id) {
      logger.error("Attempted to add invalid student:", newStudent)
      return
    }

    setStudents((prevStudents) => {
      // Check if student already exists in the list
      const existingIndex = prevStudents.findIndex((student) => student.id === newStudent.id)

      if (existingIndex >= 0) {
        // If student exists, update it with new data
        const updatedStudents = [...prevStudents]
        updatedStudents[existingIndex] = { ...updatedStudents[existingIndex], ...newStudent }
        return updatedStudents
      }

      // Add the new student to the beginning of the list
      return [newStudent, ...prevStudents]
    })

    // Also store in localStorage for persistence
    try {
      const existingStudentsJson = localStorage.getItem("recentlyCreatedStudents") || "[]"
      let existingStudents = JSON.parse(existingStudentsJson)

      // Ensure existingStudents is an array
      if (!Array.isArray(existingStudents)) {
        existingStudents = []
      }

      // Remove any existing entry with the same ID
      existingStudents = existingStudents.filter(
        (student: Student) => student && student.id && student.id !== newStudent.id,
      )

      // Add the new student and keep only the 5 most recent
      existingStudents.unshift(newStudent)
      const recentStudents = existingStudents.slice(0, 5)

      localStorage.setItem("recentlyCreatedStudents", JSON.stringify(recentStudents))
    } catch (err) {
      logger.error("Error storing student in localStorage:", err)
    }
  }

  // Function to refresh the student list from the server
  const refreshStudents = () => {
    setIsLoading(true)
    router.refresh()
    // The page will re-render with fresh data from the server
    setIsLoading(false)
  }

  // Function to clear student data
  const clearStudentData = () => {
    setStudents([])
    localStorage.removeItem("recentlyCreatedStudents")
    logger.info("Student data cleared")
  }

  return (
    <StudentContext.Provider value={{ students, addStudent, refreshStudents, isLoading, clearStudentData }}>
      {children}
    </StudentContext.Provider>
  )
}

export function useStudentContext() {
  const context = useContext(StudentContext)
  if (context === undefined) {
    throw new Error("useStudentContext must be used within a StudentProvider")
  }
  return context
}
