import { arrayQueryValue } from '../helpers/query.js'

export function parseArray(raw, field) {
  const values = arrayQueryValue(raw)
    .flatMap((value) => String(value).split(','))
    .map((value) => value.trim())
    .filter((value) => value !== '')

  if (!values.length) {
    return field.defaultValue
  }

  if (
    field.allowedValues &&
    values.some((value) => !field.allowedValues.includes(value))
  ) {
    return field.defaultValue
  }

  return values
}

export function serializeArray(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return null
  }

  return value.map((item) => String(item))
}
