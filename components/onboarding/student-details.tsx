"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import OnboardingFormWrapper from "./OnboardingFormWrapper"
import Input from "./Input"
import Select from "./Select"
import FormGroup from "./FormGroup"

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

  return (
    <OnboardingFormWrapper imageName="student-details-image.jpg" stepIndex={1}>
      <h2 className="text-[24px] leading-[32px] font-normal font-poppins text-[#1D1D1D]">
        Student Details
      </h2>

      {students.map((student, idx) => (
        <div key={idx} className="flex flex-col gap-5">
          <FormGroup label="First name">
            <Input
              placeholder="Type here"
              value={student.firstName}
              onChange={(e) => handleChange(idx, "firstName", e.target.value)}
            />
          </FormGroup>

          <FormGroup label="Last name">
            <Input
              placeholder="Type here"
              value={student.lastName}
              onChange={(e) => handleChange(idx, "lastName", e.target.value)}
            />
          </FormGroup>

          <FormGroup label="School name">
            <Input
              placeholder="Type here"
              value={student.school}
              onChange={(e) => handleChange(idx, "school", e.target.value)}
            />
          </FormGroup>

          <FormGroup label="Grade">
            <Select
              value={student.grade}
              onChange={(e) => handleChange(idx, "grade", e.target.value)}
            >
              <option value="" disabled hidden>
                Select Grade
              </option>
              {gradeOptions.map((grade, g) => (
                <option key={g} value={grade}>
                  {grade}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup label="Subject need help">
            <Select
              value={student.subject}
              onChange={(e) => handleChange(idx, "subject", e.target.value)}
            >
              <option value="" disabled hidden>
                Select Subject
              </option>
              {subjects.map((subj, s) => (
                <option key={s} value={subj}>
                  {subj}
                </option>
              ))}
            </Select>
          </FormGroup>

          {students.length > 1 && (
            <div className="flex justify-end">
              <button
                onClick={() => handleRemoveStudent(idx)}
                className="flex items-center text-[#02342E] text-sm font-semibold gap-1"
              >
                Remove <Trash2 size={16} />
              </button>
            </div>
          )}

          {idx < students.length - 1 && (
            <div className="border-dashed border-t border-gray-300 my-3" />
          )}
        </div>
      ))}

      <button
        onClick={handleAddStudent}
        className="self-center flex items-center justify-center gap-2 text-[#02342E] font-semibold text-[14px] hover:underline"
      >
        + Add Another Student
      </button>

      <div className="flex justify-between items-center w-full mt-6">
        <button onClick={onBack} className="text-black font-medium">
          Back
        </button>
        <button
          onClick={handleContinue}
          className="bg-[#02342E] text-white px-6 py-2 rounded-full hover:bg-[#012c27]"
        >
          Save & Continue
        </button>
      </div>
    </OnboardingFormWrapper>
  )
}

export default StudentDetails
