"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Student } from "@/lib/types"

interface UseStudentListProps {
  initialStudents: Student[]
}

export function useStudentList({ initialStudents = [] }: UseStudentListProps) {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [isLoading, setIsLoading] = useState(false)

  // Load recently created students from localStorage on mount
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
      console.error("Error retrieving recently created students:", err)
      setStudents(initialStudents)
    }
  }, [initialStudents])

  // Function to add a new student to the list
  const addStudent = useCallback((newStudent: Student) => {
    setStudents((prevStudents) => {
      // Check if student already exists in the list
      const exists = prevStudents.some((student) => student.id === newStudent.id)
      if (exists) {
        return prevStudents
      }

      // Add the new student to the beginning of the list
      return [newStudent, ...prevStudents]
    })

    // Also store in localStorage for persistence
    try {
      const existingStudentsJson = localStorage.getItem("recentlyCreatedStudents") || "[]"
      const existingStudents = JSON.parse(existingStudentsJson)

      // Add the new student and keep only the 5 most recent
      existingStudents.unshift(newStudent)
      const recentStudents = existingStudents.slice(0, 5)

      localStorage.setItem("recentlyCreatedStudents", JSON.stringify(recentStudents))
    } catch (err) {
      console.error("Error storing student in localStorage:", err)
    }
  }, [])

  // Function to refresh the student list from the server
  const refreshStudents = useCallback(() => {
    setIsLoading(true)
    router.refresh()
    // The page will re-render with fresh data from the server
    setIsLoading(false)
  }, [router])

  return {
    students,
    isLoading,
    addStudent,
    refreshStudents,
    setStudents,
  }
}
