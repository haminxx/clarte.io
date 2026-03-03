"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type EyeIconProps = {
  className?: string
  title?: string
}

export function EyelashEyeOpen({ className, title }: EyeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      className={cn("h-5 w-5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      {/* Eye outline */}
      <path d="M2.2 12s3.6-6.6 9.8-6.6S21.8 12 21.8 12 18.2 18.6 12 18.6 2.2 12 2.2 12Z" />
      {/* Iris */}
      <circle cx="12" cy="12" r="2.3" />
      {/* Upper lashes */}
      <path d="M7.2 6.4 6.2 5.2" />
      <path d="M12 5.2V3.9" />
      <path d="M16.8 6.4 17.8 5.2" />
    </svg>
  )
}

export function EyelashEyeClosed({ className, title }: EyeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      className={cn("h-5 w-5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      {/* Closed lid */}
      <path d="M4 12c2.8 3.2 5.7 4.8 8 4.8s5.2-1.6 8-4.8" />
      {/* Lash strokes */}
      <path d="M7 9.2 6 8.1" />
      <path d="M12 8.6V7.1" />
      <path d="M17 9.2 18 8.1" />
    </svg>
  )
}

