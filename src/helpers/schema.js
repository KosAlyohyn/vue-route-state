const RESERVED_FIELD_NAMES = [
  'patch',
  'clear',
  'reset',
  'snapshot',
  'values',
  'hasQueryValue',
]

export function normalizeSchema(schema) {
  const fields = {}

  for (const [name, options] of Object.entries(schema)) {
    assertAllowedFieldName(name)

    fields[name] = {
      ...options,
      name,
      key: options.key ?? name,
      aliases: options.aliases ?? [],
      omitDefault: options.omitDefault ?? true,
    }
  }

  return fields
}

function assertAllowedFieldName(name) {
  if (RESERVED_FIELD_NAMES.includes(name)) {
    throw new Error(
      `vue-route-state: "${name}" is a reserved URL state field name`,
    )
  }
}

export function orderFields(fields, order = []) {
  const fieldNames = Object.keys(fields)
  const knownFields = new Set(fieldNames)
  const prioritized = []
  const requestedOrder = Array.isArray(order) ? order : []

  for (const name of requestedOrder) {
    if (knownFields.has(name) && !prioritized.includes(name)) {
      prioritized.push(name)
    }
  }

  return [
    ...prioritized,
    ...fieldNames.filter((name) => !prioritized.includes(name)),
  ]
}

export function assertKnownFields(fields, values) {
  for (const name of Object.keys(values)) {
    if (!fields[name]) {
      throw new Error(`vue-route-state: Unknown URL state field: ${name}`)
    }
  }
}
