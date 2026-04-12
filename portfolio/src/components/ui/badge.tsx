import * as React from "react"

const badgeVariants = {
  default: "border-transparent bg-slate-900 text-white hover:bg-slate-800",
  secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
  destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
  outline: "text-slate-900 border-slate-200",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  return (
    <div 
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${badgeVariants[variant]} ${className}`} 
      {...props} 
    />
  )
}

export { Badge }