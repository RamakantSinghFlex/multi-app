"use client"
import { useState } from "react"
import OnboardingFormWrapper from "./OnboardingFormWrapper"
import FormGroup from "./FormGroup"
import Input from "./Input"
import Select from "./Select"

const PersonalDetails = ({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) => {
  const [title, setTitle] = useState("Mr.")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [mobile, setMobile] = useState("")

  const handleContinue = () => {
    console.log({ title, firstName, lastName, mobile })
    onNext()
  }

  return (
    <OnboardingFormWrapper imageName="profile-setup-image.jpg" stepIndex={0}>
      <h2 className="text-[24px] leading-[32px] font-normal text-[#1D1D1D] font-poppins">
        Personal Details
      </h2>

      <FormGroup label="Salutation">
        <Select
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-[90px]"
        >
          <option>Mr.</option>
          <option>Ms.</option>
          <option>Mrs.</option>
          <option>Dr.</option>
        </Select>
      </FormGroup>

      <FormGroup label="First Name">
        <Input
          type="text"
          placeholder="Type here"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Last Name">
        <Input
          type="text"
          placeholder="Type here"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Mobile Number">
        <Input
          type="text"
          placeholder="E.g. +1 1234567890"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
      </FormGroup>

      <div className="flex justify-between items-center mt-4">
        <button onClick={onBack} className="text-sm font-medium text-black">
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

export default PersonalDetails
