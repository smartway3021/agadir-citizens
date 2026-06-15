import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger"
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        {
          "bg-primary/10 text-primary border border-primary/20": variant === "default",
          "bg-accent/10 text-accent border border-accent/20": variant === "success",
          "bg-gold/10 text-gold border border-gold/20": variant === "warning",
          "bg-danger/10 text-danger border border-danger/20": variant === "danger",
        },
        className
      )}
    >
      {children}
    </span>
  )
}
