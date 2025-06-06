import { cn } from "@/lib/utils"

export function TinCanLogo({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary ml-2", className)}
    >
      {/* Can body with ridges */}
      <path d="M6 4H18V20H6V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Horizontal ridges */}
      <path d="M6 8H18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M6 12H18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M6 16H18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />

      {/* Top lid */}
      <ellipse cx="12" cy="4" rx="6" ry="1.5" stroke="currentColor" strokeWidth="2" />

      {/* Bottom lid */}
      <ellipse cx="12" cy="20" rx="6" ry="1.5" stroke="currentColor" strokeWidth="2" />

      {/* Modern pull tab */}
      <path d="M10 4C10 4 10 2 12 2C14 2 14 4 14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

