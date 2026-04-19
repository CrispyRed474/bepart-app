import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullPage?: boolean
}

export function LoadingSpinner({ size = 'md', className, fullPage }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  }

  const spinner = (
    <div className={cn(
      'rounded-full border-gray-200 border-t-blue-600 animate-spin',
      sizes[size],
      className
    )} />
  )

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {spinner}
      </div>
    )
  }

  return spinner
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center flex-1 min-h-[200px]">
      <LoadingSpinner size="lg" />
    </div>
  )
}
