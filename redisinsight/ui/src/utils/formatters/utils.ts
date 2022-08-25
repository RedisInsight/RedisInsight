export const bufferFormatRangeItems = (
  items: any[], startIndex: number, lastIndex: number, formatItem: (item: any) => any,
) => {
  const newItems = [...items]
  if (lastIndex > startIndex) {
    for (let index = startIndex; index <= lastIndex; index++) {
      if (!newItems[index]) return newItems
      newItems[index] = formatItem(newItems[index], index)
    }
  }

  return newItems
}

export const replaceBigIntWithString = (obj: Object) => JSON.parse(JSON.stringify(obj, (_, value) => (
  typeof value === 'bigint'
    ? value.toString()
    : value)))
