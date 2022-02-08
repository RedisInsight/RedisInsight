import { cloneDeep } from 'lodash'
import React from 'react'
import { processCliClient, setCliEnteringCommand } from 'uiSrc/slices/cli/cli-settings'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import CliWrapper from './CliWrapper'

jest.mock('uiSrc/slices/cli/cli-output', () => ({
  ...jest.requireActual('uiSrc/slices/cli/cli-output'),
  concatToOutput: () => jest.fn(),
}))

const redisCommandsPath = 'uiSrc/slices/app/redis-commands'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock(redisCommandsPath, () => {
  const defaultState = jest.requireActual(redisCommandsPath).initialState
  const { MOCK_COMMANDS_SPEC, MOCK_COMMANDS_ARRAY } = jest.requireActual('uiSrc/constants')
  return {
    ...jest.requireActual(redisCommandsPath),
    appRedisCommandsSelector: jest.fn().mockReturnValue({
      ...defaultState,
      spec: MOCK_COMMANDS_SPEC,
      commandsArray: Object.keys(MOCK_COMMANDS_ARRAY).sort()
    }),
  }
})

describe('CliWrapper', () => {
  it('should render', () => {
    expect(render(<CliWrapper />)).toBeTruthy()
  })
  it('Actions should be called after component will unmount', () => {
    const { unmount } = render(<CliWrapper />)

    unmount()

    const expectedActions = [processCliClient(), setCliEnteringCommand()]
    expect(store.getActions().slice(-2)).toEqual(expectedActions)
  })
})
