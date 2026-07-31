import { describe, expect, it } from 'vitest'

import { parseArray, serializeArray } from '../src/codecs/array.js'
import { parseBoolean, serializeBoolean } from '../src/codecs/boolean.js'
import { parseDate, serializeDate } from '../src/codecs/date.js'
import { getCodec } from '../src/codecs/index.js'
import { parseNumber, serializeNumber } from '../src/codecs/number.js'
import { parseString, serializeString } from '../src/codecs/string.js'

describe('codecs', () => {
  it('reads string defaults and first array values', () => {
    expect(parseString(undefined, { defaultValue: '' })).toBe('')
    expect(parseString('', { defaultValue: 'fallback' })).toBe('fallback')
    expect(parseString(['first', 'second'], { defaultValue: '' })).toBe('first')
    expect(serializeString('hello')).toBe('hello')
  })

  it('validates allowed string values', () => {
    const field = {
      defaultValue: 'newest',
      allowedValues: ['newest', 'oldest'],
    }

    expect(parseString('oldest', field)).toBe('oldest')
    expect(parseString('invalid', field)).toBe('newest')
  })

  it('reads valid and invalid numbers', () => {
    expect(parseNumber('12', { defaultValue: 1 })).toBe(12)
    expect(parseNumber('0', { defaultValue: 1 })).toBe(0)
    expect(parseNumber('abc', { defaultValue: 1 })).toBe(1)
    expect(parseNumber('NaN', { defaultValue: 1 })).toBe(1)
    expect(parseNumber('-1', { defaultValue: 1, positive: true })).toBe(1)
    expect(parseNumber('2.5', { defaultValue: 1, integer: true })).toBe(1)
    expect(parseNumber('2', { defaultValue: 1, integer: true })).toBe(2)
    expect(serializeNumber(2.5)).toBe('2.5')
    expect(serializeNumber(2.5, { integer: true })).toBeNull()
    expect(serializeNumber(2, { integer: true })).toBe('2')
  })

  it('reads boolean values and defaults', () => {
    expect(parseBoolean('1', { defaultValue: false })).toBe(true)
    expect(parseBoolean('0', { defaultValue: true })).toBe(false)
    expect(parseBoolean('true', { defaultValue: false })).toBe(true)
    expect(parseBoolean('false', { defaultValue: true })).toBe(false)
    expect(parseBoolean(undefined, { defaultValue: true })).toBe(true)
    expect(parseBoolean(undefined, { defaultValue: false })).toBe(false)
    expect(serializeBoolean(true)).toBe('true')
    expect(serializeBoolean(false)).toBe('false')
  })

  it('supports custom boolean serialization values', () => {
    const field = {
      defaultValue: false,
      trueValue: '1',
      falseValue: '0',
    }

    expect(parseBoolean('true', field)).toBe(true)
    expect(parseBoolean('false', field)).toBe(false)
    expect(parseBoolean('1', field)).toBe(true)
    expect(parseBoolean('0', field)).toBe(false)
    expect(parseBoolean('yes', field)).toBe(false)
    expect(serializeBoolean(true, field)).toBe('1')
    expect(serializeBoolean(false, field)).toBe('0')
  })

  it('reads and writes YYYY-MM-DD dates', () => {
    expect(parseDate('2026-07-28', { defaultValue: null })).toBe('2026-07-28')
    expect(
      parseDate(['2026-07-28', '2026-07-29'], { defaultValue: null }),
    ).toBe('2026-07-28')
    expect(parseDate('2026-02-31', { defaultValue: '2026-01-01' })).toBe(
      '2026-01-01',
    )
    expect(parseDate('today', { defaultValue: null })).toBeNull()
    expect(parseDate(undefined, { defaultValue: '2026-01-01' })).toBe(
      '2026-01-01',
    )
    expect(serializeDate('2026-07-28')).toBe('2026-07-28')
    expect(serializeDate(new Date('2026-07-28T12:30:00.000Z'))).toBe(
      '2026-07-28',
    )
    expect(serializeDate('2026-99-99')).toBeNull()
    expect(serializeDate(new Date('invalid'))).toBeNull()
  })

  it('reads and writes string arrays', () => {
    expect(parseArray(['one', 'two'], { defaultValue: [] })).toEqual([
      'one',
      'two',
    ])
    expect(parseArray('one,two', { defaultValue: [] })).toEqual(['one', 'two'])
    expect(parseArray(['one,two', 'three'], { defaultValue: [] })).toEqual([
      'one',
      'two',
      'three',
    ])
    expect(parseArray('one, two,', { defaultValue: [] })).toEqual([
      'one',
      'two',
    ])
    expect(parseArray('', { defaultValue: ['default'] })).toEqual(['default'])
    expect(parseArray(undefined, { defaultValue: [] })).toEqual([])
    expect(serializeArray(['one', 'two'])).toEqual(['one', 'two'])
    expect(serializeArray([])).toBeNull()
  })

  it('throws for unknown types', () => {
    expect(() => getCodec('object')).toThrow(
      'Unsupported URL state type: object',
    )
  })
})
