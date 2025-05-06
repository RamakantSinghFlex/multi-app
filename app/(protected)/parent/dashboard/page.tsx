"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronRight, ChevronLeft, X, ArrowUpRight } from "lucide-react"
import Image from "next/image"
import scheduleIcon from "@/public/card/schedule.svg"
import chatIcon from "@/public/card/chat.svg"

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
                          className="h-7 text-primary hover:text-primary hover:bg-secondary border border-primary rounded-full"
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
                          className="h-7 text-primary hover:text-primary hover:bg-secondary border border-primary rounded-full"
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
                          className="h-7 text-primary hover:text-primary hover:bg-secondary border border-primary rounded-full"
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
                    <div className="text-xs font-medium w-12 pt-1 text-center">
                      4:30 PM
                    </div>
                    <div className="mx-3 h-full">
                      <Separator
                        orientation="vertical"
                        className="h-full min-h-[40px]"
                      />
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
                    <div className="text-xs font-medium w-12 pt-1 text-center">
                      6:30 PM
                    </div>
                    <div className="mx-3 h-full">
                      <Separator
                        orientation="vertical"
                        className="h-full min-h-[40px]"
                      />
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
                className="bg-[#0B4A3F] text-white hover:bg-[#0B4A3F]/90 rounded-full px-6"
              >
                Schedule Session
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Geometry Test */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex flex-col items-center justify-center bg-[#E5E5E5] h-16 w-16 rounded-lg text-center overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-black rounded-t-lg"></div>
                    <span className="text-xl font-bold mt-1">15</span>
                    <span className="uppercase text-[#555555] text-xs">
                      APR
                    </span>
                  </div>
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

              <Separator className="border-dashed border-[#E5E5E5]" />

              {/* Algebra Test */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex flex-col items-center justify-center bg-[#E5E5E5] h-16 w-16 rounded-lg text-center overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-black rounded-t-lg"></div>
                    <span className="text-xl font-bold mt-1">05</span>
                    <span className="uppercase text-[#555555] text-xs">
                      MAY
                    </span>
                  </div>
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

              <Separator className="border-dashed border-[#E5E5E5]" />

              {/* Physics Test */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex flex-col items-center justify-center bg-[#E5E5E5] h-16 w-16 rounded-lg text-center overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-black rounded-t-lg"></div>
                    <span className="text-xl font-bold mt-1">20</span>
                    <span className="uppercase text-[#555555] text-xs">
                      MAY
                    </span>
                  </div>
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
                      <h4 className="text-xs font-medium">Mark Jason</h4>
                      <span className="rounded-full px-2 py-0.5 text-xs bg-[#e3fae3] text-[#095d40]">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Subject: Math
                    </p>
                  </div>

                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground rounded-full"
                    >
                      <Image
                        src={scheduleIcon}
                        alt="Schedule"
                        width={16}
                        height={16}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground rounded-full"
                    >
                      <Image src={chatIcon} alt="Chat" width={16} height={16} />
                    </Button>
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
                      <h4 className="text-xs font-medium">Devon</h4>
                      <span className="rounded-full px-2 py-0.5 text-xs bg-[#f1f1f1] text-[#858585]">
                        Closed
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Subject: Chemistry
                    </p>
                  </div>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground rounded-full"
                    >
                      <Image
                        src={scheduleIcon}
                        alt="Schedule"
                        width={16}
                        height={16}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground rounded-full"
                    >
                      <Image src={chatIcon} alt="Chat" width={16} height={16} />
                    </Button>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
