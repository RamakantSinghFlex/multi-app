"use client"
import Confirmation from "@/components/onboarding/confirmation"
import PersonalDetails from "@/components/onboarding/personal-details"
import PreferredTime from "@/components/onboarding/preferred-time"
import RoleSelection from "@/components/onboarding/role-selection"
import StudentDetails from "@/components/onboarding/student-details"
import { useState } from "react"

const Onboarding = () => {
  const [step, setStep] = useState(0)

  const goNext = () => setStep((prev) => prev + 1)
  const goBack = () => setStep((prev) => prev - 1)

  const steps = [
    <RoleSelection key="role-selection" onNext={goNext} />,
    <PersonalDetails key="personal-details" onNext={goNext} onBack={goBack} />,
    <StudentDetails key="student-details" onNext={goNext} onBack={goBack} />,
    <PreferredTime key="preferred-time" onBack={goBack} onNext={goNext} />,
    <Confirmation key="confirmation" />,
  ]

  return <div>{steps[step]}</div>
}

export default Onboarding
