import { readFieldValue } from './create-field.js'

export function resolveValues(
  route,
  fields,
  orderedFields,
  query = route.query,
) {
  const values = {}

  for (const name of orderedFields) {
    const field = fields[name]
    const context = {
      field: name,
      values,
      query,
      route,
    }
    const value = isFieldEnabled(field, context)
      ? readFieldValue(query, field)
      : field.defaultValue

    values[name] = cloneValue(value)
  }

  return values
}

export function isFieldEnabled(field, context) {
  if (typeof field.enabledWhen !== 'function') {
    return true
  }

  return Boolean(field.enabledWhen(context))
}

export function cloneValue(value) {
  return Array.isArray(value) ? [...value] : value
}
