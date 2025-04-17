"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { StudentEdit } from "@/components/student/student-edit"
import { useRouter } from "next/navigation"

export default function TutorStudentEditPage({ params }: { params: { id: string } }) {
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

  return <StudentEdit studentId={params.id} students={students} backPath="/tutor/students" />
}
