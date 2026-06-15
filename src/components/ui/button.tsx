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
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          {
            "bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm hover:shadow-md hover:from-primary-dark hover:to-primary focus:ring-primary/50": variant === "primary",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary/50 shadow-sm": variant === "secondary",
            "bg-gradient-to-r from-accent to-accent-light text-white hover:from-accent-light hover:to-accent focus:ring-accent/50 shadow-sm": variant === "success",
            "bg-gradient-to-r from-danger to-primary-dark text-white hover:from-primary-dark hover:to-danger focus:ring-danger/50 shadow-sm": variant === "danger",
            "bg-transparent text-foreground hover:bg-hover": variant === "ghost",
            "px-3 py-1.5 text-xs": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-sm": size === "lg",
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
