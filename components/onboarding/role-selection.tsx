import { getMediaUrl } from "@/lib/api/media"

const roles = [
  { label: "I'm a Parent", value: "parent" },
  { label: "I'm a Student", value: "student" },
  { label: "I'm a Teacher", value: "teacher" },
]

const RoleSelection = ({ onNext }: { onNext: () => void }) => {
  const backgroundImageUrl = getMediaUrl("profile-setup-image.jpg")

  const handleSelect = (role: string) => {
    console.log("Selected role:", role)
    onNext() // go to PersonalDetailsPage
  }

  const isDisabled = (role: string): boolean => {
    return role !== "parent"
  }
  return (
    <div className="min-h-screen flex">
      {/* Left Image */}
      <div
        className="w-1/2 bg-cover bg-center hidden md:block"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />

      {/* Right Content */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-green-900 mb-2">
          Welcome to Milestone Learning!
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Tell us more about yourself:
        </p>

        <div className="space-y-4 w-full max-w-xs">
          {roles.map((role, index) => (
            <button
              key={index}
              onClick={() => handleSelect(role.value)}
              className={`w-full py-2 rounded-md transition ${
                isDisabled(role.value)
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-green-900 text-white hover:bg-green-800"
              }`}
              disabled={isDisabled(role.value)}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RoleSelection
