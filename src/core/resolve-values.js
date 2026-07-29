import { readFieldValue } from './create-field.js'
import { areGroupsEnabled, groupsForField } from './groups.js'

export function resolveValues(
  route,
  fields,
  orderedFields,
  query = route.query,
  groups = [],
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
    const value = isFieldEnabled(field, context, groupsForField(groups, name))
      ? readFieldValue(query, field)
      : field.defaultValue

    values[name] = cloneValue(value)
  }

  return values
}

export function isFieldEnabled(field, context, groups = []) {
  if (typeof field.enabledWhen !== 'function') {
    return areGroupsEnabled(groups, context)
  }

  return (
    Boolean(field.enabledWhen(context)) && areGroupsEnabled(groups, context)
  )
}

export function cloneValue(value) {
  return Array.isArray(value) ? [...value] : value
}
