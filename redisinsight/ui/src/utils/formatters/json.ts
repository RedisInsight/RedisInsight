export const reSerializeJSON = (val: string, space?: number) => {
  try {
    const json = JSON.parse(val)
    return JSON.stringify(json, null, space)
  } catch (e) {
    return val
  }
}
