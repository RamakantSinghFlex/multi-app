import { getMediaUrl } from "@/lib/api/media"
import { useState } from "react"

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

  const backgroundImageUrl = getMediaUrl("profile-setup-image.jpg")

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
            <div className="h-full w-1/3 bg-green-700" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Personal Details
        </h2>

        <div className="space-y-4 max-w-lg w-full">
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          >
            <option>Mr.</option>
            <option>Ms.</option>
            <option>Mrs.</option>
            <option>Dr.</option>
          </select>

          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          />

          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          />

          <input
            type="text"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
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

export default PersonalDetails
