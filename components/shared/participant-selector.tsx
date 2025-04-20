"use client"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface Participant {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  [key: string]: any
}

interface ParticipantSelectorProps {
  label: string
  participantType: "student" | "tutor" | "parent"
  selectedParticipants: string[]
  availableParticipants: Participant[]
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  disabled?: boolean
}

export function ParticipantSelector({
  label,
  participantType,
  selectedParticipants,
  availableParticipants,
  onAdd,
  onRemove,
  disabled = false,
}: ParticipantSelectorProps) {
  const getParticipantName = (id: string) => {
    const participant = availableParticipants.find((p) => p.id === id)
    return participant
      ? `${participant.firstName || ""} ${participant.lastName || ""}`.trim() || participant.email || id
      : id
  }

  // Filter out already selected participants
  const filteredParticipants = availableParticipants.filter((p) => !selectedParticipants.includes(p.id))

  return (
    <div className="space-y-2">
      <Label htmlFor={participantType}>{label}</Label>
      <Select onValueChange={onAdd} disabled={disabled || filteredParticipants.length === 0}>
        <SelectTrigger id={participantType}>
          <SelectValue placeholder={`Select ${participantType}s`} />
        </SelectTrigger>
        <SelectContent>
          {filteredParticipants.map((participant) => (
            <SelectItem key={participant.id} value={participant.id}>
              {`${participant.firstName || ""} ${participant.lastName || ""}`.trim() || participant.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedParticipants.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedParticipants.map((id) => (
            <Badge key={id} variant="secondary" className="flex items-center gap-1">
              {getParticipantName(id)}
              <button
                type="button"
                onClick={() => onRemove(id)}
                disabled={disabled}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
