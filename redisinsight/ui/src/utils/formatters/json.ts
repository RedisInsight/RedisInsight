import JSONBigInt from 'json-bigint'

export const reSerializeJSON = (val: string, space?: number) => {
  try {
    const json = JSONBigInt.parse(val)
    return JSONBigInt.stringify(json, null, space)
  } catch (e) {
    return val
  }
}
