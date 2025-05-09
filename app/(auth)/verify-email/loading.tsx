import { Loader2 } from "lucide-react"

export default function VerifyEmailLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
        <p className="text-center text-muted-foreground">Loading verification page...</p>
      </div>
    </div>
  )
}
