import parseRedisJsonPath from './parseRedisJsonPath'

describe('parseRedisJsonPath', () => {
  it('parses empty root', () => {
    expect(parseRedisJsonPath(`$`)).toEqual([])
  })

  it('parses simple string keys', () => {
    expect(parseRedisJsonPath(`$['foo']`)).toEqual(['foo'])
  })

  it('parses multiple string keys and numbers', () => {
    expect(parseRedisJsonPath(`$['foo'][0]["bar"]`)).toEqual(['foo', 0, 'bar'])
    expect(parseRedisJsonPath(`$['array']['nested']`)).toEqual([
      'array',
      'nested',
    ])
  })

  it('parses keys with spaces and special characters', () => {
    expect(parseRedisJsonPath(`$['some key with spaces']`)).toEqual([
      'some key with spaces',
    ])
    expect(parseRedisJsonPath(`$['foo[bar]']`)).toEqual(['foo[bar]'])
  })

  it('parses keys with escaped quotes', () => {
    expect(parseRedisJsonPath(`$["redis\\" is cool name"]`)).toEqual([
      'redis" is cool name',
    ])
    expect(parseRedisJsonPath(`$['She said: \\'hello\\'']`)).toEqual([
      `She said: 'hello'`,
    ])
  })

  it('parses unicode characters', () => {
    expect(parseRedisJsonPath(`$['ключ']`)).toEqual(['ключ'])
  })

  it('parses numeric keys properly', () => {
    expect(parseRedisJsonPath(`$[0][1][2]`)).toEqual([0, 1, 2])
  })

  it('throws on invalid segments', () => {
    expect(() => parseRedisJsonPath(`$[invalid]`)).toThrow()
    expect(() => parseRedisJsonPath(`$[0]['foo'`)).toThrow()
    expect(() => parseRedisJsonPath(`foo[bar]`)).toThrow()
  })

  it('works without $ root', () => {
    expect(parseRedisJsonPath(`['foo'][0]["bar"]`)).toEqual(['foo', 0, 'bar'])
  })
})
