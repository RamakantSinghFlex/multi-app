import { getMediaUrl } from "@/lib/api/media"
import { useState } from "react"

const PreferredTime = ({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) => {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  const handleConfirm = () => {
    console.log("Preferred Time:", { date, time })
    onNext()
  }
  const backgroundImageUrl = getMediaUrl("preferred-time-image.jpg")
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
            <div className="h-full w-[90%] bg-green-700" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Preferred time to connect
        </h2>

        <div className="space-y-4 max-w-lg w-full">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
          <div className="flex justify-between">
            <button onClick={onBack}>Back</button>
            <div className="text-right">
              <button
                onClick={handleConfirm}
                className="bg-green-900 text-white px-6 py-2 rounded-md hover:bg-green-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreferredTime
