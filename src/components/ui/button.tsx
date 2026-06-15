"use client"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
          className={cn(
            "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
            {
              "bg-primary text-white hover:bg-primary-dark focus:ring-primary": variant === "primary",
              "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary": variant === "secondary",
              "bg-success text-white hover:bg-success/80 focus:ring-success": variant === "success",
              "bg-danger text-white hover:bg-danger/80 focus:ring-danger": variant === "danger",
              "bg-transparent text-foreground hover:bg-hover": variant === "ghost",
              "px-3 py-1.5 text-sm": size === "sm",
              "px-4 py-2 text-sm": size === "md",
              "px-6 py-3 text-base": size === "lg",
            },
            className
          )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
