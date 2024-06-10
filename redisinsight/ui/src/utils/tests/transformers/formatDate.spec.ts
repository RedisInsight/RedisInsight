import { secondsToMinutes } from 'uiSrc/utils'

const secondsToMinutesTests: any[] = [
  [0, '0 seconds'],
  [1, '1 second'],
  [25, '25 seconds'],
  [60, '1 minute'],
  [65, '1 minute'],
  [120, '2 minutes'],
  [1300, '21 minutes'],
]

describe('secondsToMinutes', () => {
  it.each(secondsToMinutesTests)('should be output: %s, for value: $s',
    (input, output) => {
      const result = secondsToMinutes(input)
      expect(result).toBe(output)
    })
})
