import { checkRediStack, REDISTACK_MODULES, REDISTACK_PORT } from 'uiSrc/utils'

const unmapWithName = (arr: any[]) => arr.map((item) => ({ name: item }))

const REDISTACK_MODULE_DEFAULT = unmapWithName(REDISTACK_MODULES)

const getOutputCheckRediStackTests: any[] = [
  [[{ port: REDISTACK_PORT, modules: REDISTACK_MODULE_DEFAULT }],
    [{ port: REDISTACK_PORT, modules: REDISTACK_MODULE_DEFAULT, isRediStack: true }]],
  [[{ port: REDISTACK_PORT, modules: unmapWithName(['']) }], [{ port: REDISTACK_PORT, modules: unmapWithName(['']), isRediStack: false }]],
  [[{ port: REDISTACK_PORT, modules: unmapWithName(['search']) }], [{ port: REDISTACK_PORT, modules: unmapWithName(['search']), isRediStack: false }]],
  [[{ port: REDISTACK_PORT, modules: unmapWithName(['bf', 'search', 'timeseries']) }], [{ port: REDISTACK_PORT, modules: unmapWithName(['bf', 'search', 'timeseries']), isRediStack: false }]],
  [[{ port: 12000, modules: REDISTACK_MODULE_DEFAULT }],
    [{ port: 12000, modules: REDISTACK_MODULE_DEFAULT, isRediStack: true }]],
  [[{ port: 12000, modules: unmapWithName(['search']) }], [{ port: 12000, modules: unmapWithName(['search']), isRediStack: false }]],
]

describe('checkRediStack', () => {
  it.each(getOutputCheckRediStackTests)('for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = checkRediStack(reply)
      expect(result).toStrictEqual(expected)
    })
})
