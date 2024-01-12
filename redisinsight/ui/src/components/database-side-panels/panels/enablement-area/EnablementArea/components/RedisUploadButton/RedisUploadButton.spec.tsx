import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { customTutorialsBulkUploadSelector, uploadDataBulk } from 'uiSrc/slices/workbench/wb-custom-tutorials'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import RedisUploadButton, { Props } from './RedisUploadButton'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'databaseId',
  }),
}))

jest.mock('uiSrc/slices/workbench/wb-custom-tutorials', () => ({
  ...jest.requireActual('uiSrc/slices/workbench/wb-custom-tutorials'),
  customTutorialsBulkUploadSelector: jest.fn().mockReturnValue({
    pathsInProgress: [],
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

const props: Props = {
  label: 'Label',
  path: '/text'
}

describe('RedisUploadButton', () => {
  it('should render', () => {
    expect(render(<RedisUploadButton {...props} />)).toBeTruthy()
  })

  it('should be disabled with loading state', () => {
    (customTutorialsBulkUploadSelector as jest.Mock).mockReturnValueOnce({
      pathsInProgress: [props.path],
    })

    render(<RedisUploadButton {...props} />)

    expect(screen.getByTestId('upload-data-bulk-btn')).toBeDisabled()
  })

  it('should open warning popover and call proper actions after submit', () => {
    render(<RedisUploadButton {...props} />)

    fireEvent.click(screen.getByTestId('upload-data-bulk-btn'))

    expect(screen.getByTestId('upload-data-bulk-tooltip')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('upload-data-bulk-apply-btn'))

    const expectedActions = [uploadDataBulk(props.path)]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper telemetry events', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    render(<RedisUploadButton {...props} />)

    fireEvent.click(screen.getByTestId('upload-data-bulk-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.EXPLORE_PANEL_DATA_UPLOAD_CLICKED,
      eventData: {
        databaseId: 'databaseId'
      }
    });

    (sendEventTelemetry as jest.Mock).mockRestore()

    fireEvent.click(screen.getByTestId('upload-data-bulk-apply-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.EXPLORE_PANEL_DATA_UPLOAD_SUBMITTED,
      eventData: {
        databaseId: 'databaseId'
      }
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })
})
