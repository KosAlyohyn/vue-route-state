import { arrayQueryValue } from '../helpers/query.js'

const DEFAULT_INVALID_VALUES = 'filter'
const INVALID_VALUES_MODES = ['filter', 'default']

export function parseArray(raw, field) {
  const values = arrayQueryValue(raw)
    .flatMap((value) => String(value).split(','))
    .map((value) => value.trim())
    .filter((value) => value !== '')

  if (!values.length) {
    return field.defaultValue
  }

  if (!field.allowedValues) {
    return values
  }

  const filtered = values.filter((value) => field.allowedValues.includes(value))
  const invalidValues = normalizeInvalidValues(field.invalidValues)

  if (invalidValues === 'default' && filtered.length !== values.length) {
    return field.defaultValue
  }

  return filtered.length ? filtered : field.defaultValue
}

export function serializeArray(value, field = {}) {
  if (!Array.isArray(value) || value.length === 0) {
    return null
  }

  const values = value.map((item) => String(item)).filter((item) => item !== '')

  if (!values.length) {
    return null
  }

  if (!field.allowedValues) {
    return values
  }

  const filtered = values.filter((item) => field.allowedValues.includes(item))
  const invalidValues = normalizeInvalidValues(field.invalidValues)

  if (invalidValues === 'default' && filtered.length !== values.length) {
    return null
  }

  return filtered.length ? filtered : null
}

function normalizeInvalidValues(invalidValues) {
  const mode = invalidValues ?? DEFAULT_INVALID_VALUES

  if (!INVALID_VALUES_MODES.includes(mode)) {
    throw new Error(`vue-route-state: Unsupported array invalidValues mode: ${mode}`)
  }

  return mode
}
