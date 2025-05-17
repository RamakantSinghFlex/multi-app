"use client"
import { useForm } from "react-hook-form"
import OnboardingFormWrapper from "./OnboardingFormWrapper"
import FormGroup from "./FormGroup"
import Input from "./Input"
import Select from "./Select"
import { useAuth } from "@/lib/auth-context"
import { patchUser } from "@/lib/api/users"
import FormAlert from "./form-alert"
import { useState } from "react"

type FormData = {
  salutation: string
  firstName: string
  lastName: string
  phone: string
}

const PersonalDetails = ({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) => {
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      salutation: "Mr.",
      firstName: "",
      lastName: "",
      phone: "",
    },
    mode: "onChange",
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    setSuccessMessage(null)

    if (!user) return

    try {
      const firstNameWithTitle = `${data.salutation} ${data.firstName.trim()}`
      const response = await patchUser(user.id, {
        firstName: firstNameWithTitle,
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
      })

      if (response.error) {
        console.error("Error updating user details:", response.error)
        setError(response.error)
        return
      }

      setSuccessMessage("User Details updated successfully.")
      setTimeout(() => {
        onNext()
      }, 2000)
    } catch (err) {
      console.error("Error during submission:", err)
      setError("An error occurred while updating user details.")
    }
  }

  return (
    <OnboardingFormWrapper imageName="profile-setup-image.jpg" stepIndex={0}>
      <h2 className="text-[24px] leading-[32px] font-normal text-[#1D1D1D] font-poppins">
        Personal Details
      </h2>

      <FormAlert error={error} successMessage={successMessage} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormGroup label="Salutation" className="w-[90px]">
          <Select {...register("salutation")}>
            <option>Mr.</option>
            <option>Ms.</option>
            <option>Mrs.</option>
            <option>Dr.</option>
          </Select>
        </FormGroup>

        <FormGroup label="First Name">
          <Input
            {...register("firstName", {
              required: "First name is required",
              pattern: {
                value: /^[A-Za-z\s'-]+$/,
                message: "First name must only contain letters",
              },
            })}
            placeholder="Type here"
          />
          {errors.firstName && (
            <p className="text-sm font-medium text-destructive mt-1">
              {errors.firstName.message}
            </p>
          )}
        </FormGroup>

        <FormGroup label="Last Name">
          <Input
            {...register("lastName", {
              required: "Last name is required",
              pattern: {
                value: /^[A-Za-z\s'-]+$/,
                message: "Last name must only contain letters",
              },
            })}
            placeholder="Type here"
          />
          {errors.lastName && (
            <p className="text-sm font-medium text-destructive mt-1">
              {errors.lastName.message}
            </p>
          )}
        </FormGroup>

        <FormGroup label="Mobile Number">
          <Input
            {...register("phone", {
              required: "Mobile number is required",
              pattern: {
                value: /^\+?\d{10,15}$/,
                message: "Enter a valid mobile number",
              },
            })}
            placeholder="E.g. +1 1234567890"
          />
          {errors.phone && (
            <p className="text-sm font-medium text-destructive mt-1">
              {errors.phone.message}
            </p>
          )}
        </FormGroup>

        <div className="flex justify-between items-center mt-4">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-black"
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-[#02342E] text-white px-6 py-2 rounded-full hover:bg-[#012c27]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Save & Continue"}
          </button>
        </div>
      </form>
    </OnboardingFormWrapper>
  )
}

export default PersonalDetails
