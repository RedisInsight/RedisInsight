export type DataType = 'HASH' | 'JSON'

export type VectorAlgorithm = 'FLAT' | 'HNSW'
export type VectorType = 'FLOAT32' | 'FLOAT64'
export type VectorDistance = 'L2' | 'IP' | 'COSINE'

export type BaseField = {
  name: string
  as?: string
}

export type TextField = BaseField & {
  type: 'TEXT'
  nostem?: boolean
  unf?: boolean
  sortable?: boolean
}

export type NumericField = BaseField & {
  type: 'NUMERIC'
  sortable?: boolean
}

export type TagField = BaseField & {
  type: 'TAG'
  separator?: string
  sortable?: boolean
}

export type VectorField = BaseField & {
  type: 'VECTOR'
  algorithm: VectorAlgorithm
  vectorType: VectorType
  dim: number
  distance: VectorDistance
  initialCap?: number
  blockSize?: number
  m?: number
  efConstruction?: number
}

export type SchemaField = TextField | NumericField | TagField | VectorField

export type CreateIndexOptions = {
  indexName: string
  dataType: DataType
  prefixes?: string[]
  schema: SchemaField[]
  stopwords?: string[] // optional
}
