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

export function buffersEqual(buf1: Buffer, buf2: Buffer): boolean {
  if (buf1.byteLength !== buf2.byteLength) return false
  const dv1 = new Int8Array(buf1)
  const dv2 = new Int8Array(buf2)
  for (let i = 0; i !== buf1.byteLength; i++) {
    if (dv1[i] !== dv2[i]) return false
  }
  return true
}
