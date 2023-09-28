import { getDiff } from 'uiSrc/utils'

const getDiffTests: any[] = [
  [{ name: 'name' }, { name: 'name' }, {}],
  [{ name: '' }, { name: 'name' }, { name: '' }],
  [{ name: 'name' }, { name: '' }, { name: 'name' }],
  [{ name: 'name', port: 123 }, { name: '', port: 123 }, { name: 'name' }],
  [{ name: 'name', port: 123 }, { name: '', port: 1 }, { name: 'name', port: 123 }],
  [{ name: 'name', sshOptions: { password: 123 } }, { name: '', sshOptions: { password: 123 } }, { name: 'name' }],
  [{ name: 'name', sshOptions: { password: 123, name: 'custom' } }, { name: '', sshOptions: { password: 1, name: 'custom' } }, { name: 'name', sshOptions: { password: 123 } }],
]

describe('getDiff', () => {
  it.each(getDiffTests)('for input: %s (obj), %s (previous), should be output: %s',
    (obj, previous, expected) => {
      const result = getDiff(obj, previous)
      expect(result).toEqual(expected)
    })
})
