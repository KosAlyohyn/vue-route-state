export function parseCustom(raw, field) {
  assertCustomParser(field)

  return field.parse(raw, field)
}

export function serializeCustom(value, field) {
  assertCustomSerializer(field)

  return field.serialize(value, field)
}

function assertCustomParser(field) {
  if (typeof field.parse !== 'function') {
    throw new Error('Custom URL state fields require a parse function')
  }
}

function assertCustomSerializer(field) {
  if (typeof field.serialize !== 'function') {
    throw new Error('Custom URL state fields require a serialize function')
  }
}
