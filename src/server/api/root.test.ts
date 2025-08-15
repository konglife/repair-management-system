// Mock external dependencies
jest.mock('superjson', () => ({
  default: {
    stringify: jest.fn(),
    parse: jest.fn(),
  },
}))

jest.mock('~/lib/db', () => ({
  db: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}))

import { appRouter } from './root'
import type { AppRouter } from './root'

describe('tRPC Router', () => {
  it('creates router without errors', () => {
    expect(appRouter).toBeDefined()
    expect(typeof appRouter).toBe('object')
  })
  
  it('has proper router structure', () => {
    expect(appRouter._def).toBeDefined()
    expect(appRouter._def.record).toBeDefined()
  })
  
  it('exports AppRouter type correctly', () => {
    // This test ensures the type export works correctly for client-side usage
    // If this compiles without error, the type export is working
    const typeCheck: AppRouter = appRouter
    expect(typeCheck).toBeDefined()
  })
})