import React from 'react'
import { cloneDeep } from 'lodash'
import { act, cleanup, fireEvent, mockedStore, render, screen, waitForEuiPopoverVisible } from 'uiSrc/utils/test-utils'

import { getCapiKeys, oauthCapiKeysSelector, removeAllCapiKeys } from 'uiSrc/slices/oauth/cloud'
import { apiService } from 'uiSrc/services'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import CloudSettings from './CloudSettings'

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCapiKeysSelector: jest.fn().mockReturnValue({
    data: null,
    loading: false
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('CloudSettings', () => {
  it('should render', () => {
    expect(render(<CloudSettings />)).toBeTruthy()
  })

  it('should get api keys after render', () => {
    render(<CloudSettings />)

    expect(store.getActions()).toEqual([getCapiKeys()])
  })

  it('should be disabled delete all button', () => {
    render(<CloudSettings />)

    expect(screen.getByTestId('delete-key-btn')).toBeDisabled()
  })

  it('should show delete popover and call proper action on delete', async () => {
    (oauthCapiKeysSelector as jest.Mock).mockReturnValue({
      data: [
        {
          id: '1',
          name: 'RedisInsight-f4868252-a128-4a02-af75-bd3c99898267-2020-11-01T-123',
          createdAt: '2023-08-02T09:07:41.680Z',
          lastUsed: '2023-08-02T09:07:41.680Z',
          valid: true,
        }
      ],
      loading: false
    })
    render(<CloudSettings />)

    fireEvent.click(screen.getByTestId('delete-key-btn'))
    await waitForEuiPopoverVisible()

    fireEvent.click(screen.getByTestId('delete-key-confirm-btn'))

    expect(store.getActions().slice(-1)).toEqual([removeAllCapiKeys()])
  })

  it('should call proper telemetry events', async () => {
    apiService.delete = jest.fn().mockResolvedValueOnce({ status: 200 })
    const sendEventTelemetryMock = jest.fn()
    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock);

    (oauthCapiKeysSelector as jest.Mock).mockReturnValue({
      data: [
        {
          id: '1',
          name: 'RedisInsight-f4868252-a128-4a02-af75-bd3c99898267-2020-11-01T-123',
          createdAt: '2023-08-02T09:07:41.680Z',
          lastUsed: '2023-08-02T09:07:41.680Z',
          valid: true,
        }
      ],
      loading: false
    })
    render(<CloudSettings />)

    fireEvent.click(screen.getByTestId('delete-key-btn'))
    await waitForEuiPopoverVisible()

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEYS_REMOVE_CLICKED,
    })

    sendEventTelemetry.mockRestore()

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-key-confirm-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEYS_REMOVED,
    })

    sendEventTelemetry.mockRestore()
  })
})
