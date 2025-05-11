"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createTwilioConversation } from "@/lib/api/twilio"
import { toast } from "@/components/ui/use-toast"
import { getMe } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  role?: string
  roles?: string[]
}

export function NewConversationDialog({ onConversationCreated }: { onConversationCreated: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [friendlyName, setFriendlyName] = useState("")
  const [selectedParticipant, setSelectedParticipant] = useState("")
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchRelatedUsers = async () => {
      try {
        // Fetch the current user with all relationships
        const response = await getMe()

        if (response.error || !response.data) {
          console.error("Failed to fetch user data:", response.error)
          return
        }

        const currentUser = response.data
        let relatedUsers: User[] = []

        // Filter users based on the current user's role
        if (currentUser.roles?.includes("student")) {
          // Students can message their tutors and parents
          if (currentUser.tutors) {
            relatedUsers = [
              ...relatedUsers,
              ...currentUser.tutors.map((tutor: any) => ({
                ...tutor,
                role: "tutor",
              })),
            ]
          }
          if (currentUser.parents) {
            relatedUsers = [
              ...relatedUsers,
              ...currentUser.parents.map((parent: any) => ({
                ...parent,
                role: "parent",
              })),
            ]
          }
        } else if (currentUser.roles?.includes("parent")) {
          // Parents can message their children and their children's tutors
          if (currentUser.children) {
            relatedUsers = [
              ...relatedUsers,
              ...currentUser.children.map((child: any) => ({
                ...child,
                role: "student",
              })),
            ]

            // Add tutors of children if available
            for (const child of currentUser.children) {
              if (child.tutors) {
                relatedUsers = [
                  ...relatedUsers,
                  ...child.tutors.map((tutor: any) => ({
                    ...tutor,
                    role: "tutor",
                  })),
                ]
              }
            }
          }
        } else if (currentUser.roles?.includes("tutor")) {
          // Tutors can message their students and their students' parents
          if (currentUser.students) {
            relatedUsers = [
              ...relatedUsers,
              ...currentUser.students.map((student: any) => ({
                ...student,
                role: "student",
              })),
            ]

            // Add parents of students if available
            for (const student of currentUser.students) {
              if (student.parents) {
                relatedUsers = [
                  ...relatedUsers,
                  ...student.parents.map((parent: any) => ({
                    ...parent,
                    role: "parent",
                  })),
                ]
              }
            }
          }
        } else if (currentUser.roles?.includes("admin")) {
          // Admins can message anyone
          // This would require a separate API call to get all users
          // For now, we'll just show a placeholder
          relatedUsers = [
            { id: "admin-placeholder", name: "Please use the admin panel to message users", email: "", role: "info" },
          ]
        }

        // Remove duplicates by ID
        const uniqueUsers = Array.from(new Map(relatedUsers.map((user) => [user.id, user])).values())

        setAvailableUsers(uniqueUsers)
      } catch (error) {
        console.error("Error fetching related users:", error)
        toast({
          title: "Error",
          description: "Failed to load contacts. Please try again.",
          variant: "destructive",
        })
      }
    }

    if (isOpen) {
      fetchRelatedUsers()
    }
  }, [isOpen])

  const handleCreateConversation = async () => {
    if (!selectedParticipant) {
      toast({
        title: "Error",
        description: "Please select a participant for the conversation.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Find the selected user to get their name for the conversation title
      const selectedUser = availableUsers.find((user) => user.id === selectedParticipant)

      // Generate a friendly name if not provided
      const conversationName = friendlyName || (selectedUser ? `Chat with ${selectedUser.name}` : `New Conversation`)

      await createTwilioConversation({
        participants: [selectedParticipant],
        friendlyName: conversationName,
      })

      toast({
        title: "Success",
        description: "Conversation created successfully!",
      })

      setIsOpen(false)
      setFriendlyName("")
      setSelectedParticipant("")
      onConversationCreated()
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast({
        title: "Error",
        description: "Failed to create conversation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mb-4">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Conversation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Conversation</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="participant">Select Participant</Label>
            <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
              <SelectTrigger>
                <SelectValue placeholder="Select a person to chat with" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.length > 0 ? (
                  availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} {user.role ? `(${user.role})` : ""}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-contacts" disabled>
                    No contacts available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Conversation Name (Optional)</Label>
            <Input
              id="name"
              placeholder="Enter a name for this conversation"
              value={friendlyName}
              onChange={(e) => setFriendlyName(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleCreateConversation} disabled={isLoading || !selectedParticipant}>
            {isLoading ? "Creating..." : "Create Conversation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
