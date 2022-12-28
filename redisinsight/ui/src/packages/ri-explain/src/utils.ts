export const truncateText = (str = '', length = 100) => {
  const ending = '...'

  if (str.length > length) {
    return str.substring(0, length - ending.length) + ending
  }

  return str
}

function charCodeSum(str: string | undefined) {
  if (str === undefined) return 0
  let sum = 0
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i)
  }
  return sum
}

export function invertColor(hex: string) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1)
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.')
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16)
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b)
}

function padZero(str) {
    let len = str.length || 2
    var zeros = new Array(len).join('0')
    return (zeros + str).slice(-len)
}


export function wrapText(s: string, w: number) {
  return s.replace(
    new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'),
    '$1\n'
  )
}


export function commandIsSuccess(resp: [{ response: any, status: string }]) {
  return Array.isArray(resp) && resp.length >= 1 || resp[0].status === 'success'
}
