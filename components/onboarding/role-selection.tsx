"use client"
import { getMediaUrl } from "@/lib/api/media"
import { useAuth } from "@/lib/auth-context"
import { patchUser } from "@/lib/api/users"
import FormAlert from "./form-alert"
import { useState } from "react"

const roles = [
  { label: "I'm a Parent", value: "parent" },
  { label: "I'm a Student", value: "student" },
  { label: "I'm a Teacher", value: "teacher" },
]

const RoleSelection = ({ onNext }: { onNext: () => void }) => {
  const backgroundImageUrl = getMediaUrl("profile-setup-image.jpg")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  const handleSelect = (role: string) => {
    console.log("Selected role:", role)
    setSubmitting(true)
    if (user) {
      patchUser(user.id, { role })
        .then((response) => {
          setSubmitting(false)
          if (response.error) {
            console.error("Error updating user role:", response.error)
            setError(response.error)
          } else {
            console.log("User role updated successfully:", response.data)
            setSuccessMessage("User role updated successfully.")
            setTimeout(() => {
              onNext()
            }, 2000)
          }
        })
        .catch((error) => {
          console.error("Error updating user role:", error)
          setError("An error occurred while updating user role.")
        })
    }
  }

  const isDisabled = (role: string) => role !== "parent"

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Image */}
      <div
        className="w-1/2 bg-cover bg-center hidden md:block"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />

      {/* Right Content */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-12 text-center">
        {/* Heading */}
        <h1 className="mb-4 text-[40px] leading-[54px] font-semibold text-[#02342E] font-poppins text-center md:text-left">
          Welcome to Milestone
          <br />
          Learning!
        </h1>

        {/* Paragraph */}
        <p className="mb-10 text-[16px] leading-[32px] font-light text-black/70 font-lato">
          Tell us more about yourself:
        </p>

        {/* Form Alert */}
        <FormAlert error={error} successMessage={successMessage} />

        {/* Buttons */}
        <div className="space-y-4 w-full flex flex-col items-center">
          {roles.map((role, index) => {
            const disabled = isDisabled(role.value)
            return (
              <button
                key={index}
                onClick={() => handleSelect(role.value)}
                disabled={submitting || disabled}
                className={`w-[272px] h-[40px] px-[18px] py-[10px] rounded-full text-[16px] font-medium transition duration-200 ${
                  disabled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#02342E] text-white hover:opacity-90"
                }`}
              >
                {role.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RoleSelection
