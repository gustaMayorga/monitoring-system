import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "bg-primary text-primary-foreground hover:bg-primary/80": variant === "default",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          "bg-destructive text-destructive-foreground hover:bg-destructive/80": variant === "destructive",
          "bg-green-100 text-green-800 hover:bg-green-200": variant === "success",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }