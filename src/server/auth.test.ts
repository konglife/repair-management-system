import { getAuth, requireAuth } from './auth'
import { auth } from '@clerk/nextjs/server'

// Mock Clerk's auth function
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

const mockedAuth = auth as jest.MockedFunction<typeof auth>

// Helper to create mock auth objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockAuth = (overrides: Record<string, unknown> = {}): any => ({
  userId: null,
  sessionId: null,
  actor: undefined,
  orgId: null,
  orgRole: null,
  orgSlug: null,
  orgPermissions: null,
  sessionClaims: null,
  sessionStatus: null,
  tokenType: 'non-existent' as const,
  factorVerificationAge: null,
  getToken: jest.fn(),
  has: jest.fn(),
  redirectToSignIn: jest.fn(),
  redirectToSignUp: jest.fn(),
  debug: jest.fn(),
  isAuthenticated: false,
  ...overrides,
})

describe('Authentication utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAuth', () => {
    it('should return null values when user is not authenticated', async () => {
      mockedAuth.mockResolvedValue(createMockAuth())

      const result = await getAuth()

      expect(result).toEqual({
        user: null,
        userId: null,
      })
    })

    it('should return userId when user is authenticated', async () => {
      const testUserId = 'user_test123'
      mockedAuth.mockResolvedValue(createMockAuth({
        userId: testUserId,
        sessionId: 'session_test',
        sessionStatus: null,
        tokenType: 'signed-in',
        isAuthenticated: true,
      }))

      const result = await getAuth()

      expect(result).toEqual({
        user: null,
        userId: testUserId,
      })
    })
  })

  describe('requireAuth', () => {
    it('should throw error when user is not authenticated', async () => {
      mockedAuth.mockResolvedValue(createMockAuth())

      await expect(requireAuth()).rejects.toThrow('Unauthorized')
    })

    it('should return userId when user is authenticated', async () => {
      const testUserId = 'user_test123'
      mockedAuth.mockResolvedValue(createMockAuth({
        userId: testUserId,
        sessionId: 'session_test',
        sessionStatus: null,
        tokenType: 'signed-in',
        isAuthenticated: true,
      }))

      const result = await requireAuth()

      expect(result).toEqual({
        user: null,
        userId: testUserId,
      })
    })
  })
})