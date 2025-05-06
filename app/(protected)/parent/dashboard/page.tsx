"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  ChevronLeft,
  X,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react"
import Image from "next/image"

export default function ParentDashboardPage() {
  const [currentMonth] = useState("March")
  const [selectedDay, setSelectedDay] = useState(17)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"]
  const [showPaymentBanner, setShowPaymentBanner] = useState(true)

  // Current date is day 17
  const today = 17

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="grid grid-cols-3 gap-6">
        {/* Left and center content */}
        <div className="col-span-2 space-y-6">
          {/* Payment Due */}
          {showPaymentBanner && (
            <div className="bg-[#E5E5E5] rounded-lg p-4 relative">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-medium text-xl text-[#333333]">
                    Payment Due
                  </h2>
                  <p className="text-[#777777] mt-1">
                    Your Payment is Approaching.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-[#0B4A3F] text-white hover:bg-[#0B4A3F]/90 rounded-full px-8 mr-16"
                >
                  Pay Now
                </Button>
              </div>
              <button
                className="absolute top-2 right-2 text-[#999999] hover:text-[#666666]"
                onClick={() => setShowPaymentBanner(false)}
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Progress Tracking */}
          <Card className="border border-[#efefef]">
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium">Otis&apos;s Progress</h2>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">This Week</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm">Last Week</span>
                </div>
                <Button variant="outline" size="sm" className="gap-1 ml-2">
                  Week <ChevronRight size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[150px] relative mb-2">
                {/* This would be a real chart in production */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded"></div>
                <svg viewBox="0 0 600 150" className="w-full h-full">
                  <path
                    d="M0,100 C50,60 100,120 150,90 C200,60 250,110 300,80 C350,60 400,90 450,70 C500,50 550,80 600,50"
                    fill="none"
                    stroke="#095d40"
                    strokeWidth="2"
                  />
                  <circle cx="0" cy="100" r="3" fill="#095d40" />
                  <circle cx="150" cy="90" r="3" fill="#095d40" />
                  <circle cx="300" cy="80" r="3" fill="#095d40" />
                  <circle cx="450" cy="70" r="3" fill="#095d40" />
                  <circle cx="600" cy="50" r="3" fill="#095d40" />
                </svg>

                <div className="flex justify-between text-xs text-muted-foreground absolute bottom-0 w-full">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                  <div>Sun</div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-primary">32%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Week</p>
                  <p className="text-2xl font-bold text-muted-foreground">
                    24%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Notes */}
          <Card className="border border-[#efefef]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Session Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2 font-medium text-sm text-muted-foreground w-24">
                        Date
                      </th>
                      <th className="pb-2 font-medium text-sm text-muted-foreground">
                        Note Summary
                      </th>
                      <th className="pb-2 font-medium text-sm text-muted-foreground w-28">
                        Tutor
                      </th>
                      <th className="pb-2 font-medium text-sm text-muted-foreground w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 text-sm">04-Mar</td>
                      <td className="py-3 text-sm">
                        The student demonstrated strengths in basic algebraic
                        operations, grasping the concept of equal operations in
                        equations.
                      </td>
                      <td className="py-3 text-sm">Mark Jason</td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-primary hover:text-primary hover:bg-secondary"
                        >
                          Open <ArrowUpRight size={14} className="ml-1" />
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 text-sm">02-Mar</td>
                      <td className="py-3 text-sm">
                        The student demonstrated strengths in basic algebraic
                        operations, grasping the concept of equal operations in
                        equations...
                      </td>
                      <td className="py-3 text-sm">Mark Jason</td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-primary hover:text-primary hover:bg-secondary"
                        >
                          Open <ArrowUpRight size={14} className="ml-1" />
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sm">02-Mar</td>
                      <td className="py-3 text-sm">
                        The student demonstrated strengths in basic algebraic
                        operations, grasping the concept of equal operations in
                        equations...
                      </td>
                      <td className="py-3 text-sm">Mark Jason</td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-primary hover:text-primary hover:bg-secondary"
                        >
                          Open <ArrowUpRight size={14} className="ml-1" />
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4 text-sm text-muted-foreground"
              >
                Load more
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar content */}
        <div className="space-y-6">
          {/* Calendar */}
          <Card className="border border-[#efefef]">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <h3 className="font-medium">{currentMonth}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {weekDays.map((day, i) => (
                  <div
                    key={i}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {days.map((day) => (
                  <button
                    key={day}
                    className={`flex items-center justify-center h-8 w-8 rounded-full text-sm
                      ${day === selectedDay ? "bg-primary text-white" : "hover:bg-muted"}
                      ${day === today && day !== selectedDay ? "border border-primary" : ""}
                    `}
                    onClick={() => setSelectedDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="font-medium text-sm mb-3">
                  Today&apos;s lessons
                </h3>

                {/* Math Class */}
                <div className="mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-xs font-medium w-12 text-right pt-1">
                      4:30 PM
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">
                        Otis&apos;s Math Class
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        with Mr. Will
                      </p>
                    </div>
                  </div>
                </div>

                {/* Science Class */}
                <div className="mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-xs font-medium w-12 text-right pt-1">
                      6:30 PM
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">
                        Otis&apos;s Social Science Class
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        with Ms. Jen
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tests */}
          <Card className="border border-[#efefef]">
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <CardTitle className="text-lg font-medium">
                Upcoming Test
              </CardTitle>
              <Button
                size="sm"
                className="bg-primary text-white hover:bg-primary/90"
              >
                Schedule Session
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Geometry Test */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center bg-muted h-14 w-14 rounded text-xs">
                  <span className="uppercase text-muted-foreground text-[10px]">
                    APR
                  </span>
                  <span className="text-lg font-bold">15</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Geometry</h4>
                  <p className="text-xs text-muted-foreground">
                    8th Standard | Group B
                  </p>
                </div>
                <div className="text-xs text-right">
                  <p>1:00 PM - 1:30 PM</p>
                </div>
              </div>

              {/* Algebra Test */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center bg-muted h-14 w-14 rounded text-xs">
                  <span className="uppercase text-muted-foreground text-[10px]">
                    MAY
                  </span>
                  <span className="text-lg font-bold">05</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Algebra</h4>
                  <p className="text-xs text-muted-foreground">
                    8th Standard | Group B
                  </p>
                </div>
                <div className="text-xs text-right">
                  <p>1:00 PM - 1:30 PM</p>
                </div>
              </div>

              {/* Physics Test */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center bg-muted h-14 w-14 rounded text-xs">
                  <span className="uppercase text-muted-foreground text-[10px]">
                    MAY
                  </span>
                  <span className="text-lg font-bold">20</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Physics</h4>
                  <p className="text-xs text-muted-foreground">
                    8th Standard | Group B
                  </p>
                </div>
                <div className="text-xs text-right">
                  <p>1:00 PM - 1:30 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Tutors */}
          <Card className="border border-[#efefef]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Current Tutor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Mark Jason */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=40&width=40&text=MJ"
                      alt="Mark Jason"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">Mark Jason</h4>
                      <span className="rounded-full px-2 py-0.5 text-xs bg-[#e3fae3] text-[#095d40]">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Subject: Math
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-[#f1f1f1] pt-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Completed Session
                    </p>
                    <p className="text-sm font-medium">2</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Upcoming Session
                    </p>
                    <p className="text-sm font-medium">1</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs flex items-center gap-1"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Schedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs flex items-center gap-1"
                  >
                    <MessageCircle size={14} />
                    Message
                  </Button>
                </div>
              </div>

              {/* Devon */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=40&width=40&text=D"
                      alt="Devon"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">Devon</h4>
                      <span className="rounded-full px-2 py-0.5 text-xs bg-[#f1f1f1] text-[#858585]">
                        Closed
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Subject: Chemistry
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-[#f1f1f1] pt-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Completed Session
                    </p>
                    <p className="text-sm font-medium">5</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Upcoming Session
                    </p>
                    <p className="text-sm font-medium">0</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs flex items-center gap-1"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Schedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs flex items-center gap-1"
                  >
                    <MessageCircle size={14} />
                    Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
