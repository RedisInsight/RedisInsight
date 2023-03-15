export const parseResponse = (response: string) => response.split(/\r?\n/).filter((r: string) => r).map((row: string) => {
  const value = row.split(' ')
  const obj: any = {}
  value.forEach((v: string) => {
    const pair = v.split('=')
    // eslint-disable-next-line prefer-destructuring
    obj[pair[0]] = pair[1]
  })
  return obj
})
