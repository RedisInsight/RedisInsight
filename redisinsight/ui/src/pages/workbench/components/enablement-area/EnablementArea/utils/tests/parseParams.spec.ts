import { parseParams } from '../parseParams'

const parseParamsTests: any[] = [
  ['[]', undefined],
  ['[execute=auto]', { execute: 'auto' }],
  ['[execute=auto;]', { execute: 'auto' }],
  ['[execute=auto;mode=group]', { execute: 'auto', mode: 'group' }],
  ['[execute=auto;mode=group;]', { execute: 'auto', mode: 'group' }],
  ['[execute=auto;  mode=group;   ]', { execute: 'auto', mode: 'group' }],
  ['[mode=raw;mode=ascii;mode=group;]', { mode: 'raw' }], // first parameters should be applied
  ['[mode=raw]\n', { mode: 'raw' }],
  ['[mode=raw]\r', { mode: 'raw' }],
]

describe('parseParams', () => {
  it.each(parseParamsTests)('for input: %s (params), should be output: %s',
    (params, expected) => {
      const result = parseParams(params)
      expect(result).toEqual(expected)
    })
})
