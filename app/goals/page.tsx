import { redirect } from "next/navigation"

export default function GoalsRoute() {
  redirect("/benchmarks?tab=goals")
}

