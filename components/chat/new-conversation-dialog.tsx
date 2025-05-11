"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createTwilioConversation } from "@/lib/api/twilio"
import { toast } from "@/components/ui/use-toast"

interface User {
  id: string
  firstName?: string
  lastName?: string
  email: string
  roles: string[]
}

interface NewConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConversationCreated: (conversationSid: string) => void
}

export function NewConversationDialog({ open, onOpenChange, onConversationCreated }: NewConversationDialogProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open])

  const fetchUsers = async () => {
    setIsLoadingUsers(true)
    try {
      // In a real implementation, you would fetch users from your API
      // For now, we'll use mock data
      const mockUsers: User[] = [
        {
          id: "user1",
          firstName: "John",
          lastName: "Smith",
          email: "john.smith@example.com",
          roles: ["tutor"],
        },
        {
          id: "user2",
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah.johnson@example.com",
          roles: ["tutor"],
        },
        {
          id: "user3",
          firstName: "Michael",
          lastName: "Brown",
          email: "michael.brown@example.com",
          roles: ["tutor"],
        },
      ]

      // Filter out the current user
      const filteredUsers = mockUsers.filter((u) => u.id !== user?.id)
      setUsers(filteredUsers)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleCreateConversation = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a participant for the conversation.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await createTwilioConversation([selectedUserId], title || undefined)

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
        return
      }

      if (response.data?.conversationSid) {
        toast({
          title: "Success",
          description: "Conversation created successfully.",
        })
        onConversationCreated(response.data.conversationSid)
        onOpenChange(false)
      }
    } catch (error) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Conversation Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Enter a title for this conversation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="participant">Select Participant</Label>
            {isLoadingUsers ? (
              <div className="flex h-10 items-center justify-center rounded-md border">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="participant">
                  <SelectValue placeholder="Select a participant" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateConversation} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Conversation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
