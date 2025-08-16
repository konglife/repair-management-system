'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        router.push('/dashboard')
      } else {
        router.push('/sign-in')
      }
    }
  }, [isLoaded, isSignedIn, router])

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show redirecting state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {isSignedIn ? 'Redirecting to dashboard...' : 'Redirecting to sign in...'}
        </p>
      </div>
    </div>
  )
}