import React from 'react'
import { cloneDeep } from 'lodash'
import { render, screen, fireEvent, waitForEuiPopoverVisible, mockedStore, cleanup } from 'uiSrc/utils/test-utils'

import { bulkImportDefaultData } from 'uiSrc/slices/browser/bulkActions'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import LoadSampleData from './LoadSampleData'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '1'
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('LoadSampleData', () => {
  it('should render', () => {
    expect(render(<LoadSampleData />)).toBeTruthy()
  })

  it('should call proper actions', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<LoadSampleData />)

    fireEvent.click(screen.getByTestId('load-sample-data-btn'))
    await waitForEuiPopoverVisible()

    fireEvent.click(screen.getByTestId('load-sample-data-btn-confirm'))

    expect(store.getActions()).toEqual([bulkImportDefaultData()])

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.BROWSER_IMPORT_SAMPLES_CLICKED,
      eventData: { databaseId: '1' }
    })
  })
})
