"use client"

import { ReactNode } from "react"
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react"

export type AlertVariant = "error" | "success" | "warning" | "info"

interface AlertProps {
  variant: AlertVariant
  title?: string
  children: ReactNode
  onDismiss?: () => void
  className?: string
}

const variantStyles: Record<AlertVariant, { container: string; icon: ReactNode }> = {
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
  },
  success: {
    container: "bg-green-50 border-green-200 text-green-800",
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-800",
    icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    icon: <Info className="h-5 w-5 text-blue-500" />,
  },
}

/**
 * Reusable Alert component for displaying messages
 * 
 * @example
 * <Alert variant="error" title="Error">
 *   Something went wrong. Please try again.
 * </Alert>
 * 
 * @example
 * <Alert variant="success" onDismiss={() => setShow(false)}>
 *   Operation completed successfully!
 * </Alert>
 */
export function Alert({ variant, title, children, onDismiss, className = "" }: AlertProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${styles.container} ${className}`}
      role="alert"
    >
      <div className="flex-shrink-0">{styles.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-medium mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

/**
 * Hook-friendly error display for action results
 */
interface ActionErrorProps {
  error: string | null
  onDismiss?: () => void
  className?: string
}

export function ActionError({ error, onDismiss, className = "" }: ActionErrorProps) {
  if (!error) return null

  return (
    <Alert variant="error" onDismiss={onDismiss} className={className}>
      {error}
    </Alert>
  )
}

/**
 * Inline form field error
 */
interface FieldErrorProps {
  error?: string
}

export function FieldError({ error }: FieldErrorProps) {
  if (!error) return null

  return <p className="mt-1 text-sm text-red-600">{error}</p>
}
