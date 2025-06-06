import { redirect } from "next/navigation"

export default function AdviceRoute() {
  redirect("/benchmarks?tab=advice")
}

