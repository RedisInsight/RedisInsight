import { CreateIndexOptions, SchemaField } from './types'

function formatVectorField(
  field: Extract<SchemaField, { type: 'VECTOR' }>,
): string[] {
  const parts = [
    `VECTOR "${field.algorithm}"`,
    `"TYPE" ${field.vectorType}`,
    `"DIM" ${field.dim}`,
    `"DISTANCE_METRIC" "${field.distance}"`,
  ]

  if (field.initialCap !== undefined)
    parts.push(`"INITIAL_CAP" ${field.initialCap}`)
  if (field.blockSize !== undefined)
    parts.push(`"BLOCK_SIZE" ${field.blockSize}`)
  if (field.m !== undefined) parts.push(`"M" ${field.m}`)
  if (field.efConstruction !== undefined)
    parts.push(`"EF_CONSTRUCTION" ${field.efConstruction}`)

  return parts
}

function formatSchemaField(
  field: SchemaField,
  dataType: 'HASH' | 'JSON',
): string {
  const parts: string[] = []

  const fieldRef = dataType === 'JSON' ? `$.${field.name}` : `"${field.name}"`
  parts.push(fieldRef)

  if (field.as) parts.push(`AS ${field.as}`)

  switch (field.type) {
    case 'TEXT':
      parts.push('TEXT')
      if (field.nostem) parts.push('NOSTEM')
      if (field.unf) parts.push('UNF')
      if (field.sortable) parts.push('SORTABLE')
      break
    case 'NUMERIC':
      parts.push('NUMERIC')
      if (field.sortable) parts.push('SORTABLE')
      break
    case 'TAG':
      parts.push('TAG')
      if (field.separator) parts.push(`SEPARATOR "${field.separator}"`)
      if (field.sortable) parts.push('SORTABLE')
      break
    case 'VECTOR': {
      const aliasPart = field.as ? ` AS ${field.as}` : ''
      const vectorPart = formatVectorField(field).join(' ')
      return `${fieldRef}${aliasPart} ${vectorPart}`
    }
    default:
      throw new Error(`Unsupported field type: ${(field as any).type}`)
  }

  return parts.join(' ')
}

export function generateFtCreateCommand(options: CreateIndexOptions): string {
  const { indexName, dataType, prefixes = [], schema, stopwords } = options

  const lines: string[] = [`FT.CREATE ${indexName}`, `ON ${dataType}`]

  if (prefixes.length > 0) {
    const quotedPrefixes = prefixes.map((p) => `"${p}"`).join(' ')
    lines.push(`PREFIX ${prefixes.length} ${quotedPrefixes}`)
  }

  lines.push('SCHEMA')

  schema.forEach((field) => {
    lines.push(formatSchemaField(field, dataType))
  })

  if (stopwords) {
    if (stopwords.length === 0) {
      lines.push('STOPWORDS 0')
    } else {
      const quotedStopwords = stopwords.map((sw) => `"${sw}"`).join(' ')
      lines.push(`STOPWORDS ${stopwords.length} ${quotedStopwords}`)
    }
  }

  return lines.join('\n')
}
