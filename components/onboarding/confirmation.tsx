import { useRouter } from "next/navigation"

const Confirmation = () => {
  const router = useRouter()
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50">
      <div className="max-w-md text-center bg-white p-10 rounded-md shadow-md">
        <div className="text-green-700 text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          You&apos;re all set!
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Thank you for sharing the details. Our team will reach out to you
          shortly.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-green-900 text-white px-6 py-2 rounded-md hover:bg-green-800 text-sm"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  )
}

export default Confirmation
