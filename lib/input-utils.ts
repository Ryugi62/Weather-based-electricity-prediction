// Utility functions to handle daily input generation and manipulation

import { type DailyInput } from './prediction'

/**
 * Generate initial DailyInput objects for the next given number of days.
 */
export function createInitialInputs(days: number = 7): DailyInput[] {
  const today = new Date()
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index + 1)
    return {
      date: date.toISOString().split('T')[0],
      day: `+${index + 1}일차`,
      targetProduction: '',
    }
  })
}

/**
 * Apply a predefined pattern to daily input target generation values.
 * Returns a new array with the updated values.
 */
export function applyInputPattern(
  inputs: DailyInput[],
  pattern: 'weekday-weekend' | 'increasing' | 'decreasing',
): DailyInput[] {
  const baseValue = 1000
  return inputs.map((input, index) => {
    const date = new Date(input.date)
    const dayOfWeek = date.getDay()
    let target = input.targetProduction

    switch (pattern) {
      case 'weekday-weekend':
        target = dayOfWeek === 0 || dayOfWeek === 6 ? '800' : '1200'
        break
      case 'increasing':
        target = String(baseValue + index * 100)
        break
      case 'decreasing':
        target = String(baseValue + 600 - index * 100)
        break
    }

    return { ...input, targetProduction: target }
  })
}
