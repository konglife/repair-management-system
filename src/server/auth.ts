import { auth } from '@clerk/nextjs/server'
import type { User } from '@clerk/nextjs/server'

export interface AuthContext {
  user: User | null
  userId: string | null
}

export async function getAuth(): Promise<AuthContext> {
  const { userId } = await auth()
  
  if (!userId) {
    return {
      user: null,
      userId: null
    }
  }

  // Note: We'll add user data fetching when needed
  // For now, we'll just return the userId
  return {
    user: null, // Will be populated when needed
    userId
  }
}

export async function requireAuth(): Promise<AuthContext & { userId: string }> {
  const authData = await auth()
  
  if (!authData.userId) {
    throw new Error("Unauthorized")
  }

  return {
    user: null, // Will be populated when needed
    userId: authData.userId
  }
}