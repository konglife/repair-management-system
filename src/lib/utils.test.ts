import { cn, formatCurrency } from './utils'

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('px-2 py-1', 'bg-red hover:bg-dark-red', 'px-2')).toBe(
      'py-1 bg-red hover:bg-dark-red px-2'
    )
  })
})

describe('formatCurrency', () => {
  it('should format positive numbers as Thai Baht', () => {
    expect(formatCurrency(1000)).toBe('฿1,000.00')
    expect(formatCurrency(1234.56)).toBe('฿1,234.56')
    expect(formatCurrency(0)).toBe('฿0.00')
  })

  it('should format negative numbers as Thai Baht', () => {
    expect(formatCurrency(-1000)).toBe('-฿1,000.00')
    expect(formatCurrency(-1234.56)).toBe('-฿1,234.56')
  })

  it('should handle decimal precision correctly', () => {
    expect(formatCurrency(1234.5)).toBe('฿1,234.50')
    expect(formatCurrency(1234.567)).toBe('฿1,234.57')
    expect(formatCurrency(1234)).toBe('฿1,234.00')
  })

  it('should handle large numbers with proper comma separation', () => {
    expect(formatCurrency(1000000)).toBe('฿1,000,000.00')
    expect(formatCurrency(1234567.89)).toBe('฿1,234,567.89')
  })

  it('should handle null and undefined values gracefully', () => {
    expect(formatCurrency(null)).toBe('฿0.00')
    expect(formatCurrency(undefined)).toBe('฿0.00')
  })

  it('should handle edge cases', () => {
    expect(formatCurrency(0.01)).toBe('฿0.01')
    expect(formatCurrency(0.99)).toBe('฿0.99')
    expect(formatCurrency(999.99)).toBe('฿999.99')
  })
})