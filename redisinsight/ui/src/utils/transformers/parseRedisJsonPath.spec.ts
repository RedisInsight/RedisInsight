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

  it('parses keys with escaped backslashes and quotes correctly', () => {
    // single-quoted key with escaped backslash and quote
    expect(parseRedisJsonPath(`$['foo\\\\bar']`)).toEqual(['foo\\bar'])
    expect(parseRedisJsonPath(`$['She\\'s cool']`)).toEqual([`She's cool`])

    // double-quoted key with escaped quote
    expect(parseRedisJsonPath(`$["He said: \\"hi\\""]`)).toEqual([
      `He said: "hi"`,
    ])

    // tricky mix of escaped backslash and quote in single-quoted string
    expect(parseRedisJsonPath(`$['a\\\\\\'b']`)).toEqual([`a\\'b`])

    // escaped backslashes in double-quoted key
    expect(parseRedisJsonPath(`$["a\\\\b\\\\c"]`)).toEqual(['a\\b\\c'])
  })

  it('parses empty string keys', () => {
    expect(parseRedisJsonPath(`$['']`)).toEqual([''])
    expect(parseRedisJsonPath(`$[""]`)).toEqual([''])
  })
})
