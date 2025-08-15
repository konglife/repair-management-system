// Mock PrismaClient to avoid database connection during tests
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}))

import { db } from './db'

describe('Database connection', () => {
  it('exports database client', () => {
    expect(db).toBeDefined()
    expect(typeof db).toBe('object')
  })
  
  it('has PrismaClient methods', () => {
    expect(db.$connect).toBeDefined()
    expect(db.$disconnect).toBeDefined()
    expect(typeof db.$connect).toBe('function')
    expect(typeof db.$disconnect).toBe('function')
  })
})