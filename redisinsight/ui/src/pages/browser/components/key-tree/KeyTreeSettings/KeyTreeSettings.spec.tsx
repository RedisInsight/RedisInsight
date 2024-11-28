import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { DEFAULT_DELIMITER, SortOrder } from 'uiSrc/constants'
import { resetBrowserTree, setBrowserTreeDelimiter, setBrowserTreeSort } from 'uiSrc/slices/app/context'
import {
  cleanup,
  clearStoreActions,
  fireEvent,
  mockedStore,
  render,
  screen,
  act,
  waitForEuiPopoverVisible,
} from 'uiSrc/utils/test-utils'

import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { comboBoxToArray } from 'uiSrc/utils'
import KeyTreeSettings, { Props } from './KeyTreeSettings'

const mockedProps = mock<Props>()
let store: typeof mockedStore
const APPLY_BTN = 'tree-view-apply-btn'
const TREE_SETTINGS_TRIGGER_BTN = 'tree-view-settings-btn'
const SORTING_SELECT = 'tree-view-sorting-select'
const SORTING_DESC_ITEM = 'tree-view-sorting-item-DESC'

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('KeyTreeDelimiter', () => {
  it('should render', () => {
    expect(render(<KeyTreeSettings {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('Settings button should be rendered', () => {
    render(<KeyTreeSettings {...instance(mockedProps)} />)

    expect(screen.getByTestId(TREE_SETTINGS_TRIGGER_BTN)).toBeInTheDocument()
  })

  it('Delimiter input and Sorting selector should be rendered after click on button', async () => {
    render(<KeyTreeSettings {...instance(mockedProps)} />)

    await act(async () => {
      fireEvent.click(screen.getByTestId(TREE_SETTINGS_TRIGGER_BTN))
    })
    await waitForEuiPopoverVisible()

    const comboboxInput = document
      .querySelector('[data-testid="delimiter-combobox"] [data-test-subj="comboBoxSearchInput"]') as HTMLInputElement

    expect(comboboxInput).toBeInTheDocument()
    expect(screen.getByTestId(SORTING_SELECT)).toBeInTheDocument()
  })

  it('"setBrowserTreeDelimiter" and "setBrowserTreeSort" should be called after Apply change delimiter', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    const value = 'val'
    render(<KeyTreeSettings {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId(TREE_SETTINGS_TRIGGER_BTN))
    })

    await waitForEuiPopoverVisible()

    const comboboxInput = document
      .querySelector('[data-testid="delimiter-combobox"] [data-test-subj="comboBoxSearchInput"]') as HTMLInputElement

    fireEvent.change(
      comboboxInput,
      { target: { value } }
    )

    fireEvent.keyDown(comboboxInput, { key: 'Enter', code: 13, charCode: 13 })

    const containerLabels = document.querySelector('[data-test-subj="comboBoxInput"]')!
    expect(containerLabels.querySelector(`[title="${value}"]`)).toBeInTheDocument()

    fireEvent.click(containerLabels.querySelector('[title^="Remove :"]')!)
    expect(containerLabels.querySelector('[title=":"]')).not.toBeInTheDocument()

    await act(() => {
      fireEvent.click(screen.getByTestId(SORTING_SELECT))
    })

    await waitForEuiPopoverVisible()

    await act(() => {
      fireEvent.click(screen.getByTestId(SORTING_DESC_ITEM))
    });

    (sendEventTelemetry as jest.Mock).mockRestore()

    await act(() => {
      fireEvent.click(screen.getByTestId(APPLY_BTN))
    })

    const expectedActions = [
      setBrowserTreeDelimiter([{ label: value }]),
      resetBrowserTree(),
      setBrowserTreeSort(SortOrder.DESC),
      resetBrowserTree(),
    ]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions)
    )

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TREE_VIEW_DELIMITER_CHANGED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        from: comboBoxToArray([DEFAULT_DELIMITER]),
        to: [value],
      }
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TREE_VIEW_KEYS_SORTED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        sorting: SortOrder.DESC,
      }
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('"setBrowserTreeDelimiter" should be called with DEFAULT_DELIMITER after Apply change with empty input', async () => {
    render(<KeyTreeSettings {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId(TREE_SETTINGS_TRIGGER_BTN))
    })

    await waitForEuiPopoverVisible()

    const containerLabels = document.querySelector('[data-test-subj="comboBoxInput"]')!
    fireEvent.click(containerLabels.querySelector('[title^="Remove :"]')!)
    expect(containerLabels.querySelector('[title=":"]')).not.toBeInTheDocument()

    await act(() => {
      fireEvent.click(screen.getByTestId(APPLY_BTN))
    })

    const expectedActions = [
      setBrowserTreeDelimiter([DEFAULT_DELIMITER]),
      resetBrowserTree(),
    ]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions)
    )
  })
})
