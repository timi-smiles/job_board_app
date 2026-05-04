import { cn } from '@/lib/utils'

const ringSize: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-8 h-8 border-[3px]',
  md: 'w-12 h-12 border-4',
  lg: 'w-16 h-16 border-4',
}

export function LoadingSpinner({
  size = 'lg',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'shrink-0 rounded-full animate-spin border-gray-200 border-t-blue-600',
        ringSize[size],
        className
      )}
    />
  )
}

type PageLoadingProps = {
  /** Default "Loading..."; empty string hides the label */
  message?: string | null
  /**
   * fullscreen: centered in full viewport.
   * section: centered in the content column (use inside dashboard `main` with `flex flex-col`).
   */
  variant?: 'fullscreen' | 'section'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PageLoading({
  message,
  variant = 'fullscreen',
  size = 'lg',
  className,
}: PageLoadingProps) {
  const label =
    message === null
      ? null
      : message === undefined || message === ''
        ? 'Loading...'
        : message
  const showLabel = label !== null && label.length > 0

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'fullscreen' && 'min-h-screen w-full bg-gray-50 px-4',
        variant === 'section' && 'flex-1 min-h-0 w-full px-4 py-8',
        className
      )}
    >
      <div className={cn('flex flex-col items-center gap-4', !showLabel && 'gap-0')}>
        <LoadingSpinner size={size} />
        {showLabel && (
          <p className={cn('text-gray-600 font-medium', size === 'sm' && 'text-sm')}>
            {label}
          </p>
        )}
      </div>
    </div>
  )
}
