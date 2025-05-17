// components/onboarding/Input.tsx
import React from "react"

type Props = React.InputHTMLAttributes<HTMLInputElement>

const Input = (props: Props) => {
  return (
    <input
      {...props}
      className="w-full h-10 px-[10px] text-[12px] text-[#222] font-lato placeholder:text-[#000]/40 rounded-[10px] shadow-[0px_4px_6px_rgba(157,150,141,0.12)] border border-transparent"
    />
  )
}

export default Input
