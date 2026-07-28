import { parseArray, serializeArray } from './array.js'
import { parseBoolean, serializeBoolean } from './boolean.js'
import { parseDate, serializeDate } from './date.js'
import { parseNumber, serializeNumber } from './number.js'
import { parseString, serializeString } from './string.js'

const codecs = {
  array: {
    parse: parseArray,
    serialize: serializeArray,
  },
  boolean: {
    parse: parseBoolean,
    serialize: serializeBoolean,
  },
  date: {
    parse: parseDate,
    serialize: serializeDate,
  },
  number: {
    parse: parseNumber,
    serialize: serializeNumber,
  },
  string: {
    parse: parseString,
    serialize: serializeString,
  },
}

export function getCodec(type) {
  const codec = codecs[type]

  if (!codec) {
    throw new Error(`Unsupported URL state type: ${type}`)
  }

  return codec
}
