import { getAuth, requireAuth } from './auth'
import { auth } from '@clerk/nextjs/server'

// Mock Clerk's auth function
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

const mockedAuth = auth as jest.MockedFunction<typeof auth>

describe('Authentication utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAuth', () => {
    it('should return null values when user is not authenticated', async () => {
      mockedAuth.mockResolvedValue({
        userId: null,
        sessionId: null,
        actor: null,
        orgId: null,
        orgRole: null,
        orgSlug: null,
        orgPermissions: null,
        sessionClaims: null,
        has: jest.fn(),
      })

      const result = await getAuth()

      expect(result).toEqual({
        user: null,
        userId: null,
      })
    })

    it('should return userId when user is authenticated', async () => {
      const testUserId = 'user_test123'
      mockedAuth.mockResolvedValue({
        userId: testUserId,
        sessionId: 'session_test',
        actor: null,
        orgId: null,
        orgRole: null,
        orgSlug: null,
        orgPermissions: null,
        sessionClaims: null,
        has: jest.fn(),
      })

      const result = await getAuth()

      expect(result).toEqual({
        user: null,
        userId: testUserId,
      })
    })
  })

  describe('requireAuth', () => {
    it('should throw error when user is not authenticated', async () => {
      mockedAuth.mockResolvedValue({
        userId: null,
        sessionId: null,
        actor: null,
        orgId: null,
        orgRole: null,
        orgSlug: null,
        orgPermissions: null,
        sessionClaims: null,
        has: jest.fn(),
      })

      await expect(requireAuth()).rejects.toThrow('Unauthorized')
    })

    it('should return userId when user is authenticated', async () => {
      const testUserId = 'user_test123'
      mockedAuth.mockResolvedValue({
        userId: testUserId,
        sessionId: 'session_test',
        actor: null,
        orgId: null,
        orgRole: null,
        orgSlug: null,
        orgPermissions: null,
        sessionClaims: null,
        has: jest.fn(),
      })

      const result = await requireAuth()

      expect(result).toEqual({
        user: null,
        userId: testUserId,
      })
    })
  })
})