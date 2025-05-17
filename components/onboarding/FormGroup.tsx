// components/onboarding/FormGroup.tsx
import React from "react"

type Props = {
  label: string
  children: React.ReactNode
}

const FormGroup = ({ label, children }: Props) => {
  return (
    <div className="relative w-full">
      <label className="absolute text-[10px] font-medium text-[#545454] px-1 bg-white top-[-6px] left-[12px] z-10 font-lato">
        {label}
      </label>
      {children}
    </div>
  )
}

export default FormGroup
