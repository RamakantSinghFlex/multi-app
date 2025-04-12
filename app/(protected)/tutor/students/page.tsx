"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, MoreHorizontal, MessageSquare, Columns, ArrowUpDown } from "lucide-react"
import Link from "next/link"

export default function TutorStudentsPage() {
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState("")

    // Get students directly from the user object
    const students = user?.students || []

    const filteredStudents = students.filter(
        (student) =>
            student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold md:text-3xl">Students</h1>
                        <p className="text-muted-foreground">Manage your students</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button asChild>
                            <Link href="/tutor/students/new">
                                <Plus className="mr-2 h-4 w-4"/>
                                Add New
                            </Link>
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="students" className="space-y-4">
                    <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                        <TabsList>
                            <TabsTrigger value="students">Students</TabsTrigger>
                            <TabsTrigger value="group-tags">Group Tags</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center space-x-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    type="search"
                                    placeholder="Search..."
                                    className="w-full pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Columns className="h-4 w-4"/>
                                        <span className="sr-only">Columns</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Show All Columns</DropdownMenuItem>
                                    <DropdownMenuItem>Student</DropdownMenuItem>
                                    <DropdownMenuItem>Student Contact</DropdownMenuItem>
                                    <DropdownMenuItem>Family</DropdownMenuItem>
                                    <DropdownMenuItem>Notes</DropdownMenuItem>
                                    <DropdownMenuItem>Group Tags</DropdownMenuItem>
                                    <DropdownMenuItem>Tutors</DropdownMenuItem>
                                    <DropdownMenuItem>Next Lesson</DropdownMenuItem>
                                    <DropdownMenuItem>Make-Up Credits</DropdownMenuItem>
                                    <DropdownMenuItem>Age</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <ArrowUpDown className="h-4 w-4"/>
                                        <span className="sr-only">Sort</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Sort by Name (A-Z)</DropdownMenuItem>
                                    <DropdownMenuItem>Sort by Name (Z-A)</DropdownMenuItem>
                                    <DropdownMenuItem>Sort by Date Added (Newest)</DropdownMenuItem>
                                    <DropdownMenuItem>Sort by Date Added (Oldest)</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <MessageSquare className="h-4 w-4"/>
                                        <span className="sr-only">Messaging</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Message Selected</DropdownMenuItem>
                                    <DropdownMenuItem>Message All</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <TabsContent value="students" className="space-y-4">
                        <Card>
                            <CardContent className="p-0">
                                <div className="flex items-center p-4">
                                    <Badge variant="outline" className="mr-2">
                                        {filteredStudents.length} Active
                                    </Badge>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <Checkbox/>
                                            </TableHead>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Student Contact</TableHead>
                                            <TableHead>Family</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead>Group Tags</TableHead>
                                            <TableHead>Tutors</TableHead>
                                            <TableHead>Next Lesson</TableHead>
                                            <TableHead>Make-Up Credits</TableHead>
                                            <TableHead>Age</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStudents.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={11} className="text-center py-10">
                                                    No students found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredStudents.map((student) => (
                                                <TableRow key={student.id}>
                                                    <TableCell>
                                                        <Checkbox/>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <div
                                                                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                                {student.firstName?.charAt(0) || student.email?.charAt(0) || "S"}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {
                                                                        student.firstName && student.lastName
                                                                            ? `${student.firstName} ${student.lastName}`
                                                                            : student.firstName || student.lastName || "Unnamed Student"
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Active
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{student.email || "-"}</TableCell>
                                                    <TableCell>
                                                        {student.parents
                                                            ?.map((parent) => (typeof parent === "object" ? parent.email : "-"))
                                                            .join(", ") || "-"}
                                                    </TableCell>
                                                    <TableCell>-</TableCell>
                                                    <TableCell>-</TableCell>
                                                    <TableCell>
                                                        {student.tutors
                                                            ?.map((tutor) => (typeof tutor === "object" ? tutor.email : "-"))
                                                            .join(", ") || "-"}
                                                    </TableCell>
                                                    <TableCell>-</TableCell>
                                                    <TableCell>Total: 0, Available: 0, Booked: 0</TableCell>
                                                    <TableCell>-</TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal className="h-4 w-4"/>
                                                                    <span className="sr-only">Actions</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/tutor/students/${student.id}`}>View
                                                                        Profile</Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link
                                                                        href={`/tutor/students/${student.id}/edit`}>Edit</Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>Message</DropdownMenuItem>
                                                                <DropdownMenuItem>Book Session</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                                <div className="flex items-center justify-between p-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {filteredStudents.length} of {students.length} students
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm" disabled>
                                            Previous
                                        </Button>
                                        <Button variant="outline" size="sm" className="px-4">
                                            1

                                        </Button>
                                        <Button variant="outline" size="sm" disabled>
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="group-tags">
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-10">
                                <p>No group tags created yet.</p>
                                <Button className="mt-4">
                                    <Plus className="mr-2 h-4 w-4"/>
                                    Create Group Tag
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
