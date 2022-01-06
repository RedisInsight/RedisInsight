import { getFormatTime } from '../monitorUtils'

const getOutputForFormatTime: any[] = [
  ['1641450853.668074', '09:34:13.668'],
  ['1641450854.612083', '09:34:14.612'],
  ['1641450856.616102', '09:34:16.616'],
  ['1641450858.616121', '09:34:18.616'],
]

describe.skip('formatToText', () => {
  it.each(getOutputForFormatTime)('for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = getFormatTime(reply)
      expect(result).toBe(expected)
    })
})
