interface ErrorAlertProps {
  message: string
  onRetry?: () => void
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-red-800">Something went wrong</p>
        <p className="text-sm text-red-600 mt-0.5">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 text-sm font-medium text-red-700 hover:text-red-900 underline"
        >
          Retry
        </button>
      )}
    </div>
  )
}
