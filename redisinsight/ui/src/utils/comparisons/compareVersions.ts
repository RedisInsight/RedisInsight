export const isVersionHigherOrEquals = (
  sourceVersion: string = '',
  comparableVersion: string = '',
) => {
  const sourceVersionArray = sourceVersion.split('.')
  const comparableVersionArray = comparableVersion.split('.')

  for (
    let i = 0;
    i <=
    Math.max(sourceVersionArray.length - 1, comparableVersionArray.length - 1);
    i++
  ) {
    const n1 = parseInt(sourceVersionArray[i] || '0')
    const n2 = parseInt(comparableVersionArray[i] || '0')

    if (n1 > n2) return true
    if (n2 > n1) return false
  }

  return true
}

export const isVersionHigher = (
  sourceVersion: string = '',
  comparableVersion: string = '',
) => {
  const sourceVersionArray = sourceVersion.split('.')
  const comparableVersionArray = comparableVersion.split('.')

  for (
    let i = 0;
    i <=
    Math.max(sourceVersionArray.length - 1, comparableVersionArray.length - 1);
    i++
  ) {
    const n1 = parseInt(sourceVersionArray[i] || '0')
    const n2 = parseInt(comparableVersionArray[i] || '0')

    if (n1 > n2) return true
    if (n2 > n1) return false
  }

  return false
}
