export const bufferFormatRangeItems = (
  items: any[], startIndex: number, lastIndex: number, formatItem: (item: any) => any,
): any[] => {
  const newItems = []
  if (lastIndex >= startIndex) {
    for (let index = startIndex; index <= lastIndex; index++) {
      if (!items[index]) return newItems
      newItems.push(formatItem(items[index]))
    }
  }

  return newItems
}

export const convertTimestampToMilliseconds = (value: string): number => {
  // seconds, microseconds, nanoseconds to milliseconds
  switch (parseInt(value, 10).toString().length) {
    case 10:
      return +value * 1000
    case 16:
      return +value / 1000
    case 19:
      return +value / 1000000
    default:
      return +value
  }
}
