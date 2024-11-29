// src/components/ui/alert.tsx
import { forwardRef } from 'react'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive'
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border p-4 [&>svg+div]:translate-y-[-3px] 
        [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground 
        [&>svg~*]:pl-7 ${
          variant === 'default' ? 'bg-background text-foreground' : ''
        } ${
          variant === 'destructive' ? 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive' : ''
        } ${className}`}
        {...props}
      />
    )
  }
)
Alert.displayName = "Alert"

export { Alert }