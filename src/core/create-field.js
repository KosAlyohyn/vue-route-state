import { computed } from 'vue'

import { getCodec } from '../codecs/index.js'
import { valueEquals } from '../helpers/equality.js'

export function readField(route, field) {
  return readFieldValue(route.query, field)
}

export function readFieldValue(query, field) {
  const codec = getCodec(field.type)
  const raw = readRawValue(query, field)

  return codec.parse(raw, field)
}

export function hasFieldQueryValue(route, field) {
  return [field.key, ...field.aliases].some((key) =>
    Object.prototype.hasOwnProperty.call(route.query, key),
  )
}

export function serializeFieldValue(field, value) {
  if (value === null) {
    return null
  }

  const codec = getCodec(field.type)
  const serialized = codec.serialize(value, field)

  if (serialized == null) {
    return null
  }

  if (field.omitDefault && valueEquals(value, field.defaultValue)) {
    return null
  }

  return serialized
}

export function createField(route, updateQuery, field, resolveValue) {
  getCodec(field.type)

  return computed({
    get() {
      return resolveValue ? resolveValue() : readField(route, field)
    },
    set(value) {
      updateQuery({
        [field.name]: value,
      })
    },
  })
}

function readRawValue(query, field) {
  if (Object.prototype.hasOwnProperty.call(query, field.key)) {
    return query[field.key]
  }

  for (const alias of field.aliases) {
    if (Object.prototype.hasOwnProperty.call(query, alias)) {
      return query[alias]
    }
  }

  return undefined
}
