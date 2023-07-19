import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, mockedStore, render } from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { addFreeDb, oauthCloudPlanSelector } from 'uiSrc/slices/oauth/cloud'
import OAuthSelectPlan from './OAuthSelectPlan'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudPlanSelector: jest.fn().mockReturnValue({
    isOpenDialog: true,
    data: [{
      id: 12148,
      type: 'fixed',
      name: 'Cache 30MB',
      provider: 'AWS',
      region: 'eu-west-1',
      price: 0,
      details: {
        countryName: 'Poland',
        cityName: 'Warsaw',
        id: 12148,
        region: 'eu-west-1',
      }
    }]
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('OAuthSelectPlan', () => {
  it('should render', () => {
    const { queryByTestId } = render(<OAuthSelectPlan />)
    expect(queryByTestId('oauth-select-plan-dialog')).toBeInTheDocument()
  })
  it('should not render if isOpenDialog=false', () => {
    (oauthCloudPlanSelector as jest.Mock).mockReturnValueOnce({
      isOpenDialog: false,
    })
    const { queryByTestId } = render(<OAuthSelectPlan />)
    expect(queryByTestId('oauth-select-plan-dialog')).not.toBeInTheDocument()
  })

  it('should send telemetry after close modal', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    const { queryByTestId } = render(<OAuthSelectPlan />)

    const closeEl = queryByTestId('oauth-select-plan-dialog')?.querySelector('.euiModal__closeIcon')

    fireEvent.click(closeEl as HTMLButtonElement)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_PROVIDER_FORM_CLOSED
    })
  })

  it('should call addFreeDb after click on submit', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    const { queryByTestId } = render(<OAuthSelectPlan />)

    const submitEl = queryByTestId('submit-oauth-select-plan-dialog')

    fireEvent.click(submitEl as HTMLButtonElement)

    const expectedActions = [
      addFreeDb(),
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
