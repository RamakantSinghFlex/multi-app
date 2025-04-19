"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function ParentDashboardPage() {
  const { user } = useAuth()
  const [currentMonth] = useState("March 2025")

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-[#efefef]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total School Subject</p>
                <h3 className="text-2xl font-bold">10</h3>
              </div>
              <div className="rounded-full bg-[#e3fae3] p-3 text-[#095d40]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[#095d40] text-sm">
              <span>View Details</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#efefef]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                <h3 className="text-2xl font-bold">07</h3>
              </div>
              <div className="rounded-full bg-[#e3fae3] p-3 text-[#095d40]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[#095d40] text-sm">
              <span>View Details</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#efefef]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Document Uploaded</p>
                <h3 className="text-2xl font-bold">05</h3>
              </div>
              <div className="rounded-full bg-[#e3fae3] p-3 text-[#095d40]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[#095d40] text-sm">
              <span>View Details</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Overview */}
        <Card className="lg:col-span-2 border border-[#efefef]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Otis's Progress Overview</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Current Semester</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f1f1" strokeWidth="10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#095d40"
                      strokeWidth="10"
                      strokeDasharray="283"
                      strokeDashoffset="170"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">20</span>
                    <span className="text-xs text-muted-foreground">completed</span>
                  </div>
                </div>
                <h3 className="mt-2 font-medium text-sm">School Assignment</h3>
                <p className="text-xs text-muted-foreground">40 remaining</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f1f1" strokeWidth="10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#095d40"
                      strokeWidth="10"
                      strokeDasharray="283"
                      strokeDashoffset="240"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">5</span>
                    <span className="text-xs text-muted-foreground">completed</span>
                  </div>
                </div>
                <h3 className="mt-2 font-medium text-sm">Test Prep</h3>
                <p className="text-xs text-muted-foreground">20 remaining</p>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center border-t border-[#efefef] pt-4">
              <div className="flex items-center text-[#095d40] text-sm">
                <span>View all assignments</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </div>

              <Button variant="outline" size="sm" className="border-[#d9d9d9] text-[#000000] hover:bg-[#f4f4f4]">
                <Plus className="mr-2 h-3 w-3" />
                Add Another Student
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="border border-[#efefef]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">{currentMonth}</h3>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} className="text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {[13, 14, 15, 16, 17, 18, 19].map((day, i) => (
                <button
                  key={i}
                  className={`flex items-center justify-center h-8 w-8 rounded-full text-sm
                    ${day === 17 ? "bg-[#095d40] text-white" : "hover:bg-[#f4f4f4]"}
                  `}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-sm mb-2">Today</h3>
              <div className="flex items-start space-x-4 py-2">
                <div className="text-xs font-medium w-16 text-right">04:30 PM</div>
                <div>
                  <h4 className="text-sm font-medium">Otis's Match Class</h4>
                  <p className="text-xs text-muted-foreground">with Mr. Will</p>
                </div>
              </div>

              <h3 className="font-medium text-sm mt-4 mb-2">Fri, Mar 18</h3>
              <div className="flex items-start space-x-4 py-2">
                <div className="text-xs font-medium w-16 text-right">04:30 PM</div>
                <div>
                  <h4 className="text-sm font-medium">Otis's Match Class</h4>
                  <p className="text-xs text-muted-foreground">with Mr. Will</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 py-2">
                <div className="text-xs font-medium w-16 text-right">10:30 AM</div>
                <div>
                  <h4 className="text-sm font-medium">Otis's Essay Submission</h4>
                  <p className="text-xs text-muted-foreground">at school</p>
                </div>
              </div>
            </div>

            <Button className="w-full mt-4 bg-[#095d40] text-white hover:bg-[#02342e]">Book A Session</Button>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tests */}
      <Card className="border border-[#efefef]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Upcoming Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex flex-col items-center justify-center bg-[#f4f4f4] h-12 w-12 rounded">
                <span className="text-xs uppercase text-muted-foreground">APR</span>
                <span className="text-lg font-bold">15</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Geometry</h4>
                <p className="text-xs text-muted-foreground">8th Standard | Group B</p>
              </div>
              <div className="text-xs text-muted-foreground">1:00 PM to 1:30 PM</div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex flex-col items-center justify-center bg-[#f4f4f4] h-12 w-12 rounded">
                <span className="text-xs uppercase text-muted-foreground">MAY</span>
                <span className="text-lg font-bold">05</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Algebra</h4>
                <p className="text-xs text-muted-foreground">8th Standard | Group B</p>
              </div>
              <div className="text-xs text-muted-foreground">1:00 PM to 1:30 PM</div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex flex-col items-center justify-center bg-[#f4f4f4] h-12 w-12 rounded">
                <span className="text-xs uppercase text-muted-foreground">MAY</span>
                <span className="text-lg font-bold">20</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Physics</h4>
                <p className="text-xs text-muted-foreground">8th Standard | Group B</p>
              </div>
              <div className="text-xs text-muted-foreground">1:00 PM to 1:30 PM</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Notes */}
      <Card className="border border-[#efefef]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Session Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="bg-[#f4f4f4] text-xs font-medium text-muted-foreground">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Note Summary</th>
                <th className="p-2 text-left">Tutor</th>
                <th className="p-2 text-left"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-[#f1f1f1]">
                <td className="p-2">04-Mar</td>
                <td className="p-2">
                  The student demonstrated strengths in basic algebraic operations, grasping the concept of equal
                  operations in equations, recalling triangle...
                </td>
                <td className="p-2">Mark Jason</td>
                <td className="p-2">
                  <div className="flex items-center text-xs text-[#095d40]">
                    <span>View Details</span>
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-2">02-Mar</td>
                <td className="p-2">
                  The student demonstrated strengths in basic algebraic operations, grasping the concept of equal
                  operations in equations...
                </td>
                <td className="p-2">Mark Jason</td>
                <td className="p-2">
                  <div className="flex items-center text-xs text-[#095d40]">
                    <span>View Details</span>
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <Button variant="outline" className="mt-4 w-full text-xs text-muted-foreground hover:bg-[#f4f4f4]">
            Load more
          </Button>
        </CardContent>
      </Card>

      {/* Current Tutors */}
      <Card className="border border-[#efefef]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Current Tutor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Mark Jason */}
            <Card className="border border-[#efefef]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#f4f4f4] flex items-center justify-center text-[#095d40] font-medium">
                    MJ
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">Mark Jason</h4>
                      <span className="rounded-full px-2 py-0.5 text-xs bg-[#e3fae3] text-[#095d40]">Active</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Subject: Math</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#f1f1f1] pt-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Completed Session</p>
                    <p className="text-sm font-medium">2</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Upcoming Session</p>
                    <p className="text-sm font-medium">1</p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-1"
                    >
                      <rect x="1.5" y="2" width="9" height="8" rx="1" stroke="#858585" strokeWidth="1" />
                      <path d="M3.5 1.5V2.5" stroke="#858585" strokeWidth="1" strokeLinecap="round" />
                      <path d="M8.5 1.5V2.5" stroke="#858585" strokeWidth="1" strokeLinecap="round" />
                      <path d="M1.5 4.5H10.5" stroke="#858585" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Devon */}
            <Card className="border border-[#efefef]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#f4f4f4] flex items-center justify-center text-[#095d40] font-medium">
                    D
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">Devon</h4>
                      <span className="rounded-full px-2 py-0.5 text-xs bg-[#f1f1f1] text-[#858585]">Closed</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Subject: Chemistry</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#f1f1f1] pt-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Completed Session</p>
                    <p className="text-sm font-medium">5</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Upcoming Session</p>
                    <p className="text-sm font-medium">0</p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-1"
                    >
                      <rect x="1.5" y="2" width="9" height="8" rx="1" stroke="#858585" strokeWidth="1" />
                      <path d="M3.5 1.5V2.5" stroke="#858585" strokeWidth="1" strokeLinecap="round" />
                      <path d="M8.5 1.5V2.5" stroke="#858585" strokeWidth="1" strokeLinecap="round" />
                      <path d="M1.5 4.5H10.5" stroke="#858585" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
