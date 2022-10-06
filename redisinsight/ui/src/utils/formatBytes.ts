const SIZES = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

export const formatBytes = (
  input: number,
  decimals: number = 3,
  splitResult: boolean = false
): string | [number, string] => {
  try {
    const bytes = parseFloat(String(input))
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    if (Number.isNaN(bytes) || bytes < 0) return '-'
    if (bytes === 0) return `0 ${SIZES[0]}`

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const sizeIndex = Math.min(i, SIZES.length - 1)

    const value = parseFloat((bytes / k ** sizeIndex).toFixed(dm))
    const size = SIZES[sizeIndex]

    return splitResult ? [value, size] : `${value} ${size}`
  } catch (e) {
    return '-'
  }
}

export const toBytes = (size: number, type: string): number | string => {
  const key = SIZES.indexOf(type.toUpperCase())

  if (typeof key !== 'boolean') {
    return Math.floor(size * 1024 ** key)
  }
  return '-'
}
