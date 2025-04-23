import { use } from "react"
import ParentAppointmentDetails from "@/components/parent/appointment-details"

export default function ParentAppointmentPage(props: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise using React.use()
  const params = use(props.params)

  return <ParentAppointmentDetails id={params.id} />
}
