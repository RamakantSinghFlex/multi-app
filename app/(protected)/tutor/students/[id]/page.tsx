"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { StudentView } from "@/components/student/student-view"
import { useRouter } from "next/navigation"

export default function TutorStudentViewPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [students, setStudents] = useState([])

  useEffect(() => {
    if (user) {
      // Extract students from the user object
      const studentsList = user.students || []
      setStudents(studentsList)
    }
  }, [user])

  return <StudentView studentId={params.id} students={students} userRole="tutor" backPath="/tutor/students" />
}
