import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, mockedStore, render } from 'uiSrc/utils/test-utils'
import {
  TelemetryEvent,
  getRedisModulesSummary,
  sendEventTelemetry,
} from 'uiSrc/telemetry'
import {
  freeInstancesSelector,
  setDefaultInstance,
} from 'uiSrc/slices/instances/instances'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { setCapability } from 'uiSrc/slices/app/context'
import OAuthConnectFreeDb from './OAuthConnectFreeDb'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudSelector: jest.fn().mockReturnValue({
    source: 'source',
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  freeInstancesSelector: jest.fn().mockReturnValue([
    {
      id: 'instanceId',
    },
  ]),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('OAuthConnectFreeDb', () => {
  it('should render if there is a free cloud db', () => {
    const { queryByTestId } = render(<OAuthConnectFreeDb />)
    expect(queryByTestId('connect-free-db-btn')).toBeInTheDocument()
  })

  it('should send telemetry after click on connect btn', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    const { queryByTestId } = render(<OAuthConnectFreeDb id="providedId" />)

    fireEvent.click(queryByTestId('connect-free-db-btn') as HTMLButtonElement)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
      eventData: {
        databaseId: 'providedId',
        provider: undefined,
        source: OAuthSocialSource.ListOfDatabases,
        ...getRedisModulesSummary(),
      },
    })

    const expectedActions = [
      setCapability({
        source: OAuthSocialSource.ListOfDatabases,
        tutorialPopoverShown: false,
      }),
      setDefaultInstance(),
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should not render if there is no free cloud db', () => {
    ;(freeInstancesSelector as jest.Mock).mockReturnValue(null)

    const { queryByTestId } = render(<OAuthConnectFreeDb />)
    expect(queryByTestId('connect-free-db-btn')).not.toBeInTheDocument()
  })
})
