/*
  eslint-disable global-require
*/

Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost'
  },
  writable: true
})

describe('getOriginUrl', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })
  afterAll(() => {
    process.env = OLD_ENV
  })

  test('shoud return url with absolute path', () => {
    const { getOriginUrl } = require('../resourcesService')

    expect(getOriginUrl()).toEqual('http://localhost:5001/')
  })

  test('shoud return origin with not absolute path', () => {
    process.env.RI_APP_TYPE = 'web'
    process.env.NODE_ENV = 'production'

    const { getOriginUrl } = require('../resourcesService')
    expect(getOriginUrl()).toEqual('http://localhost')
  })
})

describe('getPathToResource', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })
  afterAll(() => {
    process.env = OLD_ENV
  })

  test('shoud return url with absolute path', () => {
    const { getPathToResource } = require('../resourcesService')

    expect(getPathToResource('data/file.txt')).toEqual('http://localhost:5001/data/file.txt')
  })

  test('shoud return origin with not absolute path', () => {
    process.env.RI_APP_TYPE = 'web'
    process.env.NODE_ENV = 'production'

    const { getPathToResource } = require('../resourcesService')
    expect(getPathToResource('data/file.txt')).toEqual('http://localhost/data/file.txt')
  })
})
