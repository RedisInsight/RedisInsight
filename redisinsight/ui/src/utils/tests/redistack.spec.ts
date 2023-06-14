/* eslint-disable max-len */
import { isRediStack } from 'uiSrc/utils'

const unmapWithName = (arr: any[]) => arr.map((item) => ({ name: item }))

const isRediStackTests = [
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight', 'graph', 'custom']), '6.2.6'], expected: false },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'search', 'graph', 'custom']), '6.2.6'], expected: false },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight', 'graph']), '6.2.6'], expected: true },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight', 'graph'])], expected: true },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight', 'graph']), null], expected: true },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'search']), null], expected: false },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'rg', 'search'])], expected: false },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'search', 'graph']), '6.2.6'], expected: true },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight', 'graph']), '6.2.5'], expected: false },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'search', 'graph']), '6.2.5'], expected: false },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight', 'graph']), '7.2'], expected: false },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'search', 'graph']), '7.2'], expected: false },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'rg', 'searchlight']), '7.2'], expected: true },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'rg', 'search']), '7.2'], expected: true },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight']), '7.2'], expected: true },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'search']), '7.2'], expected: true },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'search']), '7.2'], expected: true },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'search', 'custom']), '7.2'], expected: false },
  { input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'seasearchlightrch', 'custom']), '7.2'], expected: false },
]

describe('isRediStack', () => {
  test.each(isRediStackTests)(
    '%j',
    ({ input, expected }) => {
      // @ts-ignore
      const result = isRediStack(...input)
      expect(result).toEqual(expected)
    }
  )
})
