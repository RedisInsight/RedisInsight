import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, mockedStore, render, within } from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { addFreeDb, oauthCloudPlanSelector, oauthCloudSelector, initialState } from 'uiSrc/slices/oauth/cloud'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { MOCK_NO_TF_REGION, MOCK_REGIONS } from 'uiSrc/constants/mocks/mock-sso'
import OAuthSelectPlan from './OAuthSelectPlan'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => {
  const defaultState = jest.requireActual('uiSrc/slices/oauth/cloud').initialState
  return {
    ...jest.requireActual('uiSrc/slices/oauth/cloud'),
    oauthCloudSelector: jest.fn().mockReturnValue(defaultState),
    oauthCloudPlanSelector: jest.fn().mockReturnValue({
      isOpenDialog: true,
      data: [],
    })
  }
})

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSso: {
      flag: true,
      data: {
        selectPlan: {
          components: {
            triggersAndFunctions: [
              {
                provider: 'AWS',
                regions: ['ap-southeast-1']
              },
              {
                provider: 'GCP',
                regions: ['asia-northeast1']
              }
            ]
          }
        }
      }
    },
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('OAuthSelectPlan', () => {
  beforeEach(() => {
    (oauthCloudPlanSelector as jest.Mock).mockReturnValue({
      isOpenDialog: true,
      data: MOCK_REGIONS,
    })
  })

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

  it('if source is Trigger and Functions region with TF should be selected by default', async () => {
    (oauthCloudSelector as jest.Mock).mockReturnValue({
      ...initialState,
      source: OAuthSocialSource.TriggersAndFunctions,
    })

    const container = render(<OAuthSelectPlan />)

    const { queryByTestId } = within(container.queryByTestId('select-oauth-region') as HTMLElement)
    const tfIconEl = queryByTestId(/tf-icon-/)

    expect(tfIconEl).toBeInTheDocument()
  })

  it('should display text if no Trigger and Function regions available on this vendor', async () => {
    (oauthCloudPlanSelector as jest.Mock).mockReturnValue({
      isOpenDialog: true,
      data: [MOCK_NO_TF_REGION],
    })

    const { queryByTestId } = render(<OAuthSelectPlan />)
    const selectDescriptionEl = queryByTestId('select-region-select-description')

    expect(selectDescriptionEl).toBeInTheDocument()
    expect(selectDescriptionEl).toHaveTextContent('This vendor does not support triggers and functions capability.')
  })

  it('should display text if regions is no available on this venodor', async () => {
    (oauthCloudPlanSelector as jest.Mock).mockReturnValue({
      isOpenDialog: true,
      data: [],
    })

    const { queryByTestId } = render(<OAuthSelectPlan />)
    const selectDescriptionEl = queryByTestId('select-region-select-description')

    expect(selectDescriptionEl).toBeInTheDocument()
    expect(selectDescriptionEl).toHaveTextContent('No regions available, try another vendor.')
  })
})
