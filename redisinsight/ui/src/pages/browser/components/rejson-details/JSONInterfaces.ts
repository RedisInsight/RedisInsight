export type KeyType = string | number

export type JSONScalarValue = string | number | boolean | null

export type JSONObjectValue = JSONScalarValue | JSONScalarValue[]

export interface IJSONObject {
  [keyName: string]: JSONObjectValue | IJSONObject | IJSONObject[]
}

export type JSONArrayValue = IJSONObject | JSONObjectValue

export type JSONArray = JSONArrayValue[]

export interface IJSONDocument {
  key: string
  type: string
  cardinality?: number
  value: JSONScalarValue | JSONArrayValue | JSONArray | undefined | IJSONObject
}

export interface REJSONResponse {
  type: string
  downloaded: boolean
  data: JSONArray | IJSONDocument
}
