import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import CLI from './Cli'

const redisCommandsPath = 'uiSrc/slices/app/redis-commands'

jest.mock(redisCommandsPath, () => {
  const defaultState = jest.requireActual(redisCommandsPath).initialState
  return {
    ...jest.requireActual(redisCommandsPath),
    appRedisCommandsSelector: jest.fn().mockReturnValue({
      ...defaultState,
    }),
  }
})

describe('CLI', () => {
  it('should render', () => {
    expect(render(<CLI />)).toBeTruthy()
  })
})
