import { firstQueryValue } from '../helpers/query.js'

const DEFAULT_TRUE_VALUE = 'true'
const DEFAULT_FALSE_VALUE = 'false'

export function parseBoolean(raw, field) {
  const value = firstQueryValue(raw)

  if (value == null) {
    return field.defaultValue
  }

  const stringValue = String(value)
  const trueValue = field.trueValue ?? DEFAULT_TRUE_VALUE
  const falseValue = field.falseValue ?? DEFAULT_FALSE_VALUE

  if (
    stringValue === trueValue ||
    stringValue === '1' ||
    stringValue === 'true'
  ) {
    return true
  }

  if (
    stringValue === falseValue ||
    stringValue === '0' ||
    stringValue === 'false'
  ) {
    return false
  }

  return field.defaultValue
}

export function serializeBoolean(value, field = {}) {
  return value
    ? (field.trueValue ?? DEFAULT_TRUE_VALUE)
    : (field.falseValue ?? DEFAULT_FALSE_VALUE)
}
