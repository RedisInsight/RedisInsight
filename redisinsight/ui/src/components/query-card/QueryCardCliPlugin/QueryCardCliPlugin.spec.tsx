import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { PluginEvents } from 'uiSrc/plugins/pluginEvents'
import { pluginApi } from 'uiSrc/services/PluginAPI'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import QueryCardCliPlugin, { Props } from './QueryCardCliPlugin'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services/PluginAPI', () => ({
  pluginApi: {
    onEvent: jest.fn()
  }
}))

jest.mock('uiSrc/slices/app/plugins', () => ({
  ...jest.requireActual('uiSrc/slices/app/plugins'),
  appPluginsSelector: jest.fn().mockReturnValue({
    visualizations: [
      {
        id: '1',
        uniqId: '1',
        name: 'test',
        plugin: '',
        activationMethod: 'render',
        matchCommands: ['*'],
      }
    ]
  }),
}))

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

describe('QueryCardCliPlugin', () => {
  it('should render', () => {
    expect(render(<QueryCardCliPlugin {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should subscribes on events', () => {
    const onEventMock = jest.fn();

    (pluginApi.onEvent as jest.Mock).mockImplementation(onEventMock)

    render(<QueryCardCliPlugin {...instance(mockedProps)} id="1" />)

    expect(onEventMock).toBeCalledWith(expect.any(String), PluginEvents.heightChanged, expect.any(Function))
    expect(onEventMock).toBeCalledWith(expect.any(String), PluginEvents.loaded, expect.any(Function))
    expect(onEventMock).toBeCalledWith(expect.any(String), PluginEvents.error, expect.any(Function))
    expect(onEventMock).toBeCalledWith(expect.any(String), PluginEvents.setHeaderText, expect.any(Function))
    expect(onEventMock).toBeCalledWith(expect.any(String), PluginEvents.executeRedisCommand, expect.any(Function))
    expect(onEventMock).toBeCalledWith(expect.any(String), PluginEvents.getState, expect.any(Function))
    expect(onEventMock).toBeCalledWith(expect.any(String), PluginEvents.setState, expect.any(Function))
  })
})
