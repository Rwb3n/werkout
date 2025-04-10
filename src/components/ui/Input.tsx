import React from 'react';
import { cn } from "@/lib/utils"

// Remove empty interface - directly type props inline or create a meaningful interface
// export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<
  HTMLInputElement, 
  React.InputHTMLAttributes<HTMLInputElement> // Use the type directly
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      // TODO: Add styles for different states (e.g., error, disabled)
      // Consider using cva if variants (e.g., sizes) are needed
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input } 