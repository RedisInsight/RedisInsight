import { cloneDeep } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/analytics/clusterDetailsHandlers'
import { RunQueryMode } from 'uiSrc/slices/interfaces'
import { RootState } from 'uiSrc/slices/store'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
  waitForEuiToolTipVisible,
} from 'uiSrc/utils/test-utils'
import WorkbenchPage from './WorkbenchPage'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}))

jest.mock('uiSrc/slices/app/plugins', () => ({
  ...jest.requireActual('uiSrc/slices/app/plugins'),
  appPluginsSelector: jest.fn().mockReturnValue({
    visualizations: [],
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

/**
 * WorkbenchPage tests
 *
 * @group component
 */
describe('WorkbenchPage', () => {
  beforeEach(() => {
    const state: any = store.getState()

    ;(useSelector as jest.Mock).mockImplementation(
      (callback: (arg0: RootState) => RootState) =>
        callback({
          ...state,
          workbench: {
            ...state.workbench,
            results: {
              ...state.workbench.results,
              items: [
                {
                  mode: 'RAW',
                  resultsMode: 'DEFAULT',
                  id: '9dda0f6d-9265-4b15-b627-82d2eb867605',
                  databaseId: '18c37d1d-bc25-4e46-a20d-a1f9bf228946',
                  command: 'info',
                  summary: null,
                  createdAt: '2022-09-28T18:04:46.000Z',
                  emptyCommand: false,
                },
              ],
            },
          },
        }),
    )
  })

  it('should render', () => {
    expect(render(<WorkbenchPage />)).toBeTruthy()
  })
})

/**
 * WorkbenchPage tests
 *
 * @group component
 */

describe('Telemetry', () => {
  beforeEach(() => {
    const state: any = store.getState()

    ;(useSelector as jest.Mock).mockImplementation(
      (callback: (arg0: RootState) => RootState) =>
        callback({
          ...state,
          app: {
            ...state.app,
            context: {
              ...state.app.context,
              workbench: {
                ...state.app.context.workbench,
                script: 'info',
              },
            },
          },
          workbench: {
            ...state.workbench,
            results: {
              ...state.workbench.results,
              items: [
                {
                  mode: 'RAW',
                  resultsMode: 'DEFAULT',
                  id: '9dda0f6d-9265-4b15-b627-82d2eb867605',
                  databaseId: '18c37d1d-bc25-4e46-a20d-a1f9bf228946',
                  command: 'info',
                  summary: null,
                  createdAt: '2022-09-28T18:04:46.000Z',
                  emptyCommand: false,
                },
              ],
            },
          },
        }),
    )
  })

  it('should send proper eventData after changing Raw mode', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(<WorkbenchPage />)

    // turn on Raw mode
    fireEvent.click(screen.getByTestId('btn-change-mode'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.WORKBENCH_MODE_CHANGED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        changedFromMode: RunQueryMode.ASCII,
        changedToMode: RunQueryMode.Raw,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should send proper eventData without Raw mode', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(<WorkbenchPage />)

    // send command without Raw mode
    fireEvent.click(screen.getByTestId('btn-submit'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.WORKBENCH_COMMAND_SUBMITTED,
      eventData: {
        command: 'INFO',
        databaseId: INSTANCE_ID_MOCK,
        results: 'single',
        multiple: 'Single',
        pipeline: true,
        rawMode: false,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should send proper eventData with Raw mode', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(<WorkbenchPage />)

    // send command with Raw mode
    fireEvent.click(screen.getByTestId('btn-submit'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.WORKBENCH_COMMAND_SUBMITTED,
      eventData: {
        command: 'INFO',
        databaseId: INSTANCE_ID_MOCK,
        results: 'single',
        multiple: 'Single',
        pipeline: true,
        rawMode: false,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('Results: Raw mode', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(<WorkbenchPage />)

    fireEvent.click(screen.getByTestId('re-run-command'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.WORKBENCH_COMMAND_RUN_AGAIN,
      eventData: {
        auto: undefined,
        pipeline: undefined,
        command: 'INFO',
        databaseId: INSTANCE_ID_MOCK,
        multiple: 'Single',
        results: 'single',
        rawMode: true,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry on delete', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(<WorkbenchPage />)

    fireEvent.click(screen.getByTestId('delete-command'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.WORKBENCH_CLEAR_RESULT_CLICKED,
      eventData: {
        databaseId: 'instanceId',
        command: 'info',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()

    fireEvent.click(screen.getByTestId('clear-history-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.WORKBENCH_CLEAR_ALL_RESULTS_CLICKED,
      eventData: {
        databaseId: 'instanceId',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
})
describe('Raw mode', () => {
  beforeEach(() => {
    const state: any = store.getState()

    ;(useSelector as jest.Mock).mockImplementation(
      (callback: (arg0: RootState) => RootState) =>
        callback({
          ...state,
          workbench: {
            ...state.workbench,
            results: {
              ...state.workbench.results,
              items: [
                {
                  mode: 'RAW',
                  resultsMode: 'DEFAULT',
                  id: '9dda0f6d-9265-4b15-b627-82d2eb867605',
                  databaseId: '18c37d1d-bc25-4e46-a20d-a1f9bf228946',
                  command: 'info',
                  summary: null,
                  createdAt: '2022-09-28T18:04:46.000Z',
                  emptyCommand: false,
                },
              ],
            },
          },
        }),
    )
  })

  it('Verify tooltips', async () => {
    render(<WorkbenchPage />)

    await act(async () => {
      fireEvent.mouseOver(screen.getByTestId('btn-change-mode'))
    })
    await waitForEuiToolTipVisible()

    expect(screen.queryByTestId('change-mode-tooltip')).toBeInTheDocument()
  })

  it('Verify tooltips2 ', async () => {
    render(<WorkbenchPage />)

    await act(() => {
      fireEvent.mouseOver(screen.getByTestId('parameters-anchor'))
    })
    await waitForEuiToolTipVisible()

    expect(screen.getByTestId('parameters-tooltip')).toBeInTheDocument()
  })

  it('check button clickable and selected', async () => {
    render(<WorkbenchPage />)

    const btn = screen.getByTestId(/btn-change-mode/)

    expect(btn).not.toBeDisabled()
    expect(btn).toHaveStyle('background: #000 !important')

    fireEvent.click(btn)

    expect(btn).toHaveStyle(
      'background: var(--browserComponentActive) !important',
    )

    fireEvent.click(btn)

    expect(btn).toHaveStyle('background: #000 !important')
  })
})
