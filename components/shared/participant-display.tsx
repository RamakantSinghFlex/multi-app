import { Users, User, UserPlus } from "lucide-react"

interface Participant {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  [key: string]: any
}

interface ParticipantDisplayProps {
  label: string
  participantType: "student" | "tutor" | "parent"
  participants: Array<Participant | string>
}

export function ParticipantDisplay({ label, participantType, participants }: ParticipantDisplayProps) {
  if (!participants || participants.length === 0) {
    return null
  }

  // Format participant names
  const formatParticipants = () => {
    return participants
      .map((p) => {
        if (typeof p === "string") return p
        return `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.email || p.id || "Unknown"
      })
      .join(", ")
  }

  // Choose icon based on participant type
  const getIcon = () => {
    switch (participantType) {
      case "tutor":
        return <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
      case "parent":
        return <UserPlus className="h-4 w-4 mt-0.5 text-muted-foreground" />
      case "student":
      default:
        return <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
    }
  }

  return (
    <div className="flex items-start gap-2">
      {getIcon()}
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm">{formatParticipants()}</p>
      </div>
    </div>
  )
}
