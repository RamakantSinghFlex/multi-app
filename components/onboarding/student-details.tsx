import { getMediaUrl } from "@/lib/api/media"
import { useState } from "react"

const gradeOptions = ["Kindergarten", "1st", "2nd", "3rd", "4th", "5th"]
const subjects = ["Math", "Science", "English", "History", "Other"]

const StudentDetails = ({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) => {
  const [students, setStudents] = useState([
    { firstName: "", lastName: "", school: "", grade: "", subject: "" },
  ])

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...students]
    ;(updated[index] as any)[field] = value
    setStudents(updated)
  }

  const handleAddStudent = () => {
    setStudents([
      ...students,
      { firstName: "", lastName: "", school: "", grade: "", subject: "" },
    ])
  }

  const handleRemoveStudent = (index: number) => {
    const updated = [...students]
    updated.splice(index, 1)
    setStudents(updated)
  }

  const handleContinue = () => {
    console.log("Student Details:", students)
    onNext()
  }

  const backgroundImageUrl = getMediaUrl("student-details-image.jpg")

  return (
    <div className="min-h-screen flex">
      {/* Left Image */}
      <div
        className="w-1/2 bg-cover bg-center hidden md:block"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />

      {/* Right Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-12">
        {/* Progress bar */}
        <div className="w-full max-w-lg mb-6">
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-green-700" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Student Details
        </h2>

        <div className="space-y-10 max-w-lg w-full">
          {students.map((student, idx) => (
            <div key={idx} className="space-y-3 border-b border-gray-200 pb-6">
              <input
                type="text"
                placeholder="First Name"
                value={student.firstName}
                onChange={(e) => handleChange(idx, "firstName", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />

              <input
                type="text"
                placeholder="Last Name"
                value={student.lastName}
                onChange={(e) => handleChange(idx, "lastName", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />

              <input
                type="text"
                placeholder="School"
                value={student.school}
                onChange={(e) => handleChange(idx, "school", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />

              <select
                value={student.grade}
                onChange={(e) => handleChange(idx, "grade", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Grade</option>
                {gradeOptions.map((grade, g) => (
                  <option key={g} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>

              <select
                value={student.subject}
                onChange={(e) => handleChange(idx, "subject", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Subject need help</option>
                {subjects.map((subj, s) => (
                  <option key={s} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>

              {students.length > 1 && (
                <button
                  onClick={() => handleRemoveStudent(idx)}
                  className="text-sm text-red-600 flex items-center gap-1"
                >
                  🗑 Remove
                </button>
              )}
            </div>
          ))}

          <button
            onClick={handleAddStudent}
            className="text-sm text-green-900 font-medium hover:underline"
          >
            + Add Another Student
          </button>
          <div className="flex justify-between">
            <button onClick={onBack}>Back</button>
            <div className="text-right">
              <button
                onClick={handleContinue}
                className="bg-green-900 text-white px-6 py-2 rounded-md hover:bg-green-800"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDetails
