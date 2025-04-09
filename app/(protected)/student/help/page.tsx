// Fix the student help page that has incomplete code
"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Search, Send, HelpCircle, MessageSquare, FileText, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function StudentHelpPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    setSending(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Success
      setSent(true)
      setMessage("")

      toast({
        title: "Success",
        description: "Your message has been sent. We'll get back to you soon.",
        variant: "default",
      })

      // Reset sent status after 3 seconds
      setTimeout(() => {
        setSent(false)
      }, 3000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Help & Support</h1>
        <p className="text-muted-foreground">Get help with your account and learning</p>
      </div>

      <div className="relative w-full">
        <form onSubmit={handleSearch}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search help articles..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <Tabs defaultValue="faq" className="space-y-4">
        <TabsList>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">How do I schedule a session with a tutor?</h3>
                <p className="text-sm text-muted-foreground">
                  You can schedule a session by going to the Appointments page and clicking on "Book Appointment".
                  Select your preferred tutor, date, and time to schedule your session.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">How do I cancel or reschedule a session?</h3>
                <p className="text-sm text-muted-foreground">
                  You can cancel or reschedule a session from the Appointments page. Find your appointment and click
                  "Cancel" or "Reschedule". Please note that cancellations made less than 24 hours before the session
                  may incur a fee.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">How do I access my learning materials?</h3>
                <p className="text-sm text-muted-foreground">
                  All your learning materials are available in the Materials section. You can filter by subject or
                  search for specific content. Materials shared by your tutors will appear here automatically.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">How do I track my progress?</h3>
                <p className="text-sm text-muted-foreground">
                  Your progress is tracked automatically and can be viewed in the Progress section. You'll see
                  statistics on completed sessions, achievements, and improvement in different subjects.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">How do I message my tutor?</h3>
                <p className="text-sm text-muted-foreground">
                  You can message your tutor through the Messages section. Select your tutor from the conversation list
                  or start a new conversation. All communication is securely stored in our system.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Send us a message and we'll get back to you as soon as possible</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Message</h3>
                  <Textarea
                    placeholder="Describe your issue or question in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    disabled={sending || sent}
                  />
                </div>

                <Button type="submit" disabled={sending || sent}>
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : sent ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Sent!
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guides & Tutorials</CardTitle>
              <CardDescription>Learn how to use the platform effectively</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="flex items-start p-4">
                    <HelpCircle className="mr-3 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Getting Started Guide</h3>
                      <p className="text-sm text-muted-foreground">Learn the basics of using the platform</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start p-4">
                    <MessageSquare className="mr-3 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Messaging Tutorial</h3>
                      <p className="text-sm text-muted-foreground">How to communicate with tutors effectively</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start p-4">
                    <FileText className="mr-3 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Uploading Documents</h3>
                      <p className="text-sm text-muted-foreground">How to share your work with tutors</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start p-4">
                    <HelpCircle className="mr-3 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Virtual Session Guide</h3>
                      <p className="text-sm text-muted-foreground">How to prepare for and join virtual sessions</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
