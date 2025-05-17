"use client"

import { useEffect, useState } from "react"
import Input from "./Input"
import FormGroup from "./FormGroup"
import OnboardingFormWrapper from "./OnboardingFormWrapper"

const PreferredTime = ({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) => {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  useEffect(() => {
    const now = new Date()

    // Format date as YYYY-MM-DD
    const formattedDate = now.toISOString().split("T")[0]

    // Format time as HH:MM in 24-hour format
    const formattedTime = now.toTimeString().slice(0, 5)

    setDate(formattedDate)
    setTime(formattedTime)
  }, [])

  const handleConfirm = () => {
    console.log("Preferred Time:", { date, time })
    onNext()
  }

  return (
    <OnboardingFormWrapper imageName="preferred-time-image.jpg" stepIndex={2}>
      <h2 className="text-[24px] leading-[32px] font-normal font-poppins text-[#1D1D1D]">
        Preferred time to connect
      </h2>

      <FormGroup label="Date">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Time">
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </FormGroup>

      <div className="flex justify-between items-center w-full mt-6">
        <button onClick={onBack} className="text-black font-medium">
          Back
        </button>
        <button
          onClick={handleConfirm}
          className="bg-[#02342E] text-white px-6 py-2 rounded-full hover:bg-[#012c27]"
        >
          Confirm
        </button>
      </div>
    </OnboardingFormWrapper>
  )
}

export default PreferredTime
