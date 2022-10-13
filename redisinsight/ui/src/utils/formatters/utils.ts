export const bufferFormatRangeItems = (
  items: any[], startIndex: number, lastIndex: number, formatItem: (item: any) => any,
): any[] => {
  const newItems = []
  if (lastIndex >= startIndex) {
    for (let index = startIndex; index <= lastIndex; index++) {
      if (!items[index]) return [startIndex, newItems]
      newItems.push(formatItem(items[index]))
    }
  }

  return newItems
}

export const replaceBigIntWithString = (obj: Object) => JSON.parse(JSON.stringify(obj, (_, value) => (
  typeof value === 'bigint'
    ? value.toString()
    : value)))
