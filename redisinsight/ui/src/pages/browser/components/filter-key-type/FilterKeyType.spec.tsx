import { cloneDeep } from 'lodash'
import React from 'react'
import {
  cleanup,
  clearStoreActions,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { loadKeys, setFilter } from 'uiSrc/slices/browser/keys'
import { connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'
import { KeyTypes } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import FilterKeyType from './FilterKeyType'

let store: typeof mockedStore

const filterSelectId = 'select-filter-key-type'
const unsupportedAnchorId = 'unsupported-btn-anchor'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  connectedInstanceOverviewSelector: jest.fn().mockReturnValue({
    version: '6.2.1',
  }),
  connectedInstanceSelector: jest.fn().mockReturnValue({ id: '123' }),
}))

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('FilterKeyType', () => {
  it('should render', () => {
    expect(render(<FilterKeyType />)).toBeTruthy()
    const searchInput = screen.getByTestId(filterSelectId)
    expect(searchInput).toBeInTheDocument()
  })

  it('should not be disabled filter with database redis version > 6.0', () => {
    render(<FilterKeyType />)
    const filterSelect = screen.getByTestId(filterSelectId)

    expect(filterSelect).not.toBeDisabled()
  })

  it('should not be info anchor with database redis version > 6.0', () => {
    const { queryByTestId } = render(
      <FilterKeyType />
    )
    expect(queryByTestId(unsupportedAnchorId)).not.toBeInTheDocument()
  })

  it('"setFilter" and "loadKeys" should be called after selecte "Hash" type', () => {
    const { queryByText } = render(
      <FilterKeyType />
    )

    fireEvent.click(screen.getByTestId(filterSelectId))
    fireEvent.click(queryByText('Hash') || document)

    const expectedActions = [
      setFilter(KeyTypes.Hash),
      loadKeys(),
    ]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions)
    )
  })

  it('should be disabled filter with database redis version < 6.0', () => {
    connectedInstanceOverviewSelector.mockImplementation(() => ({
      version: '5.1',
    }))
    render(<FilterKeyType />)
    const filterSelect = screen.getByTestId(filterSelectId)

    expect(filterSelect).toBeDisabled()
  })

  it('should be info box with database redis version < 6.0', () => {
    connectedInstanceOverviewSelector.mockImplementation(() => ({
      version: '5.1',
    }))
    render(<FilterKeyType />)
    expect(screen.getByTestId(unsupportedAnchorId)).toBeInTheDocument()

    fireEvent.click(screen.getByTestId(unsupportedAnchorId))

    expect(screen.getByTestId('filter-not-available-modal')).toBeInTheDocument()
  })

  it('should send telemetry event with redis v < 6.0 after click on anchor', async () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)
    connectedInstanceOverviewSelector.mockImplementation(() => ({
      version: '5.1',
    }))

    render(<FilterKeyType />)

    fireEvent.click(screen.getByTestId(unsupportedAnchorId))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.BROWSER_FILTER_MODE_CHANGE_FAILED,
      eventData: {
        databaseId: 'instanceId',
      }
    })
  })
})
