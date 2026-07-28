import { firstQueryValue } from '../helpers/query.js'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD

export function parseDate(raw, field) {
  const value = firstQueryValue(raw)

  if (value == null || value === '') {
    return field.defaultValue
  }

  const formatted = formatDate(value)

  return formatted ?? field.defaultValue
}

export function serializeDate(value) {
  return formatDate(value)
}

function formatDate(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null
    }

    return value.toISOString().slice(0, 10)
  }

  const stringValue = String(value)

  if (!DATE_PATTERN.test(stringValue)) {
    return null
  }

  const date = new Date(`${stringValue}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString().slice(0, 10) === stringValue ? stringValue : null
}
