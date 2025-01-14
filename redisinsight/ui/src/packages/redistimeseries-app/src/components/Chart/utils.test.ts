import { hexToRGBA } from './utils'

const hexToRGBATests: [string, string][] = [
  ['#fbafff', 'rgb(251, 175, 255)'],
  ['#af087b', 'rgb(175, 8, 123)'],
  ['#0088ff', 'rgb(0, 136, 255)'],
  ['#123456', 'rgb(18, 52, 86)'],
  ['#FF0000', 'rgb(255, 0, 0)'],
  ['#345465', 'rgb(52, 84, 101)'],
]

describe('hexToRGBA', () => {
  it.each(hexToRGBATests)(
    'for input hex: %s, should be output: %s',
    (hex, expected) => {
      const result = hexToRGBA(hex, 0)
      expect(result).toBe(expected)
    },
  )
})
