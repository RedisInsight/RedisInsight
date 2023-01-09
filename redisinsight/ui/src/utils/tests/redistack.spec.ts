/* eslint-disable max-len */
import { checkRediStack, REDISTACK_PORT } from 'uiSrc/utils'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'

const unmapWithName = (arr: any[]) => arr.map((item) => ({ name: item }))

const REDISTACK_MODULE_DEFAULT = unmapWithName([
  RedisDefaultModules.ReJSON,
  RedisDefaultModules.Graph,
  RedisDefaultModules.TimeSeries,
  RedisDefaultModules.Search,
  RedisDefaultModules.Bloom,
].sort())

const getOutputCheckRediStackTests: any[] = [
  [
    [{ port: REDISTACK_PORT, modules: REDISTACK_MODULE_DEFAULT }, { port: 12000, modules: REDISTACK_MODULE_DEFAULT }],
    [{ port: REDISTACK_PORT, modules: REDISTACK_MODULE_DEFAULT, isRediStack: true }, { port: 12000, modules: REDISTACK_MODULE_DEFAULT, isRediStack: false }]
  ],
  [
    [{ port: REDISTACK_PORT, modules: REDISTACK_MODULE_DEFAULT }],
    [{ port: REDISTACK_PORT, modules: REDISTACK_MODULE_DEFAULT, isRediStack: true }]
  ],
  [
    [{ port: REDISTACK_PORT, modules: unmapWithName(['']) }],
    [{ port: REDISTACK_PORT, modules: unmapWithName(['']), isRediStack: false }]
  ],
  [
    [{ port: REDISTACK_PORT, modules: unmapWithName(['search']) }],
    [{ port: REDISTACK_PORT, modules: unmapWithName(['search']), isRediStack: false }]
  ],
  [
    [{ port: REDISTACK_PORT, modules: unmapWithName(['bf', 'search', 'timeseries']) }],
    [{ port: REDISTACK_PORT, modules: unmapWithName(['bf', 'search', 'timeseries']), isRediStack: false }]
  ],
  [
    [{ port: 12000, modules: REDISTACK_MODULE_DEFAULT }],
    [{ port: 12000, modules: REDISTACK_MODULE_DEFAULT, isRediStack: true }]
  ],
  [
    [{ port: 12000, modules: unmapWithName(['search']) }],
    [{ port: 12000, modules: unmapWithName(['search']), isRediStack: false }]
  ],
  // check searchlight - should be also marked as RediStack
  [
    [{ port: 12000, modules: unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight', 'graph']) }],
    [{ port: 12000, modules: unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight', 'graph']), isRediStack: true }]
  ],
  [
    [{ port: 12000, modules: [] }],
    [{ port: 12000, modules: [], isRediStack: false }]
  ],
  [
    [{ port: 12000, modules: unmapWithName(['ReJSON']) }],
    [{ port: 12000, modules: unmapWithName(['ReJSON']), isRediStack: false }]
  ],
  [
    [{ port: 12000, modules: unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight', 'graph', 'custom']) }],
    [{ port: 12000, modules: unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight', 'graph', 'custom']), isRediStack: false }]
  ],
]

describe('checkRediStack', () => {
  it.each(getOutputCheckRediStackTests)('for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = checkRediStack(reply)
      expect(result).toStrictEqual(expected)
    })
})
