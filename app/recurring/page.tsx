// Update the recurring route to redirect to the transactions page with the recurring tab active
import { redirect } from "next/navigation"

export default function RecurringRoute() {
  redirect("/transactions?view=recurring")
}

