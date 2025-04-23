import { type NextRequest, NextResponse } from "next/server"
import { updateAppointment } from "@/lib/api/appointments"

export async function PUT(request: NextRequest, { params }: {params: {id: string}}) {
    try {
        const { id } = await params
        const appointmentId = id;
        const authHeader = request.headers.get("authorization") || ""

        if (!appointmentId) {
            return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
        }

        // Get payment data from request body
        const paymentData = await request.json()

        // Update the appointment with payment information
        const result = await updateAppointment({
            id: appointmentId,
            payment: paymentData,
        }, authHeader)

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 })
        }

        return NextResponse.json({ success: true, data: result.data }, { status: 200 })
    } catch (error) {
        console.error("Error updating appointment payment:", error)
        return NextResponse.json({ error: "Failed to update appointment payment" }, { status: 500 })
    }
}
