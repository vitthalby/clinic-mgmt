"use client"

import { useState, useCallback } from "react"
import { ActionResult } from "@/lib/errors"

/**
 * Custom hook for managing server action state
 * 
 * Provides consistent handling of:
 * - Loading states
 * - Error messages
 * - Success callbacks
 * 
 * @example
 * const { execute, isLoading, error, clearError } = useActionState()
 * 
 * const handleSubmit = async () => {
 *   const result = await execute(createUser(data))
 *   if (result?.success) {
 *     // Handle success
 *   }
 * }
 */
export function useActionState<T = void>() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (
      action: Promise<ActionResult<T>>,
      options?: {
        onSuccess?: (data: T) => void
        onError?: (error: string) => void
      }
    ): Promise<ActionResult<T> | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await action

        if (result.success) {
          options?.onSuccess?.(result.data)
        } else {
          setError(result.error)
          options?.onError?.(result.error)
        }

        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
        setError(errorMessage)
        options?.onError?.(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    execute,
    isLoading,
    error,
    clearError,
    setError,
  }
}

/**
 * Simple loading state hook
 */
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState)

  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      setIsLoading(true)
      try {
        return await fn()
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { isLoading, setIsLoading, withLoading }
}
