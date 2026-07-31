import { firstQueryValue } from '../helpers/query.js'

export function parseNumber(raw, field) {
  const value = firstQueryValue(raw)

  if (value == null || value === '') {
    return field.defaultValue
  }

  const number = Number(value)

  if (!isValidNumber(number, field)) {
    return field.defaultValue
  }

  if (field.allowedValues && !field.allowedValues.includes(number)) {
    return field.defaultValue
  }

  return number
}

export function serializeNumber(value, field = {}) {
  const number = Number(value)

  if (!isValidNumber(number, field)) {
    return null
  }

  return String(number)
}

function isValidNumber(number, field) {
  if (!Number.isFinite(number)) {
    return false
  }

  if (field.integer && !Number.isInteger(number)) {
    return false
  }

  if (field.positive && number <= 0) {
    return false
  }

  return true
}
