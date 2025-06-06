import type React from "react"
import type { Metadata } from "next"
import ClientAppLayout from "./ClientAppLayout"

export const metadata: Metadata = {
  title: "TinTin",
  description: "Manage your finances with TinTin",
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientAppLayout>{children}</ClientAppLayout>
}

